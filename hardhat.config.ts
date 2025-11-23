import fs from "fs";
import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import hardhatVerify from "@nomicfoundation/hardhat-verify";
import "dotenv/config";
import { Wallet } from "ethers";
import {
  envDeploymentKeyFile,
  envDeploymentKeyPassword,
  envEtherscanApiKey,
  envRpc,
  envSignerPrivateKey,
} from "./utils/env.js";
import { HardhatUserConfig, defineConfig, task } from "hardhat/config";
import { hardhat } from "viem/chains";

// task("verify:bulknft").setAction(async (args, { deployments, run }) => {
//   const testNft = await deployments.get("BulkMinter");
//   await run("verify:verify", {
//     address: testNft.address,
//     constructorArguments: testNft.args,
//   });
// });

// task("verify:testnft", async (args, { deployments, run }) => {
//   const testNft = await deployments.get("TestNFT");
//   await run("verify:verify", {
//     address: testNft.address,
//     constructorArguments: testNft.args,
//   });
// });

// task("verify:wrappednft", async (args, { deployments, run }) => {
//   const wrappedNft = await deployments.get("WrappedNFT");
//   await run("verify:verify", {
//     address: wrappedNft.address,
//     constructorArguments: wrappedNft.args,
//     contract: "contracts/WrappedNFT.sol:WrappedNFT",
//   });
// });

// task("verify:named", async (args, { deployments, run }) => {
//   const contract = await deployments.get("NamedLadyRenderer");
//   await run("verify:verify", {
//     address: contract.address,
//     constructorArguments: contract.args,
//     contract: "contracts/NamedLadyRenderer.sol:NamedLadyRenderer",
//   });
// });

// task("verify:rescuer", async (args, { deployments, run }) => {
//   const contract = await deployments.get("Rescuer");
//   await run("verify:verify", {
//     address: contract.address,
//     constructorArguments: contract.args,
//     contract: "contracts/Rescuer.sol:Rescuer",
//   });
// });

// task("verify:society", async (args, { deployments, run }) => {
//   const contract = await deployments.get("SocietyShowcase");
//   await run("verify:verify", {
//     address: contract.address,
//     constructorArguments: contract.args,
//     contract: "contracts/SocietyShowcase.sol:SocietyShowcase",
//   });
// });

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

export default defineConfig({
  // gasReporter: {
  //   enabled: process.env.REPORT_GAS === "true",
  //   currency: "USD",
  //   coinmarketcap: process.env.COINMARKETCAP_API_KEY,
  // },

  // namedAccounts: {
  //   deployer: 0,
  //   signer: 1,
  // },
  plugins: [hardhatToolboxViemPlugin, hardhatVerify],
  solidity: {
    compilers: [
      {
        version: "0.8.24",
      },
    ],
    npmFilesToBuild: [
      "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol",
      "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol",
      "seaport-types/src/interfaces/SeaportInterface.sol",
    ],
  },
  networks: {
    ["hardhat-seaport"]: {
      forking: {
        url: process.env.HOMESTEAD_RPC!,
        blockNumber: 23860332,
      },
      type: "edr-simulated",
    },
    sepolia: {
      url: envRpc("sepolia"),
      accounts: [sepoliaWallet.privateKey, envSignerPrivateKey("sepolia")],
      type: "http",
    },
    homestead: {
      url: envRpc("homestead"),
      accounts: [mainnetWallet.privateKey],
      type: "http",
    },
    polygon: {
      url: envRpc("polygon"),
      accounts: [polygonWallet.privateKey],
      type: "http",
    },
  },
  verify: {
    etherscan: {
      apiKey: envEtherscanApiKey("mainnet"),
      enabled: true,
      // apiKey: {
      //   mainnet: envEtherscanApiKey("mainnet"),
      //   goerli: envEtherscanApiKey("sepolia"),
      //   polygon: envEtherscanApiKey("polygon"),
      // },
    },
  },
});
