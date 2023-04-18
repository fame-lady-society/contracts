import { expect } from "chai";
import { BaseContract } from "ethers";
import { ethers } from "hardhat";
import { defaultFactory } from "./utils/factory";

const { ZeroAddress } = ethers;

describe("royalties", function () {
  let wrappedNft: BaseContract;

  this.beforeAll(async function () {
    wrappedNft = (await defaultFactory()).wrappedNft;
  });
  it("requires access control", async function () {
    const [owner] = await ethers.getSigners();
    expect(
      wrappedNft.setDefaultRoyalty(owner.address, 1000)
    ).to.be.revertedWith("AccessControl: account");
  });

  it("access control can be applied", async function () {
    const [owner] = await ethers.getSigners();
    await wrappedNft.grantRole(
      await wrappedNft.TREASURER_ROLE(),
      owner.address
    );

    // Set the payee
    await wrappedNft.setDefaultRoyalty(owner.address, 1000);
    expect((await wrappedNft.defaultRoyaltyInfo()).receiver).to.equal(
      owner.address
    );
  });
});
