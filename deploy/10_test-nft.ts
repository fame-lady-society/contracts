import { HardhatRuntimeEnvironment } from "hardhat/types";
import {
  DeployFunction,
  Deployment,
  DeploymentsExtension,
} from "hardhat-deploy/types";
import { envBaseURI, envTestName, envTestSymbol } from "../utils/env";

const func: DeployFunction = async function ({
  deployments,
  getNamedAccounts,
  network,
}) {
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();
  const baseURI = envBaseURI(network.name);
  const testTokenName = envTestName(network.name);
  const testTokenSymbol = envTestSymbol(network.name);

  await deploy("TestNFT", {
    from: deployer,
    log: true,
    args: [testTokenName, testTokenSymbol, baseURI],
  });
};
func.tags = ["test"];
export default func;
