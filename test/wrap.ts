import { expect } from "chai";
import { Typed } from "ethers";
import { ethers } from "hardhat";

describe("WrapNFT", function () {
  it("Single NFT round trip", async function () {
    const [owner] = await ethers.getSigners();

    const TestNFT = await ethers.getContractFactory("TestNFT");
    const testNft = await TestNFT.deploy();

    // wrapped NFT
    const WrappedNFT = await ethers.getContractFactory("WrappedNFT");
    const wrappedNft = await WrappedNFT.deploy(
      "Wrapped NFT",
      "wNFT",
      await testNft.getAddress(),
      await testNft.getAddress()
    );

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
});
