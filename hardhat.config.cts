import "@nomiclabs/hardhat-ethers";
import { type HardhatUserConfig } from "hardhat/config";
import dotenv from "dotenv";

dotenv.config();

const defaultAccounts = process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [];

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    mainnet: {
      url: process.env.MAINNET_RPC_URL ?? "https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY",
      accounts: defaultAccounts,
      chainId: 1,
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL ?? "https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY",
      accounts: defaultAccounts,
      chainId: 11155111,
    },
    base: {
      url: process.env.BASE_RPC_URL ?? "https://mainnet.base.org",
      accounts: defaultAccounts,
      chainId: 8453,
      gasPrice: 1_000_000_000,
    },
    "base-sepolia": {
      url: process.env.BASE_SEPOLIA_RPC_URL ?? "https://sepolia.base.org",
      accounts: defaultAccounts,
      chainId: 84532,
    },
    arbitrum: {
      url: process.env.ARBITRUM_RPC_URL ?? "https://arb1.arbitrum.io/rpc",
      accounts: defaultAccounts,
      chainId: 42161,
    },
    polygon: {
      url: process.env.POLYGON_RPC_URL ?? "https://polygon-rpc.com",
      accounts: defaultAccounts,
      chainId: 137,
    },
  },
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY ?? "",
      sepolia: process.env.ETHERSCAN_API_KEY ?? "",
      base: process.env.BASESCAN_API_KEY ?? "",
      arbitrumOne: process.env.ARBISCAN_API_KEY ?? "",
      polygon: process.env.POLYGONSCAN_API_KEY ?? "",
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;

