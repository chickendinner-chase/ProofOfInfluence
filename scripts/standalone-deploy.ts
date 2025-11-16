/**
 * 独立POI代币部署脚本 (不依赖Hardhat环境)
 * 
 * 使用方法:
 * NETWORK=base-sepolia npx tsx scripts/standalone-deploy.ts
 */

import { ethers } from "ethers";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config();

// 网络RPC配置
const NETWORK_CONFIG: Record<string, { rpc: string; chainId: number; name: string }> = {
  "mainnet": {
    rpc: process.env.MAINNET_RPC_URL || "https://eth.llamarpc.com",
    chainId: 1,
    name: "mainnet"
  },
  "sepolia": {
    rpc: process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org",
    chainId: 11155111,
    name: "sepolia"
  },
  "base": {
    rpc: process.env.BASE_RPC_URL || "https://mainnet.base.org",
    chainId: 8453,
    name: "base"
  },
  "base-sepolia": {
    rpc: process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org",
    chainId: 84532,
    name: "base-sepolia"
  },
  "arbitrum": {
    rpc: process.env.ARBITRUM_RPC_URL || "https://arb1.arbitrum.io/rpc",
    chainId: 42161,
    name: "arbitrum"
  },
  "polygon": {
    rpc: process.env.POLYGON_RPC_URL || "https://polygon-rpc.com",
    chainId: 137,
    name: "polygon"
  }
};

// Uniswap V2 Router 地址
const UNISWAP_V2_ROUTER: Record<string, string> = {
  mainnet: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
  sepolia: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
  base: "0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24",
  "base-sepolia": "0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24",
  arbitrum: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
  polygon: "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff",
};

// WETH 地址
const WETH_ADDRESS: Record<string, string> = {
  mainnet: "0xC02aaA39b223FE8D0A0E5C4F27eAD9083C756Cc2",
  sepolia: "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9",
  base: "0x4200000000000000000000000000000000000006",
  "base-sepolia": "0x4200000000000000000000000000000000000006",
  arbitrum: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
  polygon: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
};

// POI Token合约字节码和ABI (需要从编译输出中读取)
async function getPOITokenArtifact() {
  const artifactPath = path.join(process.cwd(), "artifacts/contracts/POIToken.sol/POIToken.json");
  if (!fs.existsSync(artifactPath)) {
    throw new Error("合约未编译，请先运行: npm run compile");
  }
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf-8"));
  return {
    abi: artifact.abi,
    bytecode: artifact.bytecode
  };
}

