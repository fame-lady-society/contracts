import { expect } from "chai";
import { defaultFactory } from "./utils/factory";
import { ethers } from "hardhat";
import { parseEther } from "ethers";

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

  it("Can have a cost for wrapping", async function () {
    const { owner, testNft, wrappedNft } = await defaultFactory();
    const royalties = (await ethers.getSigners())[2];
    const recipient = (await ethers.getSigners())[3];
    await wrappedNft.grantRole(
      await wrappedNft.TREASURER_ROLE(),
      owner.address
    );
    await wrappedNft.setWrapCost(parseEther("0.01"));
    await wrappedNft.setDefaultRoyalty(royalties.address, 500);

    const userTestNft = testNft.connect(recipient);
    const userWrappedNft = wrappedNft.connect(recipient);

    // now mint a token
    await userTestNft.mint(recipient.address, 1);
    await userTestNft.setApprovalForAll(await wrappedNft.getAddress(), true);

    // now wrap the NFT
    await expect(userWrappedNft.wrap([1])).to.be.reverted;

    // now add some funds
    await userWrappedNft.wrap([1], { value: parseEther("0.01") });
    expect(await userTestNft.balanceOf(recipient.address)).to.equal(0n);
    expect(await userTestNft.balanceOf(await wrappedNft.getAddress())).to.equal(
      1n
    );
    expect(await userWrappedNft.balanceOf(recipient.address)).to.equal(1n);
    expect(
      await ethers.provider.getBalance(await wrappedNft.getAddress())
    ).to.equal(parseEther("0.01"));

    // Now extract funds
    await wrappedNft.withdraw();
    expect(
      await ethers.provider.getBalance(await wrappedNft.getAddress())
    ).to.equal(0);
    expect(await ethers.provider.getBalance(royalties.address)).to.equal(
      parseEther("10000.01")
    );
  });

  it("Dev can be tipped", async function () {
    const { owner, testNft, wrappedNft } = await defaultFactory();
    const royalties = (await ethers.getSigners())[2];
    const recipient = (await ethers.getSigners())[3];
    await wrappedNft.grantRole(
      await wrappedNft.TREASURER_ROLE(),
      owner.address
    );

    const userTestNft = testNft.connect(recipient);
    const userWrappedNft = wrappedNft.connect(recipient);

    // now mint a token
    await userTestNft.mint(recipient.address, 1);
    await userTestNft.setApprovalForAll(await wrappedNft.getAddress(), true);

    // now wrap the NFT
    await expect(
      userWrappedNft.wrap([1], { value: parseEther("0.01") })
    ).to.changeEtherBalance(owner.address, parseEther("0.01"));

    // now enable sales
    await wrappedNft.setWrapCost(parseEther("0.01"));
    await wrappedNft.setDefaultRoyalty(royalties.address, 500);

    // now mint a token
    await userTestNft.mint(recipient.address, 2);
    await userTestNft.setApprovalForAll(await wrappedNft.getAddress(), true);

    // now add some funds
    await expect(
      userWrappedNft.wrap([2], { value: parseEther("0.02") })
    ).to.changeEtherBalance(owner.address, parseEther("0.01"));

    // Now extract funds
    await expect(wrappedNft.withdraw()).to.changeEtherBalances(
      [await wrappedNft.getAddress(), royalties.address],
      [-parseEther("0.01"), parseEther("0.01")]
    );
  });
});
