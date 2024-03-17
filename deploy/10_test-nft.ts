import { HardhatRuntimeEnvironment } from "hardhat/types";
import {
  DeployFunction,
  Deployment,
  DeploymentsExtension,
} from "hardhat-deploy/types";
import {
  envBaseURI,
  envSignerPrivateKey,
  envTestName,
  envTestSymbol,
  envWrappedTokenName,
  envWrappedTokenSymbol,
} from "../utils/env";
import { WrappedNFT__factory } from "../typechain-types";
import { ContractName } from "@nomicfoundation/hardhat-viem/types";

const func: DeployFunction = async function ({
  deployments,
  getNamedAccounts,
  network,
  viem,
  ethers,
}) {
  const { deploy, getArtifact } = deployments;

  const { deployer } = await getNamedAccounts();
  const baseURI = envBaseURI(network.name);
  const testTokenName = envTestName(network.name);
  const testTokenSymbol = envTestSymbol(network.name);

  const bulkMinter = await deploy("BulkMinter", {
    from: deployer,
    log: true,
    args: [testTokenName, testTokenSymbol, baseURI],
  });

  const [_, signerWalletClient] = await viem.getWalletClients();
  const [__, signerAddress] = await signerWalletClient.getAddresses();

  const wrappedTokenName = envWrappedTokenName(network.name);
  const wrappedTokenSymbol = envWrappedTokenSymbol(network.name);

  const wrappedNft = await deploy("WrappedNFT", {
    from: deployer,
    log: true,
    args: [
      wrappedTokenName,
      wrappedTokenSymbol,
      bulkMinter.address,
      bulkMinter.address,
    ],
    waitConfirmations: 1,
  });

  const wrappedNftContract = WrappedNFT__factory.connect(
    wrappedNft.address,
    await ethers.getSigner(deployer),
  );

  console.log(`Signer address: ${signerAddress}`);

  const namedFameLadyRenderer = await deploy("NamedLadyRenderer", {
    from: deployer,
    log: true,
    args: [
      "ipfs://QmTngWTnURuyiz1gtoY33FKghCiU2uQusXpnUc36QJNKsY/",
      wrappedNft.address,
      signerAddress,
    ],
  });
  if (
    !(await wrappedNftContract.hasRole(
      await wrappedNftContract.UPDATE_RENDERER_ROLE(),
      deployer,
    ))
  ) {
    await wrappedNftContract.grantRole(
      await wrappedNftContract.UPDATE_RENDERER_ROLE(),
      deployer,
    );
  }

  await wrappedNftContract.setRenderer(namedFameLadyRenderer.address);
};
func.tags = ["test"];
export default func;
