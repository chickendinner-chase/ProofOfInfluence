/**
 * Uniswap V2 添加流动性脚本
 * 
 * 使用方法:
 * npx tsx scripts/add-liquidity-v2.ts
 * 
 * 环境变量:
 * - PRIVATE_KEY: 钱包私钥
 * - RPC_URL: 以太坊RPC节点URL
 * - NETWORK: 网络名称
 * - POI_TOKEN_ADDRESS: POI代币合约地址
 * - WETH_AMOUNT: WETH数量 (例: 1)
 * - POI_AMOUNT: POI代币数量 (例: 100000)
 */

import { ethers } from "ethers";
import * as fs from "fs";
import * as path from "path";

// Uniswap V2 Router 地址 (各网络)
const UNISWAP_V2_ROUTER: Record<string, string> = {
  mainnet: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
  sepolia: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D", // 测试网可能需要部署自己的
  base: "0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24", // BaseSwap
  arbitrum: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506", // Sushiswap
  polygon: "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff", // QuickSwap
};

// WETH 地址
const WETH_ADDRESS: Record<string, string> = {
  mainnet: "0xC02aaA39b223FE8D0A0E5C4F27eAD9083C756Cc2",
  sepolia: "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9",
  base: "0x4200000000000000000000000000000000000006",
  arbitrum: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
  polygon: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270", // WMATIC
};

// Uniswap V2 Router ABI (简化版)
const ROUTER_ABI = [
  "function addLiquidity(address tokenA, address tokenB, uint amountADesired, uint amountBDesired, uint amountAMin, uint amountBMin, address to, uint deadline) external returns (uint amountA, uint amountB, uint liquidity)",
  "function addLiquidityETH(address token, uint amountTokenDesired, uint amountTokenMin, uint amountETHMin, address to, uint deadline) external payable returns (uint amountToken, uint amountETH, uint liquidity)",
  "function factory() external view returns (address)",
];

// ERC20 ABI (简化版)
const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
  "function symbol() external view returns (string)",
];

// Uniswap V2 Factory ABI
const FACTORY_ABI = [
  "function getPair(address tokenA, address tokenB) external view returns (address pair)",
  "function createPair(address tokenA, address tokenB) external returns (address pair)",
];

