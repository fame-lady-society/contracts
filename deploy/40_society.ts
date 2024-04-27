import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function ({
  viem,
  deployments,
  getNamedAccounts,
}) {
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();
  // await viem.deployContract("SocietyShowcase", []);

  await deploy("SocietyShowcase", {
    from: deployer,
    log: true,
    args: [],
  });
};
func.tags = ["society"];
export default func;
