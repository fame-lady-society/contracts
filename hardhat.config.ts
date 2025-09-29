import fs from "fs";
import "hardhat-gas-reporter";
import "hardhat-deploy";
import "@typechain/hardhat";
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-viem";
import "@nomicfoundation/hardhat-chai-matchers";
import "@nomicfoundation/hardhat-verify";
import "dotenv/config";
import { Wallet } from "ethers";
import {
  envDeploymentKeyFile,
  envDeploymentKeyPassword,
  envEtherscanApiKey,
  envRpc,
  envSignerPrivateKey,
} from "./utils/env";
import { HardhatUserConfig, task } from "hardhat/config";

task("verify:bulknft", async (args, { deployments, run }) => {
  const testNft = await deployments.get("BulkMinter");
  await run("verify:verify", {
    address: testNft.address,
    constructorArguments: testNft.args,
  });
});

task("verify:testnft", async (args, { deployments, run }) => {
  const testNft = await deployments.get("TestNFT");
  await run("verify:verify", {
    address: testNft.address,
    constructorArguments: testNft.args,
  });
});

task("verify:wrappednft", async (args, { deployments, run }) => {
  const wrappedNft = await deployments.get("WrappedNFT");
  await run("verify:verify", {
    address: wrappedNft.address,
    constructorArguments: wrappedNft.args,
    contract: "contracts/WrappedNFT.sol:WrappedNFT",
  });
});

task("verify:named", async (args, { deployments, run }) => {
  const contract = await deployments.get("NamedLadyRenderer");
  await run("verify:verify", {
    address: contract.address,
    constructorArguments: contract.args,
    contract: "contracts/NamedLadyRenderer.sol:NamedLadyRenderer",
  });
});

task("verify:rescuer", async (args, { deployments, run }) => {
  const contract = await deployments.get("Rescuer");
  await run("verify:verify", {
    address: contract.address,
    constructorArguments: contract.args,
    contract: "contracts/Rescuer.sol:Rescuer",
  });
});

task("verify:society", async (args, { deployments, run }) => {
  const contract = await deployments.get("SocietyShowcase");
  await run("verify:verify", {
    address: contract.address,
    constructorArguments: contract.args,
    contract: "contracts/SocietyShowcase.sol:SocietyShowcase",
  });
});

const [polygonWallet, sepoliaWallet, mainnetWallet] = [
  "polygon",
  "sepolia",
  "homestead",
].map((network) =>
  Wallet.fromEncryptedJsonSync(
    fs.readFileSync(envDeploymentKeyFile(network), "utf8"),
    envDeploymentKeyPassword(network),
  ),
);

export default {
  solidity: "0.8.24",
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
  },
  namedAccounts: {
    deployer: 0,
    signer: 1,
  },
  networks: {
    sepolia: {
      url: envRpc("sepolia"),
      accounts: [sepoliaWallet.privateKey, envSignerPrivateKey("sepolia")],
    },
    homestead: {
      url: envRpc("homestead"),
      accounts: [mainnetWallet.privateKey],
    },
    polygon: {
      url: envRpc("polygon"),
      accounts: [polygonWallet.privateKey],
    },
  },
  etherscan: {
    apiKey: {
      mainnet: envEtherscanApiKey("mainnet"),
      goerli: envEtherscanApiKey("sepolia"),
      polygon: envEtherscanApiKey("polygon"),
    },
  },
} as HardhatUserConfig;
