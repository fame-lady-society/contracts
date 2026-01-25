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

function loadWallet(network: string) {
  try {
    const keyFile = envDeploymentKeyFile(network);
    const password = envDeploymentKeyPassword(network);
    
    if (!keyFile || !password || !fs.existsSync(keyFile)) {
      return null;
    }
    
    return Wallet.fromEncryptedJsonSync(
      fs.readFileSync(keyFile, "utf8"),
      password,
    );
  } catch (error) {
    console.warn(`Failed to load wallet for ${network}:`, (error as Error).message);
    return null;
  }
}

const polygonWallet = loadWallet("polygon");
const sepoliaWallet = loadWallet("sepolia");
const baseSepoliaWallet = loadWallet("baseSepolia");
const mainnetWallet = loadWallet("homestead");

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
    profiles: {
      default: {
        version: "0.8.24",
      },
      lowop: {
        version: "0.8.24",
        settings: {
          optimizer: {
            enabled: true,
            runs: 2000,
          },
        },
      },
    },
    npmFilesToBuild: [
      "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol",
      "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol",
      "seaport-types/src/interfaces/SeaportInterface.sol",
    ],
  },
  networks: {
    ...(process.env.HOMESTEAD_RPC
      ? {
          ["hardhat-seaport"]: {
            forking: {
              url: process.env.HOMESTEAD_RPC,
              blockNumber: 23863154,
            },
            chainId: 1,
            type: "edr-simulated" as const,
          },
        }
      : {}),
    ...(sepoliaWallet && envRpc("sepolia")
      ? {
          sepolia: {
            url: envRpc("sepolia"),
            accounts: [
              sepoliaWallet.privateKey,
              ...(envSignerPrivateKey("sepolia") ? [envSignerPrivateKey("sepolia")] : []),
            ],
            type: "http" as const,
          },
        }
      : {}),
    
    ...(mainnetWallet && envRpc("homestead")
      ? {
          homestead: {
            url: envRpc("homestead"),
            accounts: [mainnetWallet.privateKey],
            type: "http" as const,
          },
        }
      : {}),
    ...(polygonWallet && envRpc("polygon")
      ? {
          polygon: {
            url: envRpc("polygon"),
            accounts: [polygonWallet.privateKey],
            type: "http" as const,
          },
        }
      : {}),
    ...(baseSepoliaWallet && envRpc("baseSepolia")
      ? {
          "base-sepolia": {
            url: envRpc("baseSepolia"),
            accounts: [baseSepoliaWallet.privateKey],
            type: "http" as const,
          },
        }
      : {}),
  },
  verify: {
    etherscan: {
      apiKey: envEtherscanApiKey("mainnet") || "dummy-key",
      enabled: !!envEtherscanApiKey("mainnet"),
    },
  },
});
