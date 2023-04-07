import { expect } from "chai";
import { defaultFactory } from "./utils/factory";

describe("WrapNFT", function () {
  it("Single NFT round trip", async function () {
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
});
