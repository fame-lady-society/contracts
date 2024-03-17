import { expect } from "chai";
import { BaseContract, ContractTransactionResponse, EventLog } from "ethers";
import hre from "hardhat";
import { ethers } from "hardhat";
import { http, createWalletClient, encodePacked, keccak256 } from "viem";
import { hardhat } from "viem/chains";
import { defaultFactory } from "./utils/factory";
import { TestNFT, TestRenderer, WrappedNFT } from "../typechain-types";
import { ArtifactsMap } from "hardhat/types";

describe("renderer", function () {
  let wrappedNft: WrappedNFT & {
    deploymentTransaction(): ContractTransactionResponse;
  };
  let testNft: TestNFT & {
    deploymentTransaction(): ContractTransactionResponse;
  };
  let testRenderer: TestRenderer & {
    deploymentTransaction(): ContractTransactionResponse;
  };

  async function setupAndMintToken(tokenId: number) {
    const [owner, signer, __, user] = await ethers.getSigners();
    const [ownerWalletClient, signerWalletClient, userWalletClient] =
      await hre.viem.getWalletClients();
    const NamedRenderer = await ethers.getContractFactory("NamedLadyRenderer");
    const namedRenderer = await NamedRenderer.deploy(
      "ipfs://abc/",
      await wrappedNft.getAddress(),
      signer.address,
    );

    const tokenUri = await namedRenderer.tokenURI(tokenId);
    expect(tokenUri).to.equal(`ipfs://abc/${tokenId}`);

    // now mint a token
    await testNft.mint(owner.address, tokenId);
    await testNft.setApprovalForAll(await wrappedNft.getAddress(), true);

    // send the NFT to the wrapped NFT
    await wrappedNft.wrap([tokenId]);

    await wrappedNft.setRenderer(await namedRenderer.getAddress());

    expect(await wrappedNft.tokenURI(tokenId)).to.equal(tokenUri);

    return {
      namedRenderer,
      owner,
      signer,
      user,
      ownerWalletClient,
      signerWalletClient,
      userWalletClient,
    };
  }

  this.beforeAll(async function () {
    const c = await defaultFactory();
    wrappedNft = c.wrappedNft;
    testNft = c.testNft;
    const TestRenderer = await ethers.getContractFactory("TestRenderer");
    testRenderer = await TestRenderer.deploy();
  });
  it("has access control", async function () {
    const [owner, rando] = await ethers.getSigners();
    expect(
      wrappedNft.setRenderer(testRenderer.getAddress()),
    ).to.be.revertedWith("AccessControl: account");
  });

  it("access control can be applied", async function () {
    const [owner] = await ethers.getSigners();
    await wrappedNft.grantRole(
      await wrappedNft.UPDATE_RENDERER_ROLE(),
      owner.address,
    );

    // This should not pass, but it does probably because of ethersv6
    // expect(wrappedNft.setRenderer(testRenderer.getAddress())).to.emit
    const tx = await wrappedNft.setRenderer(testRenderer.getAddress());
    const receipt = await tx.wait();

    const grantRoleEvent = receipt?.logs[0] as EventLog;
    expect(grantRoleEvent.eventName).to.equal("RoleGranted");
    expect(grantRoleEvent.args[0]).to.equal(
      await wrappedNft.EMIT_METADATA_ROLE(),
    );
    expect(grantRoleEvent.args[1]).to.equal(await testRenderer.getAddress());
    const batchMetadataEvent = receipt?.logs[1] as EventLog;
    expect(batchMetadataEvent.eventName).to.equal("BatchMetadataUpdate");
    expect(batchMetadataEvent.args[0]).to.equal(0n);
    expect(batchMetadataEvent.args[1]).to.equal(10000n);
  });

  it("can emit metadata", async function () {
    await testRenderer.setEmittableMetadata(await wrappedNft.getAddress());
    const tx = await testRenderer.emitMetadata(1);
    const receipt = await tx.wait();
    const metadataEvent = receipt.logs[0] as EventLog;

    expect(keccak256(ethers.toUtf8Bytes("MetadataUpdate(uint256)"))).to.equal(
      metadataEvent.topics[0],
    );
    expect(BigInt(metadataEvent.data)).to.equal(1n);
    expect(metadataEvent.address).to.equal(await wrappedNft.getAddress());
  });

  it("can submit a signed NamedLadyRenderer request", async function () {
    const tokenId = 0n;
    const { namedRenderer, signerWalletClient, owner } =
      await setupAndMintToken(0);

    const tokenUriRequest = encodePacked(
      ["uint256", "string", "uint256"],
      [tokenId, "ipfs://000", await namedRenderer.currentNonce(owner.address)],
    );
    const signature = await signerWalletClient.signMessage({
      message: {
        raw: keccak256(tokenUriRequest),
      },
    });

    // now submit a request to change the tokenURI
    await namedRenderer.setTokenUri(0, "ipfs://000", signature);

    expect(await wrappedNft.tokenURI(0)).to.equal("ipfs://000");
  });

  it("only owner of token can submit the setTokenUri request", async function () {
    const tokenId = 1n;
    const { namedRenderer, user, signerWalletClient, owner } =
      await setupAndMintToken(1);

    const tokenUriRequest = encodePacked(
      ["uint256", "string", "uint256"],
      [tokenId, "ipfs://000", await namedRenderer.currentNonce(owner.address)],
    );
    const signature = await signerWalletClient.signMessage({
      message: {
        raw: keccak256(tokenUriRequest),
      },
    });

    // now submit a request to change the tokenURI
    await expect(
      namedRenderer.connect(user).setTokenUri(1, "ipfs://000", signature),
    ).revertedWithCustomError(namedRenderer, "NotTokenOwnerOrApproved()");
  });

  it("can be banned", async function () {
    const tokenId = 2n;
    const { namedRenderer, signerWalletClient, owner, signer } =
      await setupAndMintToken(2);
    const tokenUriRequest = encodePacked(
      ["uint256", "string", "uint256"],
      [tokenId, "ipfs://002", await namedRenderer.currentNonce(owner.address)],
    );
    const signature = await signerWalletClient.signMessage({
      message: {
        raw: keccak256(tokenUriRequest),
      },
    });

    // now submit a request to change the tokenURI
    await namedRenderer.setTokenUri(tokenId, "ipfs://002", signature);
    expect(await namedRenderer.tokenURI(tokenId)).to.equal("ipfs://002");
    await namedRenderer.ban(tokenId);
    expect(await namedRenderer.tokenURI(tokenId)).to.equal("ipfs://abc/2");
  });

  it("only owner can ban", async function () {
    const tokenId = 3n;
    const { namedRenderer, signer } = await setupAndMintToken(Number(tokenId));

    // only owner can ban
    await expect(
      namedRenderer.connect(signer).ban(tokenId),
    ).to.be.revertedWithCustomError(namedRenderer, "Unauthorized()");
  });
});
