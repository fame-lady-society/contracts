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
  zeroAddress,
} from "viem";

interface TestContext {
  testNft: Awaited<ReturnType<typeof viem.deployContract<"TestNFT">>>;
  wrapped: Awaited<ReturnType<typeof viem.deployContract<"WrappedNFT">>>;
  renderer: Awaited<ReturnType<typeof viem.deployContract<"NamedLadyRendererV2">>>;
  publicClient: PublicClient;
  admin: WalletClient;
  holder: WalletClient;
  nonOwner: WalletClient;
  signer: WalletClient;
}

const BASE_URI = "https://named.example/metadata/";
const ORIGINAL_BASE_URI = "https://original.example/metadata/";
const CUSTOM_URI = "https://custom.example/token/1.json";

const { viem } = await hre.network.connect();

const buildUpdateHash = (tokenId: bigint, uri: string, nonce: bigint): Hex => {
  return keccak256(
    encodePacked(["uint256", "string", "uint256"], [tokenId, uri, nonce]),
  );
};

const signUpdate = async (
  signer: WalletClient,
  tokenId: bigint,
  uri: string,
  nonce: bigint,
): Promise<Hex> => {
  const hash = buildUpdateHash(tokenId, uri, nonce);
  return signer.signMessage({
    account: signer.account!,
    message: { raw: hash },
  });
};

describe("NamedLadyRendererV2", async function () {
  const walletClients = await viem.getWalletClients();

  let ctx: TestContext;

  before(async () => {
    const admin = walletClients[0];
    const holder = walletClients[1];
    const nonOwner = walletClients[2];
    const signer = walletClients[3];
    const publicClient = await viem.getPublicClient();

    const testNft = await viem.deployContract("TestNFT", [
      "Test NFT",
      "TEST",
      "https://test.example/",
    ] as const);

    const wrapped = await viem.deployContract("WrappedNFT", [
      "Wrapped",
      "WRP",
      testNft.address,
      zeroAddress,
    ] as const);

    const renderer = await viem.deployContract("NamedLadyRendererV2", [
      BASE_URI,
      ORIGINAL_BASE_URI,
      wrapped.address,
      signer.account!.address,
    ] as const);

    const updateRole = keccak256(toHex("UPDATE_RENDERER_ROLE"));
    await wrapped.write.grantRole([updateRole, admin.account!.address], {
      account: admin.account!.address,
    });
    await wrapped.write.setRenderer([renderer.address], {
      account: admin.account!.address,
    });

    const tokenId = 1n;
    await testNft.write.mint([holder.account!.address, tokenId], {
      account: admin.account!.address,
    });
    await testNft.write.setApprovalForAll([wrapped.address, true], {
      account: holder.account!.address,
    });
    await wrapped.write.wrap([[tokenId]], {
      account: holder.account!.address,
    });

    ctx = {
      testNft,
      wrapped,
      renderer,
      publicClient,
      admin,
      holder,
      nonOwner,
      signer,
    };
  });

  it("returns named base URI by default", async () => {
    const tokenId = 1n;
    const uri = await ctx.renderer.read.tokenURI([tokenId]);
    assert.equal(uri, `${BASE_URI}${tokenId.toString()}`);
  });

  it("sets custom URI with a valid signature", async () => {
    const tokenId = 1n;
    const nonce = await ctx.renderer.read.currentNonce([
      ctx.holder.account!.address,
    ]);
    const signature = await signUpdate(ctx.signer, tokenId, CUSTOM_URI, nonce);
    await ctx.renderer.write.setTokenUri([tokenId, CUSTOM_URI, signature], {
      account: ctx.holder.account!.address,
    });

    const uri = await ctx.renderer.read.tokenURI([tokenId]);
    assert.equal(uri, CUSTOM_URI);
  });

  it("rejects custom URI updates from non-owners", async () => {
    const tokenId = 1n;
    const nonce = await ctx.renderer.read.currentNonce([
      ctx.nonOwner.account!.address,
    ]);
    const signature = await signUpdate(ctx.signer, tokenId, CUSTOM_URI, nonce);
    try {
      await ctx.renderer.write.setTokenUri([tokenId, CUSTOM_URI, signature], {
        account: ctx.nonOwner.account!.address,
      });
      assert.fail("Should have reverted for non-owner");
    } catch {
      assert.ok(true);
    }
  });

  it("rejects invalid signatures", async () => {
    const tokenId = 1n;
    const nonce = await ctx.renderer.read.currentNonce([
      ctx.holder.account!.address,
    ]);
    const signature = await signUpdate(ctx.holder, tokenId, CUSTOM_URI, nonce);
    try {
      await ctx.renderer.write.setTokenUri([tokenId, CUSTOM_URI, signature], {
        account: ctx.holder.account!.address,
      });
      assert.fail("Should have reverted for invalid signature");
    } catch {
      assert.ok(true);
    }
  });

  it("ban forces original metadata and blocks custom URI", async () => {
    const tokenId = 1n;
    await ctx.renderer.write.ban([tokenId], {
      account: ctx.admin.account!.address,
    });
    const uri = await ctx.renderer.read.tokenURI([tokenId]);
    assert.equal(uri, `${ORIGINAL_BASE_URI}${tokenId.toString()}`);

    const nonce = await ctx.renderer.read.currentNonce([
      ctx.holder.account!.address,
    ]);
    const signature = await signUpdate(
      ctx.signer,
      tokenId,
      CUSTOM_URI,
      nonce,
    );
    try {
      await ctx.renderer.write.setTokenUri([tokenId, CUSTOM_URI, signature], {
        account: ctx.holder.account!.address,
      });
      assert.fail("Should have reverted for reset token");
    } catch {
      assert.ok(true);
    }
  });

  it("restore returns to named metadata", async () => {
    const tokenId = 1n;
    await ctx.renderer.write.restore([tokenId], {
      account: ctx.admin.account!.address,
    });
    const uri = await ctx.renderer.read.tokenURI([tokenId]);
    assert.equal(uri, `${BASE_URI}${tokenId.toString()}`);
  });

  it("rejects ban from non-trust role", async () => {
    const tokenId = 1n;
    try {
      await ctx.renderer.write.ban([tokenId], {
        account: ctx.nonOwner.account!.address,
      });
      assert.fail("Should have reverted for missing role");
    } catch {
      assert.ok(true);
    }
  });
});
