// Base Chain Configuration for Uniswap V2 Trading

const FALLBACK_CHAIN_ID = 8453;
const envChainId = Number(import.meta.env.VITE_CHAIN_ID);

export const BASE_CHAIN_ID = Number.isFinite(envChainId) && envChainId > 0 ? envChainId : FALLBACK_CHAIN_ID;
export const BASE_CHAIN_ID_HEX = `0x${BASE_CHAIN_ID.toString(16)}`;
export const BASE_RPC_URL = import.meta.env.VITE_BASE_RPC_URL || "https://mainnet.base.org";
export const BASE_EXPLORER = import.meta.env.VITE_BASE_EXPLORER || "https://basescan.org";

// BaseSwap (Uniswap V2 fork on Base)
// BaseSwap is the main Uniswap V2 compatible DEX on Base
export const BASESWAP_ROUTER_ADDRESS = "0x327Df1E6de05895d2ab08513aaDD9313Fe505d86";
export const BASESWAP_FACTORY_ADDRESS = "0xFDa619b6d20975be80A10332cD39b9a4b0FAa8BB";

// Token addresses on Base mainnet (override via env when needed)
export const WETH_ADDRESS = (import.meta.env.VITE_WETH_ADDRESS || "0x4200000000000000000000000000000000000006") as `0x${string}`; // Wrapped ETH on Base
const DEFAULT_USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
export const USDC_ADDRESS = (import.meta.env.VITE_USDC_ADDRESS || DEFAULT_USDC_ADDRESS) as `0x${string}`; // USDC on Base (6 decimals)
export const USDC_DECIMALS = 6;
export const POI_DECIMALS = 18;

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
export const TGESALE_ADDRESS = (import.meta.env.VITE_TGESALE_ADDRESS || ZERO_ADDRESS) as `0x${string}`;
export const POI_TOKEN_ADDRESS = (import.meta.env.VITE_POI_ADDRESS || ZERO_ADDRESS) as `0x${string}`;
export const STAKING_REWARDS_ADDRESS = (import.meta.env.VITE_STAKING_REWARDS_ADDRESS || ZERO_ADDRESS) as `0x${string}`;

// Uniswap V2 Router ABI (minimal interface for swap)
export const UNISWAP_V2_ROUTER_ABI = [
  "function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)",
  "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)",
  "function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
  "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
];

// ERC20 ABI (minimal interface)
export const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
];

export const TGESALE_ABI = [
  "function purchase(uint256 usdcAmount, bytes32[] calldata proof)",
  "function currentTier() view returns (uint256)",
  "function tiers(uint256) view returns (uint256 pricePerToken, uint256 remainingTokens)",
  "function minContribution() view returns (uint256)",
  "function maxContribution() view returns (uint256)",
  "function totalRaised() view returns (uint256)",
  "function contributedUSDC(address) view returns (uint256)",
] as const;

// StakingRewards ABI
export const STAKING_REWARDS_ABI = [
  "function stake(uint256 amount) external",
  "function withdraw(uint256 amount) external",
  "function getReward() external",
  "function exit() external",
  "function balanceOf(address) view returns (uint256)",
  "function earned(address) view returns (uint256)",
  "function rewardRate() view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function periodFinish() view returns (uint256)",
  "function rewardsDuration() view returns (uint256)",
] as const;

// Network configuration for MetaMask
export const BASE_NETWORK_PARAMS = {
  chainId: BASE_CHAIN_ID_HEX,
  chainName: "Base",
  nativeCurrency: {
    name: "ETH",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: [BASE_RPC_URL],
  blockExplorerUrls: [BASE_EXPLORER],
};

