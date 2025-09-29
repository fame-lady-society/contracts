import { DeployFunction } from "hardhat-deploy/types";
import { WrappedNFT__factory } from "../typechain-types";

const func: DeployFunction = async function ({
  viem,
  deployments,
  getNamedAccounts,
  ethers,
}) {
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();
  const vaultAddress = "0xCDF3e235A04624d7f23909EbBaD008Db2c54e1cF";

  const wrappedNft = await deployments.get("FameLadySociety");

  const wrappedNftDonationVault = await deploy("WrappedNFTDonationVault", {
    from: deployer,
    log: true,
    args: [wrappedNft.address, vaultAddress],
  });

  // const wrappedNftContract = WrappedNFT__factory.connect(
  //   wrappedNft.address,
  //   await ethers.getSigner(deployer),
  // );

  // await wrappedNftContract.grantRole(
  //   await wrappedNftContract.TREASURER_ROLE(),
  //   wrappedNftDonationVault.address,
  // );
};

func.tags = ["vault"];

export default func;
