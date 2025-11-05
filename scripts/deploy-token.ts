/**
 * POI代币部署脚本
 * 
 * 使用方法:
 * npx tsx scripts/deploy-token.ts
 * 
 * 环境变量:
 * - PRIVATE_KEY: 部署者私钥
 * - RPC_URL: 以太坊RPC节点URL
 * - NETWORK: 网络名称 (mainnet/sepolia/base/arbitrum等)
 */

import { ethers } from "ethers";
import * as fs from "fs";
import * as path from "path";

// 网络配置
const NETWORKS: Record<string, { rpcUrl: string; chainId: number; explorer: string }> = {
  mainnet: {
    rpcUrl: "https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY",
    chainId: 1,
    explorer: "https://etherscan.io"
  },
  sepolia: {
    rpcUrl: "https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY",
    chainId: 11155111,
    explorer: "https://sepolia.etherscan.io"
  },
  base: {
    rpcUrl: "https://mainnet.base.org",
    chainId: 8453,
    explorer: "https://basescan.org"
  },
  "base-sepolia": {
    rpcUrl: "https://sepolia.base.org",
    chainId: 84532,
    explorer: "https://sepolia.basescan.org"
  },
  arbitrum: {
    rpcUrl: "https://arb1.arbitrum.io/rpc",
    chainId: 42161,
    explorer: "https://arbiscan.io"
  },
  polygon: {
    rpcUrl: "https://polygon-rpc.com",
    chainId: 137,
    explorer: "https://polygonscan.com"
  }
};

async function main() {
  console.log("🚀 开始部署 POI Token...\n");

  // 获取环境变量
  const privateKey = process.env.PRIVATE_KEY;
  const network = process.env.NETWORK || "sepolia";
  
  if (!privateKey) {
    throw new Error("请设置 PRIVATE_KEY 环境变量");
  }

  // 获取网络配置
  const networkConfig = NETWORKS[network];
  if (!networkConfig) {
    throw new Error(`不支持的网络: ${network}。支持的网络: ${Object.keys(NETWORKS).join(", ")}`);
  }

  const rpcUrl = process.env.RPC_URL || networkConfig.rpcUrl;

  console.log(`📡 网络: ${network}`);
  console.log(`🔗 RPC: ${rpcUrl}`);
  console.log(`🔍 区块浏览器: ${networkConfig.explorer}\n`);

  // 连接到网络
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  
  console.log(`👛 部署地址: ${wallet.address}`);
  
  // 检查余额
  const balance = await wallet.getBalance();
  console.log(`💰 余额: ${ethers.utils.formatEther(balance)} ETH\n`);

  if (balance.eq(0)) {
    throw new Error("账户余额为0，请充值后再部署");
  }

  // 读取合约代码
  const contractPath = path.join(__dirname, "../contracts/POIToken.sol");
  if (!fs.existsSync(contractPath)) {
    throw new Error("找不到合约文件: " + contractPath);
  }

  // 注意: 这里需要先编译合约
  // 你可以使用 Hardhat, Foundry 或在线编译器 (Remix) 来编译
  console.log("⚠️  请先使用 Hardhat 或 Foundry 编译合约");
  console.log("或访问 https://remix.ethereum.org 在线编译\n");
  
  // 合约字节码和ABI (需要从编译输出中获取)
  // 这里提供一个示例结构
  const contractABI = [
    "constructor()",
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function totalSupply() view returns (uint256)",
    "function balanceOf(address) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function mint(address to, uint256 amount)",
    "function burn(uint256 amount)",
    "event Transfer(address indexed from, address indexed to, uint256 value)"
  ];

  // 提示用户提供编译后的字节码
  console.log("📝 部署步骤:");
  console.log("1. 使用 Hardhat 编译合约: npx hardhat compile");
  console.log("2. 或使用 Remix IDE 在线编译");
  console.log("3. 获取编译后的 bytecode");
  console.log("4. 将 bytecode 替换到此脚本中");
  console.log("\n继续执行需要编译后的合约字节码...\n");

  // 模拟部署流程（需要实际的 bytecode）
  console.log("💡 合约信息:");
  console.log("   名称: Proof of Influence");
  console.log("   符号: POI");
  console.log("   小数位: 18");
  console.log("   初始供应: 1,000,000,000 POI");
  console.log("\n⏳ 等待编译后的字节码以继续部署...\n");
  
  // 保存部署信息模板
  const deployInfo = {
    network: network,
    chainId: networkConfig.chainId,
    deployer: wallet.address,
    timestamp: new Date().toISOString(),
    // contractAddress: "", // 部署后填写
    // transactionHash: "", // 部署后填写
    explorer: networkConfig.explorer,
    tokenInfo: {
      name: "Proof of Influence",
      symbol: "POI",
      decimals: 18,
      initialSupply: "1000000000000000000000000000" // 1 billion with 18 decimals
    }
  };

  // 保存部署信息
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFile = path.join(deploymentsDir, `poi-token-${network}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deployInfo, null, 2));
  
  console.log(`✅ 部署配置已保存: ${deploymentFile}`);
  console.log("\n📚 下一步: 编译合约并运行部署");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 部署失败:", error);
    process.exit(1);
  });


