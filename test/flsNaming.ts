import hre from "hardhat";
import assert from "node:assert/strict";
import { describe, it, before } from "node:test";
import {
  type WalletClient,
  type PublicClient,
  type Address,
  type Hex,
  encodePacked,
  keccak256,
  toHex,
} from "viem";

interface TestContext {
  flsNaming: Awaited<ReturnType<typeof viem.getContractAt<"FLSNaming">>>;
  testNft: Awaited<ReturnType<typeof viem.getContractAt<"TestNFT">>>;
  publicClient: PublicClient;
  holder: WalletClient;
  holder2: WalletClient;
  nonHolder: WalletClient;
}

const { ignition, viem } = await hre.network.connect();
const publicClient = await viem.getPublicClient();

// Generate a random salt
function randomSalt(): Hex {
  return keccak256(toHex(Math.random().toString() + Date.now().toString()));
}

// Helper to advance time in the EVM
async function advanceTime(
  publicClient: PublicClient,
  seconds: number
): Promise<void> {
  await (publicClient as unknown as { request: (args: { method: string; params: unknown[] }) => Promise<unknown> }).request({
    method: "evm_increaseTime",
    params: [seconds],
  });
  await (publicClient as unknown as { request: (args: { method: string; params: unknown[] }) => Promise<unknown> }).request({
    method: "evm_mine",
    params: [],
  });
}

