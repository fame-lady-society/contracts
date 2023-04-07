import { ethers } from "hardhat";

export async function defaultFactory() {
  const [owner] = await ethers.getSigners();

  const TestNFT = await ethers.getContractFactory("TestNFT");
  const testNft = await TestNFT.deploy("Test", "TST", "");

  // wrapped NFT
  const WrappedNFT = await ethers.getContractFactory("WrappedNFT");
  const wrappedNft = await WrappedNFT.deploy(
    "Wrapped NFT",
    "wNFT",
    await testNft.getAddress(),
    await testNft.getAddress()
  );

  return { owner, testNft, wrappedNft };
}