async function main() {
  console.log("🌊 开始添加 Uniswap V2 流动性...\n");

  // 获取环境变量
  const privateKey = process.env.PRIVATE_KEY;
  const network = process.env.NETWORK || "sepolia";
  const poiTokenAddress = process.env.POI_TOKEN_ADDRESS;
  const wethAmount = process.env.WETH_AMOUNT || "0.1"; // 默认 0.1 ETH
  const poiAmount = process.env.POI_AMOUNT || "100000"; // 默认 100,000 POI
  
  if (!privateKey) {
    throw new Error("请设置 PRIVATE_KEY 环境变量");
  }

  if (!poiTokenAddress) {
    throw new Error("请设置 POI_TOKEN_ADDRESS 环境变量");
  }

  // 获取网络配置
  const routerAddress = UNISWAP_V2_ROUTER[network];
  const wethAddress = WETH_ADDRESS[network];

  if (!routerAddress || !wethAddress) {
    throw new Error(`不支持的网络: ${network}`);
  }

  const rpcUrl = process.env.RPC_URL || `https://eth-${network}.g.alchemy.com/v2/YOUR_API_KEY`;

  console.log(`📡 网络: ${network}`);
  console.log(`🔗 RPC: ${rpcUrl}`);
  console.log(`🏭 Router: ${routerAddress}`);
  console.log(`💧 WETH: ${wethAddress}`);
  console.log(`🪙  POI Token: ${poiTokenAddress}\n`);

  // 连接到网络
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  
  console.log(`👛 钱包地址: ${wallet.address}`);
  
  // 检查余额
  const balance = await wallet.getBalance();
  console.log(`💰 ETH 余额: ${ethers.utils.formatEther(balance)} ETH\n`);

  // 连接到合约
  const poiToken = new ethers.Contract(poiTokenAddress, ERC20_ABI, wallet);
  const router = new ethers.Contract(routerAddress, ROUTER_ABI, wallet);

  // 检查 POI 代币余额
  const poiBalance = await poiToken.balanceOf(wallet.address);
  const poiDecimals = await poiToken.decimals();
  const poiSymbol = await poiToken.symbol();
  
  console.log(`🪙  ${poiSymbol} 余额: ${ethers.utils.formatUnits(poiBalance, poiDecimals)}`);

  // 准备数量
  const wethAmountWei = ethers.utils.parseEther(wethAmount);
  const poiAmountWei = ethers.utils.parseUnits(poiAmount, poiDecimals);

  console.log(`\n📊 添加流动性:`);
  console.log(`   ETH: ${wethAmount}`);
  console.log(`   ${poiSymbol}: ${poiAmount}\n`);

  // 检查余额是否足够
  if (balance.lt(wethAmountWei)) {
    throw new Error(`ETH 余额不足。需要: ${wethAmount}, 当前: ${ethers.utils.formatEther(balance)}`);
  }

  if (poiBalance.lt(poiAmountWei)) {
    throw new Error(`${poiSymbol} 余额不足。需要: ${poiAmount}, 当前: ${ethers.utils.formatUnits(poiBalance, poiDecimals)}`);
  }

  // 1. 授权 Router 使用 POI 代币
  console.log("1️⃣  检查授权...");
  const allowance = await poiToken.allowance(wallet.address, routerAddress);
  
  if (allowance.lt(poiAmountWei)) {
    console.log("   需要授权 POI 代币...");
    const approveTx = await poiToken.approve(routerAddress, ethers.constants.MaxUint256);
    console.log(`   授权交易: ${approveTx.hash}`);
    await approveTx.wait();
    console.log("   ✅ 授权成功\n");
  } else {
    console.log("   ✅ 已有足够授权\n");
  }

  // 2. 检查流动性池是否存在
  console.log("2️⃣  检查流动性池...");
  const factoryAddress = await router.factory();
  const factory = new ethers.Contract(factoryAddress, FACTORY_ABI, wallet);
  
  let pairAddress = await factory.getPair(poiTokenAddress, wethAddress);
  
  if (pairAddress === ethers.constants.AddressZero) {
    console.log("   流动性池不存在，将自动创建...\n");
  } else {
    console.log(`   ✅ 流动性池已存在: ${pairAddress}\n`);
  }

  // 3. 添加流动性
  console.log("3️⃣  添加流动性...");
  
  // 设置最小数量 (允许 5% 滑点)
  const minWethAmount = wethAmountWei.mul(95).div(100);
  const minPoiAmount = poiAmountWei.mul(95).div(100);
  
  // 设置截止时间 (15分钟后)
  const deadline = Math.floor(Date.now() / 1000) + 60 * 15;

  console.log(`   配置:`);
  console.log(`   - 最小 ETH: ${ethers.utils.formatEther(minWethAmount)}`);
  console.log(`   - 最小 ${poiSymbol}: ${ethers.utils.formatUnits(minPoiAmount, poiDecimals)}`);
  console.log(`   - 截止时间: ${new Date(deadline * 1000).toLocaleString()}\n`);

  try {
    // 使用 addLiquidityETH (更简单，不需要先 wrap ETH)
    const tx = await router.addLiquidityETH(
      poiTokenAddress,
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
    console.log(`   ✅ 交易已确认! (区块: ${receipt.blockNumber})\n`);

    // 获取流动性池地址
    pairAddress = await factory.getPair(poiTokenAddress, wethAddress);
    console.log(`🎉 成功添加流动性!`);
    console.log(`\n📍 流动性池地址: ${pairAddress}`);
    
    // 保存流动性池信息
    const liquidityInfo = {
      network: network,
      timestamp: new Date().toISOString(),
      poiTokenAddress: poiTokenAddress,
      wethAddress: wethAddress,
      pairAddress: pairAddress,
      routerAddress: routerAddress,
      amounts: {
        eth: wethAmount,
        poi: poiAmount,
      },
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber,
    };

    const liquidityDir = path.join(__dirname, "../deployments");
    if (!fs.existsSync(liquidityDir)) {
      fs.mkdirSync(liquidityDir, { recursive: true });
    }

    const liquidityFile = path.join(liquidityDir, `liquidity-${network}.json`);
    fs.writeFileSync(liquidityFile, JSON.stringify(liquidityInfo, null, 2));
    
    console.log(`\n✅ 流动性信息已保存: ${liquidityFile}`);
    console.log(`\n🔗 可以在区块浏览器查看交易:`);
    console.log(`   ${getExplorerUrl(network)}/tx/${tx.hash}`);
    console.log(`\n🔗 可以在 Uniswap 查看流动性池:`);
    console.log(`   ${getUniswapUrl(network)}/pool/${pairAddress}`);

  } catch (error: any) {
    console.error("\n❌ 添加流动性失败:", error.message);
    throw error;
  }
}

function getExplorerUrl(network: string): string {
  const explorers: Record<string, string> = {
    mainnet: "https://etherscan.io",
    sepolia: "https://sepolia.etherscan.io",
    base: "https://basescan.org",
    arbitrum: "https://arbiscan.io",
    polygon: "https://polygonscan.com",
  };
  return explorers[network] || "https://etherscan.io";
}

function getUniswapUrl(network: string): string {
  if (network === "mainnet") return "https://app.uniswap.org";
  return "https://app.uniswap.org";
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 执行失败:", error);
    process.exit(1);
  });