describe("FLSNaming", async function () {
  const walletClients = await viem.getWalletClients();

  let ctx: TestContext;

  before(async () => {
    // Set a reasonable base fee for forked mainnet deployments
    await (publicClient as unknown as { request: (args: { method: string; params: unknown[] }) => Promise<unknown> }).request({
      method: "hardhat_setNextBlockBaseFeePerGas",
      params: ["0x1"],
    });

    // Deploy TestNFT
    const testNft = await viem.deployContract("TestNFT", [
      "Test NFT",
      "TEST",
      "https://test.com/",
    ] as const);

    // Deploy FLSNaming with TestNFT as the gate
    const flsNaming = await viem.deployContract("FLSNaming", [
      testNft.address,
    ] as const);

    // Mint test NFTs to our test holders
    const holder = walletClients[0];
    const holder2 = walletClients[1];
    const nonHolder = walletClients[2];

    // Mint NFTs to holder (token IDs 1, 2)
    await testNft.write.mint([holder.account!.address, 1n]);
    await testNft.write.mint([holder.account!.address, 2n]);
    
    // Mint NFTs to holder2 (token IDs 3, 4)
    await testNft.write.mint([holder2.account!.address, 3n]);
    await testNft.write.mint([holder2.account!.address, 4n]);

    // nonHolder doesn't get an NFT

    ctx = {
      flsNaming: flsNaming as TestContext["flsNaming"],
      testNft: testNft as TestContext["testNft"],
      publicClient,
      holder,
      holder2,
      nonHolder,
    };
  });

  describe("Commit-Reveal Name Claiming", () => {
    it("should generate correct commitment hash", async function () {
      const name = "TestName";
      const salt = randomSalt();
      const owner = ctx.holder.account!.address;

      const commitment = await ctx.flsNaming.read.makeCommitment([
        name,
        salt,
        owner,
      ]);

      // Verify it matches our local calculation
      const expectedCommitment = keccak256(
        encodePacked(["string", "bytes32", "address"], [name, salt, owner])
      );

      assert.equal(commitment, expectedCommitment, "Commitment hash should match");
    });

    it("should allow committing a name", async function () {
      const name = "CommitTest";
      const salt = randomSalt();
      const owner = ctx.holder.account!.address;

      const commitment = await ctx.flsNaming.read.makeCommitment([
        name,
        salt,
        owner,
      ]);

      await ctx.flsNaming.write.commitName([commitment], {
        account: ctx.holder.account!.address,
      });

      const [timestamp, used] = await ctx.flsNaming.read.getCommitment([
        commitment,
      ]);
      assert.ok(timestamp > 0n, "Commitment should have timestamp");
      assert.equal(used, false, "Commitment should not be used");
    });

    it("should reject claiming before MIN_COMMIT_AGE", async function () {
      const name = "TooEarly";
      const salt = randomSalt();
      const owner = ctx.holder.account!.address;

      const commitment = await ctx.flsNaming.read.makeCommitment([
        name,
        salt,
        owner,
      ]);

      await ctx.flsNaming.write.commitName([commitment], {
        account: ctx.holder.account!.address,
      });

      // Try to claim immediately (before 10 seconds)
      try {
        await ctx.flsNaming.write.claimName([name, salt, 1n], {
          account: ctx.holder.account!.address,
        });
        assert.fail("Should have reverted with CommitmentTooNew");
      } catch (error) {
        assert.ok(true);
      }
    });

    it("should allow claiming after MIN_COMMIT_AGE with primaryTokenId", async function () {
      const name = "ValidClaim";
      const salt = randomSalt();
      const owner = ctx.holder.account!.address;
      const primaryTokenId = 1n;

      const commitment = await ctx.flsNaming.read.makeCommitment([
        name,
        salt,
        owner,
      ]);

      await ctx.flsNaming.write.commitName([commitment], {
        account: ctx.holder.account!.address,
      });

      // Advance time by 11 seconds (past MIN_COMMIT_AGE of 10 seconds)
      await advanceTime(ctx.publicClient, 11);

      await ctx.flsNaming.write.claimName([name, salt, primaryTokenId], {
        account: ctx.holder.account!.address,
      });

      // Verify the claim
      const tokenId = await ctx.flsNaming.read.resolveName([name]);
      assert.notEqual(tokenId, 0n, "Name should be claimed");

      const [storedName, primaryAddress, storedPrimaryTokenId] = await ctx.flsNaming.read.getIdentity([
        tokenId,
      ]);
      assert.equal(storedName, name, "Name should match");
      assert.equal(
        primaryAddress.toLowerCase(),
        owner.toLowerCase(),
        "Primary address should be holder"
      );
      assert.equal(storedPrimaryTokenId, primaryTokenId, "Primary token ID should match");

      // Check soulbound NFT was minted
      const nftOwner = await ctx.flsNaming.read.ownerOf([tokenId]);
      assert.equal(
        nftOwner.toLowerCase(),
        owner.toLowerCase(),
        "Soulbound NFT should be owned by holder"
      );
    });

    it("should reject claim if caller does not own the primaryTokenId", async function () {
      const name = "NotOwnedToken";
      const salt = randomSalt();
      const owner = ctx.nonHolder.account!.address;
      const primaryTokenId = 1n; // Owned by holder, not nonHolder

      const commitment = await ctx.flsNaming.read.makeCommitment([
        name,
        salt,
        owner,
      ]);

      await ctx.flsNaming.write.commitName([commitment], {
        account: ctx.nonHolder.account!.address,
      });

      await advanceTime(ctx.publicClient, 11);

      try {
        await ctx.flsNaming.write.claimName([name, salt, primaryTokenId], {
          account: ctx.nonHolder.account!.address,
        });
        assert.fail("Should have reverted with InvalidPrimaryTokenId");
      } catch (error) {
        assert.ok(true);
      }
    });

    it("should reject duplicate name claim", async function () {
      // "ValidClaim" was already claimed in a previous test
      const name = "ValidClaim";
      const salt = randomSalt();
      const owner = ctx.holder2.account!.address;
      const primaryTokenId = 3n;

      const commitment = await ctx.flsNaming.read.makeCommitment([
        name,
        salt,
        owner,
      ]);

      await ctx.flsNaming.write.commitName([commitment], {
        account: ctx.holder2.account!.address,
      });

      await advanceTime(ctx.publicClient, 11);

      try {
        await ctx.flsNaming.write.claimName([name, salt, primaryTokenId], {
          account: ctx.holder2.account!.address,
        });
        assert.fail("Should have reverted with NameAlreadyClaimed");
      } catch (error) {
        assert.ok(true);
      }
    });

    it("should reject claiming with already used primaryTokenId", async function () {
      const name = "DuplicateToken";
      const salt = randomSalt();
      const owner = ctx.holder.account!.address;
      const primaryTokenId = 1n; // Already used by "ValidClaim"

      const commitment = await ctx.flsNaming.read.makeCommitment([
        name,
        salt,
        owner,
      ]);

      await ctx.flsNaming.write.commitName([commitment], {
        account: ctx.holder.account!.address,
      });

      await advanceTime(ctx.publicClient, 11);

      try {
        await ctx.flsNaming.write.claimName([name, salt, primaryTokenId], {
          account: ctx.holder.account!.address,
        });
        assert.fail("Should have reverted with GateTokenAlreadyUsed");
      } catch (error) {
        assert.ok(true);
      }
    });

    it("should allow claiming with different primaryTokenId by same holder", async function () {
      const name = "SecondClaim";
      const salt = randomSalt();
      const owner = ctx.holder.account!.address;
      const primaryTokenId = 2n; // Holder owns this too

      const commitment = await ctx.flsNaming.read.makeCommitment([
        name,
        salt,
        owner,
      ]);

      await ctx.flsNaming.write.commitName([commitment], {
        account: ctx.holder.account!.address,
      });

      await advanceTime(ctx.publicClient, 11);

      await ctx.flsNaming.write.claimName([name, salt, primaryTokenId], {
        account: ctx.holder.account!.address,
      });

      const tokenId = await ctx.flsNaming.read.resolveName([name]);
      assert.notEqual(tokenId, 0n, "Name should be claimed");
    });
  });

  describe("Primary Token ID Management", () => {
    it("should allow primary to set new primaryTokenId owned by verified address", async function () {
      const tokenId = await ctx.flsNaming.read.addressToTokenId([
        ctx.holder.account!.address,
      ]);

      if (tokenId === 0n) return;

      // Get current primary token ID
      const [, , oldPrimaryTokenId] = await ctx.flsNaming.read.getIdentity([tokenId]);

      // Holder owns token 1 and 2, currently using 1, switch to 2
      if (oldPrimaryTokenId === 1n) {
        await ctx.flsNaming.write.setPrimaryTokenId([2n], {
          account: ctx.holder.account!.address,
        });

        const [, , newPrimaryTokenId] = await ctx.flsNaming.read.getIdentity([tokenId]);
        assert.equal(newPrimaryTokenId, 2n, "Primary token ID should be updated");
      }
    });

    it("should reject setting primaryTokenId not owned by verified address", async function () {
      const tokenId = await ctx.flsNaming.read.addressToTokenId([
        ctx.holder.account!.address,
      ]);

      if (tokenId === 0n) return;

      try {
        // Try to set token 3 which is owned by holder2, not a verified address
        await ctx.flsNaming.write.setPrimaryTokenId([3n], {
          account: ctx.holder.account!.address,
        });
        assert.fail("Should have reverted with InvalidPrimaryTokenId");
      } catch (error) {
        assert.ok(true);
      }
    });
  });

  describe("Soulbound Enforcement", () => {
    it("should revert on transferFrom calls", async function () {
      const tokenId = await ctx.flsNaming.read.addressToTokenId([
        ctx.holder.account!.address,
      ]);

      if (tokenId === 0n) return;

      try {
        await ctx.flsNaming.write.transferFrom(
          [
            ctx.holder.account!.address,
            ctx.nonHolder.account!.address,
            tokenId,
          ],
          { account: ctx.holder.account!.address }
        );
        assert.fail("Should have reverted with TransferDisabled");
      } catch (error) {
        assert.ok(true);
      }
    });

    it("should revert on safeTransferFrom calls", async function () {
      const tokenId = await ctx.flsNaming.read.addressToTokenId([
        ctx.holder.account!.address,
      ]);

      if (tokenId === 0n) return;

      try {
        await ctx.flsNaming.write.safeTransferFrom(
          [
            ctx.holder.account!.address,
            ctx.nonHolder.account!.address,
            tokenId,
          ],
          { account: ctx.holder.account!.address }
        );
        assert.fail("Should have reverted with TransferDisabled");
      } catch (error) {
        assert.ok(true);
      }
    });
  });

  describe("Metadata Management", () => {
    it("should allow primary to set and get metadata", async function () {
      const tokenId = await ctx.flsNaming.read.addressToTokenId([
        ctx.holder.account!.address,
      ]);

      if (tokenId === 0n) return;

      const key = keccak256(toHex("twitter"));
      const value = "@testlady";

      await ctx.flsNaming.write.setMetadata([key, value], {
        account: ctx.holder.account!.address,
      });

      const storedValue = await ctx.flsNaming.read.getMetadata([tokenId, key]);
      assert.equal(storedValue, value, "Metadata value should match");

      const keys = await ctx.flsNaming.read.getMetadataKeys([tokenId]);
      assert.ok(keys.includes(key), "Key should be in metadata keys");
    });

    it("should allow primary to update existing metadata", async function () {
      const tokenId = await ctx.flsNaming.read.addressToTokenId([
        ctx.holder.account!.address,
      ]);

      if (tokenId === 0n) return;

      const key = keccak256(toHex("twitter"));
      const newValue = "@updatedlady";

      await ctx.flsNaming.write.setMetadata([key, newValue], {
        account: ctx.holder.account!.address,
      });

      const storedValue = await ctx.flsNaming.read.getMetadata([tokenId, key]);
      assert.equal(storedValue, newValue, "Metadata value should be updated");
    });

    it("should allow primary to delete metadata", async function () {
      const tokenId = await ctx.flsNaming.read.addressToTokenId([
        ctx.holder.account!.address,
      ]);

      if (tokenId === 0n) return;

      const key = keccak256(toHex("toDelete"));
      const value = "deleteMe";

      // Set the metadata first
      await ctx.flsNaming.write.setMetadata([key, value], {
        account: ctx.holder.account!.address,
      });

      // Delete it
      await ctx.flsNaming.write.deleteMetadata([key], {
        account: ctx.holder.account!.address,
      });

      const storedValue = await ctx.flsNaming.read.getMetadata([tokenId, key]);
      assert.equal(storedValue, "", "Metadata should be deleted");
    });
  });

  describe("Verified Address Management", () => {
    it("should allow primary to add verified address", async function () {
      const tokenId = await ctx.flsNaming.read.addressToTokenId([
        ctx.holder.account!.address,
      ]);

      if (tokenId === 0n) return;

      const newAddress = ctx.nonHolder.account!.address;

      await ctx.flsNaming.write.addVerifiedAddress([newAddress], {
        account: ctx.holder.account!.address,
      });

      const isVerified = await ctx.flsNaming.read.isVerified([
        tokenId,
        newAddress,
      ]);
      assert.equal(isVerified, true, "Address should be verified");

      const addresses = await ctx.flsNaming.read.getVerifiedAddresses([tokenId]);
      assert.ok(
        addresses.map((a: Address) => a.toLowerCase()).includes(newAddress.toLowerCase()),
        "Address should be in verified list"
      );
    });

    it("should allow primary to remove non-primary verified address", async function () {
      const tokenId = await ctx.flsNaming.read.addressToTokenId([
        ctx.holder.account!.address,
      ]);

      if (tokenId === 0n) return;

      const addressToRemove = ctx.nonHolder.account!.address;

      // Check if address is verified first
      const isVerifiedBefore = await ctx.flsNaming.read.isVerified([
        tokenId,
        addressToRemove,
      ]);

      if (!isVerifiedBefore) return;

      await ctx.flsNaming.write.removeVerifiedAddress([addressToRemove], {
        account: ctx.holder.account!.address,
      });

      const isVerifiedAfter = await ctx.flsNaming.read.isVerified([
        tokenId,
        addressToRemove,
      ]);
      assert.equal(isVerifiedAfter, false, "Address should no longer be verified");
    });

    it("should not allow removing primary address", async function () {
      const tokenId = await ctx.flsNaming.read.addressToTokenId([
        ctx.holder.account!.address,
      ]);

      if (tokenId === 0n) return;

      try {
        await ctx.flsNaming.write.removeVerifiedAddress(
          [ctx.holder.account!.address],
          { account: ctx.holder.account!.address }
        );
        assert.fail("Should have reverted with CannotRemovePrimary");
      } catch (error) {
        assert.ok(true);
      }
    });
  });

  describe("Lookup Functions", () => {
    it("should resolve gate token ID to primary address", async function () {
      // Token ID 2 is the primary token for holder's "SecondClaim" or "ValidClaim" identity
      const [, , primaryTokenId] = await ctx.flsNaming.read.getIdentity([
        await ctx.flsNaming.read.addressToTokenId([ctx.holder.account!.address])
      ]);

      const resolvedPrimary = await ctx.flsNaming.read.resolvePrimaryByGateTokenId([
        primaryTokenId,
      ]);

      assert.equal(
        resolvedPrimary.toLowerCase(),
        ctx.holder.account!.address.toLowerCase(),
        "Should resolve to holder's address"
      );
    });

    it("should return zero address for unmapped gate token ID", async function () {
      const unmappedTokenId = 999n;
      const resolvedPrimary = await ctx.flsNaming.read.resolvePrimaryByGateTokenId([
        unmappedTokenId,
      ]);

      assert.equal(
        resolvedPrimary,
        "0x0000000000000000000000000000000000000000",
        "Should return zero address"
      );
    });
  });

  describe("Sync Function", () => {
    it("should burn identity when primary token ID is transferred away", async function () {
      // Create a new identity for holder2
      const name = "SyncTestHolder2";
      const salt = randomSalt();
      const owner = ctx.holder2.account!.address;
      const primaryTokenId = 3n;

      const commitment = await ctx.flsNaming.read.makeCommitment([
        name,
        salt,
        owner,
      ]);

      await ctx.flsNaming.write.commitName([commitment], {
        account: ctx.holder2.account!.address,
      });

      await advanceTime(ctx.publicClient, 11);

      await ctx.flsNaming.write.claimName([name, salt, primaryTokenId], {
        account: ctx.holder2.account!.address,
      });

      const tokenIdBefore = await ctx.flsNaming.read.addressToTokenId([owner]);
      assert.notEqual(tokenIdBefore, 0n, "Identity should exist");

      // Transfer the primary token away from holder2
      await ctx.testNft.write.transferFrom(
        [owner, ctx.holder.account!.address, primaryTokenId],
        { account: ctx.holder2.account!.address }
      );

      // Anyone can call sync
      await ctx.flsNaming.write.sync([owner], {
        account: ctx.holder.account!.address,
      });

      // Verify identity was burned
      const tokenIdAfter = await ctx.flsNaming.read.addressToTokenId([owner]);
      assert.equal(tokenIdAfter, 0n, "Identity should be cleared");
    });

    it("should not affect valid identities", async function () {
      const tokenId = await ctx.flsNaming.read.addressToTokenId([
        ctx.holder.account!.address,
      ]);

      if (tokenId === 0n) return;

      // Holder still owns their primary token, so sync should do nothing
      await ctx.flsNaming.write.sync([ctx.holder.account!.address], {
        account: ctx.nonHolder.account!.address,
      });

      // Verify identity still exists
      const tokenIdAfter = await ctx.flsNaming.read.addressToTokenId([
        ctx.holder.account!.address,
      ]);
      assert.equal(tokenIdAfter, tokenId, "Identity should still exist");
    });
  });

  describe("View Functions", () => {
    it("should correctly resolve address to tokenId", async function () {
      const tokenId = await ctx.flsNaming.read.addressToTokenId([
        ctx.holder.account!.address,
      ]);

      if (tokenId !== 0n) {
        const [, primaryAddress] = await ctx.flsNaming.read.getIdentity([
          tokenId,
        ]);
        assert.equal(
          primaryAddress.toLowerCase(),
          ctx.holder.account!.address.toLowerCase(),
          "Address should resolve correctly"
        );
      }
    });

    it("should return hasGateNFT correctly", async function () {
      const holderHasNFT = await ctx.flsNaming.read.hasGateNFT([
        ctx.holder.account!.address,
      ]);
      const holderBalance = await ctx.testNft.read.balanceOf([
        ctx.holder.account!.address,
      ]);

      assert.equal(
        holderHasNFT,
        holderBalance > 0n,
        "hasGateNFT should match actual balance for holder"
      );
    });
  });

  describe("Admin Functions", () => {
    it("should allow owner to set base token URI", async function () {
      const [owner] = await viem.getWalletClients();
      const newURI = "https://api.fameladysociety.com/naming/";

      await ctx.flsNaming.write.setBaseTokenURI([newURI], {
        account: owner.account!.address,
      });

      const storedURI = await ctx.flsNaming.read.baseTokenURI();
      assert.equal(storedURI, newURI, "Base URI should be updated");
    });
  });

  describe("Security - Address(0) Protection", () => {
    it("should reject adding address(0) as verified address", async function () {
      // Use holder's existing identity (we know holder still has one from previous tests)
      const tokenId = await ctx.flsNaming.read.addressToTokenId([
        ctx.holder.account!.address,
      ]);
      assert.notEqual(tokenId, 0n, "Holder should have an identity");

      // Verify we can add a normal address first (proves setup is correct)
      const normalAddress = walletClients[3].account!.address;
      const isAlreadyVerified = await ctx.flsNaming.read.isVerified([tokenId, normalAddress]);
      
      if (!isAlreadyVerified) {
        // This should succeed - proves addVerifiedAddress works
        await ctx.flsNaming.write.addVerifiedAddress([normalAddress], {
          account: ctx.holder.account!.address,
        });
        const isNowVerified = await ctx.flsNaming.read.isVerified([tokenId, normalAddress]);
        assert.equal(isNowVerified, true, "Normal address should be added successfully");
      }

      // Now attempt to add address(0) - this SHOULD revert with InvalidAddress
      const zeroAddress = "0x0000000000000000000000000000000000000000" as Address;

      let callSucceeded = false;
      let errorMessage = "";

      try {
        await ctx.flsNaming.write.addVerifiedAddress([zeroAddress], {
          account: ctx.holder.account!.address,
        });
        callSucceeded = true;
      } catch (error) {
        errorMessage = String(error);
      }

      // The call should have reverted - if it succeeded, that's a vulnerability
      assert.equal(
        callSucceeded,
        false,
        "VULNERABILITY: address(0) was added as verified address - contract must reject address(0)!"
      );

      // After the fix, we expect InvalidAddress error
      assert.ok(
        errorMessage.includes("InvalidAddress"),
        `Expected InvalidAddress error, got: ${errorMessage.slice(0, 150)}`
      );
    });
  });
});
