import { expect } from "chai";
import { BaseContract, EventFragment, EventLog, keccak256 } from "ethers";
import { ethers } from "hardhat";
import { defaultFactory } from "./utils/factory";

const { ZeroAddress } = ethers;

describe("renderer", function () {
  let wrappedNft: BaseContract;
  let testNft: BaseContract;
  let testRenderer: BaseContract;

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
      wrappedNft.setRenderer(testRenderer.getAddress())
    ).to.be.revertedWith("AccessControl: account");
  });

  it("access control can be applied", async function () {
    const [owner] = await ethers.getSigners();
    await wrappedNft.grantRole(
      await wrappedNft.UPDATE_RENDERER_ROLE(),
      owner.address
    );

    // This should not pass, but it does probably because of ethersv6
    // expect(wrappedNft.setRenderer(testRenderer.getAddress())).to.emit
    const tx = await wrappedNft.setRenderer(testRenderer.getAddress());
    const receipt = await tx.wait();

    const grantRoleEvent: EventLog = receipt.logs[0];
    expect(grantRoleEvent.eventName).to.equal("RoleGranted");
    expect(grantRoleEvent.args[0]).to.equal(
      await wrappedNft.EMIT_METADATA_ROLE()
    );
    expect(grantRoleEvent.args[1]).to.equal(await testRenderer.getAddress());
    const batchMetadataEvent: EventLog = receipt.logs[1];
    expect(batchMetadataEvent.eventName).to.equal("BatchMetadataUpdate");
    expect(batchMetadataEvent.args[0]).to.equal(0n);
    expect(batchMetadataEvent.args[1]).to.equal(10000n);
  });

  it("can emit metadata", async function () {
    await testRenderer.setEmittableMetadata(await wrappedNft.getAddress());
    const tx = await testRenderer.emitMetadata(1);
    const receipt = await tx.wait();
    const metadataEvent: EventLog = receipt.logs[0];

    expect(keccak256(ethers.toUtf8Bytes("MetadataUpdate(uint256)"))).to.equal(
      metadataEvent.topics[0]
    );
    expect(BigInt(metadataEvent.data)).to.equal(1n);
    expect(metadataEvent.address).to.equal(await wrappedNft.getAddress());
  });
});