async function main() {
  console.log("🚀 开始部署 POI Token...\n");

  const network = process.env.NETWORK || "sepolia";
  const privateKey = process.env.PRIVATE_KEY;

  if (!privateKey) {
    throw new Error("请设置 PRIVATE_KEY 环境变量");
  }

  const networkConfig = NETWORK_CONFIG[network];
  if (!networkConfig) {
    throw new Error(`不支持的网络: ${network}。支持的网络: ${Object.keys(NETWORK_CONFIG).join(", ")}`);
  }

  console.log(`📡 网络: ${network} (Chain ID: ${networkConfig.chainId})`);
  console.log(`🔗 RPC: ${networkConfig.rpc}\n`);

  // 连接到网络
  const provider = new ethers.providers.JsonRpcProvider(networkConfig.rpc);
  const wallet = new ethers.Wallet(privateKey, provider);

  console.log(`👛 部署者: ${wallet.address}`);

  const balance = await wallet.getBalance();
  console.log(`💰 余额: ${ethers.utils.formatEther(balance)} ETH\n`);

  if (balance.eq(0)) {
    throw new Error("账户余额为0，请充值后再部署");
  }

  // 获取合约artifact
  const { abi, bytecode } = await getPOITokenArtifact();

  // ============================================
  // 1. 部署 POI Token
  // ============================================
  console.log("📝 1. 部署 POI Token 合约...");

  const POITokenFactory = new ethers.ContractFactory(abi, bytecode, wallet);
  const initialSupply = ethers.utils.parseUnits(process.env.POI_INITIAL_SUPPLY ?? "1000000000", 18);
  const poiToken = await POITokenFactory.deploy(wallet.address, wallet.address, initialSupply);
  
  console.log(`   交易已发送，等待确认...`);
  const deployReceipt = await poiToken.deployTransaction.wait(2); // 等待2个区块确认
  console.log(`✅ POI Token 已部署: ${poiToken.address}`);
  console.log(`   区块: ${deployReceipt.blockNumber}`);

  // 等待一下确保合约可以被调用
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const totalSupply = await poiToken.totalSupply();
  console.log(`   总供应量: ${ethers.utils.formatEther(totalSupply)} POI\n`);

  // ============================================
  // 2. 准备添加流动性
  // ============================================
  console.log("🌊 2. 准备添加 Uniswap V2 流动性...\n");

  const routerAddress = UNISWAP_V2_ROUTER[network];
  const wethAddress = WETH_ADDRESS[network];

  if (!routerAddress || !wethAddress) {
    console.log(`⚠️  网络 ${network} 未配置 Uniswap V2 Router`);
    console.log("✅ 代币部署完成，跳过流动性添加\n");
    await saveDeployment(network, poiToken.address, null);
    return;
  }

  console.log(`🏭 Router: ${routerAddress}`);
  console.log(`💧 WETH: ${wethAddress}\n`);

  // 获取配置
  const wethAmount = process.env.WETH_AMOUNT || "0.01";
  const poiAmount = process.env.POI_AMOUNT || "10000";

  const wethAmountWei = ethers.utils.parseEther(wethAmount);
  const poiAmountWei = ethers.utils.parseEther(poiAmount);

  console.log(`📊 流动性配置:`);
  console.log(`   ETH: ${wethAmount}`);
  console.log(`   POI: ${poiAmount}`);
  console.log(`   初始价格: 1 ETH = ${parseFloat(poiAmount) / parseFloat(wethAmount)} POI\n`);

  // 检查余额
  const requiredBalance = wethAmountWei.add(ethers.utils.parseEther("0.01")); // 额外0.01用于gas
  if (balance.lt(requiredBalance)) {
    console.log(`⚠️  ETH 余额不足以添加流动性`);
    console.log(`   需要: ${ethers.utils.formatEther(requiredBalance)} ETH (含gas)`);
    console.log(`   当前: ${ethers.utils.formatEther(balance)} ETH\n`);
    console.log("✅ 代币部署完成，请手动添加流动性\n");
    await saveDeployment(network, poiToken.address, null);
    return;
  }

  // ============================================
  // 3. 授权 Router
  // ============================================
  console.log("3️⃣  授权 Router 使用 POI 代币...");

  const approveTx = await poiToken.approve(routerAddress, ethers.constants.MaxUint256);
  const approveReceipt = await approveTx.wait();
  console.log(`   ✅ 授权成功 (区块: ${approveReceipt.blockNumber})\n`);

  // ============================================
  // 4. 添加流动性
  // ============================================
  console.log("4️⃣  添加流动性到 Uniswap V2...");

  const ROUTER_ABI = [
    "function addLiquidityETH(address token, uint amountTokenDesired, uint amountTokenMin, uint amountETHMin, address to, uint deadline) external payable returns (uint amountToken, uint amountETH, uint liquidity)",
    "function factory() external view returns (address)",
  ];

  const FACTORY_ABI = [
    "function getPair(address tokenA, address tokenB) external view returns (address pair)",
  ];

  const router = new ethers.Contract(routerAddress, ROUTER_ABI, wallet);

  const minWethAmount = wethAmountWei.mul(95).div(100); // 5% 滑点
  const minPoiAmount = poiAmountWei.mul(95).div(100);
  const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20分钟

  try {
    const tx = await router.addLiquidityETH(
      poiToken.address,
      poiAmountWei,
      minPoiAmount,
      minWethAmount,
      wallet.address,
      deadline,
      { value: wethAmountWei }
    );

    console.log(`   交易哈希: ${tx.hash}`);
    console.log(`   ⏳ 等待确认...\n`);

    const receipt = await tx.wait();
    console.log(`   ✅ 流动性已添加! (区块: ${receipt.blockNumber})\n`);

    // 获取流动性池地址
    const factoryAddress = await router.factory();
    const factory = new ethers.Contract(factoryAddress, FACTORY_ABI, wallet);
    const pairAddress = await factory.getPair(poiToken.address, wethAddress);

    console.log("═══════════════════════════════════════════════════════");
    console.log("🎉 部署完成!\n");
    console.log(`📍 POI Token 地址: ${poiToken.address}`);
    console.log(`📍 流动性池地址: ${pairAddress}`);
    console.log(`📍 部署交易: ${tx.hash}`);
    console.log(`📍 区块浏览器: ${getExplorerUrl(network, poiToken.address)}`);
    console.log(`📍 Uniswap池子: ${getUniswapUrl(network, pairAddress)}`);
    console.log("═══════════════════════════════════════════════════════\n");

    await saveDeployment(network, poiToken.address, pairAddress, tx.hash);

  } catch (error: any) {
    console.error("\n❌ 添加流动性失败:", error.message);
    if (error.error) {
      console.error("详细错误:", error.error.message || error.error);
    }
    console.log("\n✅ 代币部署成功，但流动性添加失败");
    console.log("   请手动添加流动性\n");
    console.log(`   代币地址: ${poiToken.address}`);
    await saveDeployment(network, poiToken.address, null);
  }
}

async function saveDeployment(
  network: string,
  tokenAddress: string,
  pairAddress: string | null,
  txHash?: string
) {
  const deploymentsDir = path.join(process.cwd(), "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentInfo = {
    network: network,
    timestamp: new Date().toISOString(),
    tokenAddress: tokenAddress,
    pairAddress: pairAddress,
    txHash: txHash,
  };

  const filename = path.join(deploymentsDir, `deployment-${network}.json`);
  fs.writeFileSync(filename, JSON.stringify(deploymentInfo, null, 2));
  console.log(`💾 部署信息已保存: ${filename}\n`);
}

function getExplorerUrl(network: string, address: string): string {
  const explorers: Record<string, string> = {
    mainnet: "https://etherscan.io",
    sepolia: "https://sepolia.etherscan.io",
    base: "https://basescan.org",
    "base-sepolia": "https://sepolia.basescan.org",
    arbitrum: "https://arbiscan.io",
    polygon: "https://polygonscan.com",
  };
  const explorer = explorers[network] || "https://etherscan.io";
  return `${explorer}/address/${address}`;
}

function getUniswapUrl(network: string, pairAddress: string): string {
  if (network === "base" || network === "base-sepolia") {
    return `https://app.uniswap.org/pools/${pairAddress}`;
  }
  return `https://app.uniswap.org/pools/${pairAddress}`;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 部署失败:", error);
    process.exit(1);
  });
