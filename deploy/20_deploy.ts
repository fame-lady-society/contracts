import { HardhatRuntimeEnvironment } from "hardhat/types";
import {
  DeployFunction,
  Deployment,
  DeploymentsExtension,
} from "hardhat-deploy/types";
import {
  envWrappedTokenAddress,
  envWrappedTokenName,
  envWrappedTokenSymbol,
} from "../utils/env";
import { isAddress } from "ethers";

const func: DeployFunction = async function ({
  deployments,
  getNamedAccounts,
  network,
}) {
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();
  let wrappedTokenAddress = envWrappedTokenAddress(network.name);
  if (!isAddress(wrappedTokenAddress)) {
    const testNft = await deployments.get("TestNFT");
    wrappedTokenAddress = testNft.address;
  }
  const wrappedTokenName = envWrappedTokenName(network.name);
  const wrappedTokenSymbol = envWrappedTokenSymbol(network.name);

  let wrappedTokenRendererAddress = envWrappedTokenAddress(network.name);
  if (!isAddress(wrappedTokenRendererAddress)) {
    const testNft = await deployments.get("TestNFT");
    wrappedTokenRendererAddress = testNft.address;
  }

  await deploy("WrappedNFT", {
    from: deployer,
    log: true,
    args: [
      wrappedTokenName,
      wrappedTokenSymbol,
      wrappedTokenAddress,
      wrappedTokenRendererAddress,
    ],
  });
};
func.tags = ["deploy"];
export default func;
