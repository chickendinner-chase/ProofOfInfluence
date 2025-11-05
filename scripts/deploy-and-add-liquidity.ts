/**
 * 一键部署POI代币并添加Uniswap V2流动性
 * 
 * 使用方法:
 * npx hardhat run scripts/deploy-and-add-liquidity.ts --network sepolia
 * 
 * 环境变量:
 * - PRIVATE_KEY: 部署者私钥
 * - WETH_AMOUNT: 添加的ETH数量 (默认: 0.1)
 * - POI_AMOUNT: 添加的POI代币数量 (默认: 100000)
 */

import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

// Uniswap V2 Router 地址
const UNISWAP_V2_ROUTER: Record<string, string> = {
  mainnet: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
  sepolia: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
  base: "0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24",
  arbitrum: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
  polygon: "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff",
};

// WETH 地址
const WETH_ADDRESS: Record<string, string> = {
  mainnet: "0xC02aaA39b223FE8D0A0E5C4F27eAD9083C756Cc2",
  sepolia: "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9",
  base: "0x4200000000000000000000000000000000000006",
  arbitrum: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
  polygon: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
};

const ROUTER_ABI = [
  "function addLiquidityETH(address token, uint amountTokenDesired, uint amountTokenMin, uint amountETHMin, address to, uint deadline) external payable returns (uint amountToken, uint amountETH, uint liquidity)",
  "function factory() external view returns (address)",
];

const FACTORY_ABI = [
  "function getPair(address tokenA, address tokenB) external view returns (address pair)",
];

async function main() {
  console.log("🚀 开始部署 POI Token 并添加流动性...\n");

  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  const networkName = network.name === "unknown" ? "localhost" : network.name;

  console.log(`📡 网络: ${networkName} (Chain ID: ${network.chainId})`);
  console.log(`👛 部署者: ${deployer.address}`);
  
  const balance = await deployer.getBalance();
  console.log(`💰 余额: ${ethers.utils.formatEther(balance)} ETH\n`);

  // ============================================
  // 1. 部署 POI Token
  // ============================================
  console.log("📝 1. 部署 POI Token 合约...");
  
  const POIToken = await ethers.getContractFactory("POIToken");
  const poiToken = await POIToken.deploy();
  await poiToken.deployed();

  console.log(`✅ POI Token 已部署: ${poiToken.address}`);
  
  const totalSupply = await poiToken.totalSupply();
  console.log(`   总供应量: ${ethers.utils.formatEther(totalSupply)} POI\n`);

  // ============================================
  // 2. 准备添加流动性
  // ============================================
  console.log("🌊 2. 准备添加 Uniswap V2 流动性...\n");

  const routerAddress = UNISWAP_V2_ROUTER[networkName];
  const wethAddress = WETH_ADDRESS[networkName];

  if (!routerAddress || !wethAddress) {
    console.log(`⚠️  网络 ${networkName} 未配置 Uniswap V2 Router`);
    console.log("✅ 代币部署完成，跳过流动性添加\n");
    await saveDeployment(networkName, poiToken.address, null);
    return;
  }

  console.log(`🏭 Router: ${routerAddress}`);
  console.log(`💧 WETH: ${wethAddress}\n`);

  // 获取配置
  const wethAmount = process.env.WETH_AMOUNT || "0.1";
  const poiAmount = process.env.POI_AMOUNT || "100000";

  const wethAmountWei = ethers.utils.parseEther(wethAmount);
  const poiAmountWei = ethers.utils.parseEther(poiAmount);

  console.log(`📊 流动性配置:`);
  console.log(`   ETH: ${wethAmount}`);
  console.log(`   POI: ${poiAmount}\n`);

  // 检查余额
  if (balance.lt(wethAmountWei)) {
    console.log(`⚠️  ETH 余额不足以添加流动性`);
    console.log(`   需要: ${wethAmount} ETH`);
    console.log(`   当前: ${ethers.utils.formatEther(balance)} ETH\n`);
    console.log("✅ 代币部署完成，请手动添加流动性\n");
    await saveDeployment(networkName, poiToken.address, null);
    return;
  }

  // ============================================
  // 3. 授权 Router
  // ============================================
  console.log("3️⃣  授权 Router 使用 POI 代币...");
  
  const approveTx = await poiToken.approve(routerAddress, ethers.constants.MaxUint256);
  await approveTx.wait();
  console.log("   ✅ 授权成功\n");

  // ============================================
  // 4. 添加流动性
  // ============================================
  console.log("4️⃣  添加流动性到 Uniswap V2...");

  const router = await ethers.getContractAt(ROUTER_ABI, routerAddress);
  
  const minWethAmount = wethAmountWei.mul(95).div(100); // 5% 滑点
  const minPoiAmount = poiAmountWei.mul(95).div(100);
  const deadline = Math.floor(Date.now() / 1000) + 60 * 15; // 15分钟

  try {
    const tx = await router.addLiquidityETH(
      poiToken.address,
      poiAmountWei,
      minPoiAmount,
      minWethAmount,
      deployer.address,
      deadline,
      { value: wethAmountWei }
    );

    console.log(`   交易哈希: ${tx.hash}`);
    console.log(`   ⏳ 等待确认...\n`);

    const receipt = await tx.wait();
    console.log(`   ✅ 流动性已添加! (区块: ${receipt.blockNumber})\n`);

    // 获取流动性池地址
    const factoryAddress = await router.factory();
    const factory = await ethers.getContractAt(FACTORY_ABI, factoryAddress);
    const pairAddress = await factory.getPair(poiToken.address, wethAddress);

    console.log("🎉 部署完成!\n");
    console.log(`📍 POI Token: ${poiToken.address}`);
    console.log(`📍 流动性池: ${pairAddress}`);
    console.log(`📍 交易哈希: ${tx.hash}\n`);

    await saveDeployment(networkName, poiToken.address, pairAddress, tx.hash);

  } catch (error: any) {
    console.error("\n❌ 添加流动性失败:", error.message);
    console.log("\n✅ 代币部署成功，但流动性添加失败");
    console.log("   请手动添加流动性\n");
    await saveDeployment(networkName, poiToken.address, null);
  }
}

async function saveDeployment(
  network: string, 
  tokenAddress: string, 
  pairAddress: string | null,
  txHash?: string
) {
  const deploymentInfo = {
    network: network,
    timestamp: new Date().toISOString(),
    contracts: {
      poiToken: tokenAddress,
      liquidityPair: pairAddress,
    },
    transactionHash: txHash,
  };

  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFile = path.join(deploymentsDir, `deployment-${network}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  
  console.log(`✅ 部署信息已保存: ${deploymentFile}\n`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


