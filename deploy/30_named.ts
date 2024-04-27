import { DeployFunction } from "hardhat-deploy/types";
import { envBaseURI } from "../utils/env";
import { FameLadySociety__factory } from "../typechain-types";

const func: DeployFunction = async function ({
  deployments,
  getNamedAccounts,
  network,
  viem,
  ethers,
}) {
  const { deploy, get } = deployments;

  const { deployer } = await getNamedAccounts();
  const baseURI = envBaseURI(network.name);

  const [_, signerWalletClient] = await viem.getWalletClients();
  const [__, signerAddress] = await signerWalletClient.getAddresses();

  const flsDeploy = await get("FameLadySociety");
  const fls = FameLadySociety__factory.connect(
    flsDeploy.address,
    await ethers.getSigner(deployer),
  );

  const namedFameLadyRenderer = await deploy("NamedLadyRenderer", {
    from: deployer,
    log: true,
    args: [baseURI, flsDeploy.address, signerAddress],
  });

  await fls.setRenderer(namedFameLadyRenderer.address);
};
func.tags = ["named"];
export default func;
