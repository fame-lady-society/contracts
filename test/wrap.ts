import { expect } from "chai";
import { defaultFactory } from "./utils/factory";
import { ethers } from "hardhat";

describe("WrapNFT", function () {
  it("Single NFT round trip using safeTransferFrom", async function () {
    const { owner, testNft, wrappedNft } = await defaultFactory();

    // now mint a token
    await testNft.mint(owner.address, 1);

    // send the NFT to the wrapped NFT
    await testNft.safeTransferFrom(
      owner.address,
      await wrappedNft.getAddress(),
      1
    );

    expect(await testNft.balanceOf(owner.address)).to.equal(0n);
    expect(await testNft.balanceOf(await wrappedNft.getAddress())).to.equal(1n);
    expect(await wrappedNft.balanceOf(owner.address)).to.equal(1n);

    // now unwrap the NFT
    await wrappedNft.unwrap(owner.address, 1);

    expect(await testNft.balanceOf(owner.address)).to.equal(1n);
    expect(await testNft.balanceOf(await wrappedNft.getAddress())).to.equal(0n);
    expect(await wrappedNft.balanceOf(owner.address)).to.equal(0n);
  });

  it("Single NFT round trip using wrap", async function () {
    const { owner, testNft, wrappedNft } = await defaultFactory();

    // now mint a token
    await testNft.mint(owner.address, 1);
    await testNft.setApprovalForAll(await wrappedNft.getAddress(), true);

    // send the NFT to the wrapped NFT
    await wrappedNft.wrap([1]);

    expect(await testNft.balanceOf(owner.address)).to.equal(0n);
    expect(await testNft.balanceOf(await wrappedNft.getAddress())).to.equal(1n);
    expect(await wrappedNft.balanceOf(owner.address)).to.equal(1n);

    // now unwrap the NFT
    await wrappedNft.unwrap(owner.address, 1);

    expect(await testNft.balanceOf(owner.address)).to.equal(1n);
    expect(await testNft.balanceOf(await wrappedNft.getAddress())).to.equal(0n);
    expect(await wrappedNft.balanceOf(owner.address)).to.equal(0n);
  });

  it("Single NFT round trip using wrapTo", async function () {
    const { owner, testNft, wrappedNft } = await defaultFactory();
    const recipient = (await ethers.getSigners())[3];

    // now mint a token
    await testNft.mint(owner.address, 1);
    await testNft.setApprovalForAll(await wrappedNft.getAddress(), true);

    // send the NFT to the wrapped NFT
    await wrappedNft.wrapTo(recipient.address, [1]);

    expect(await testNft.balanceOf(owner.address)).to.equal(0n);
    expect(await testNft.balanceOf(await wrappedNft.getAddress())).to.equal(1n);
    expect(await wrappedNft.balanceOf(recipient.address)).to.equal(1n);

    // now unwrap the NFT
    await wrappedNft.connect(recipient).unwrap(owner.address, 1);

    expect(await testNft.balanceOf(owner.address)).to.equal(1n);
    expect(await testNft.balanceOf(await wrappedNft.getAddress())).to.equal(0n);
    expect(await wrappedNft.balanceOf(recipient.address)).to.equal(0n);
  });
});
