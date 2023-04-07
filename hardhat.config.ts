import fs from "fs";
import "@nomiclabs/hardhat-ethers";
import "hardhat-gas-reporter";
import "hardhat-deploy";
import "@nomicfoundation/hardhat-chai-matchers";
import "@nomiclabs/hardhat-etherscan";
import "dotenv/config";
import { Wallet } from "ethers";
import {
  envDeploymentKeyFile,
  envDeploymentKeyPassword,
  envEtherscanApiKey,
  envRpc,
} from "./utils/env";
import { HardhatUserConfig, task } from "hardhat/config";

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
  });
});

const [goerliWallet] = ["goerli"].map((network) =>
  Wallet.fromEncryptedJsonSync(
    fs.readFileSync(envDeploymentKeyFile(network), "utf8"),
    envDeploymentKeyPassword(network)
  )
);

export default {
  solidity: "0.8.18",
  gasReporter: {
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
  },
  namedAccounts: {
    deployer: 0,
  },
  networks: {
    goerli: {
      url: envRpc("goerli"),
      accounts: [goerliWallet.privateKey],
    },
  },
  etherscan: {
    apiKey: {
      goerli: envEtherscanApiKey("goerli"),
    },
  },
} as HardhatUserConfig;
