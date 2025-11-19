// Base Chain Configuration for Uniswap V2 Trading
// Default to Base Sepolia (Chain ID: 84532) for development and testing

const FALLBACK_CHAIN_ID = 84532; // Base Sepolia testnet
const envChainId = Number(import.meta.env.VITE_CHAIN_ID);

export const BASE_CHAIN_ID = Number.isFinite(envChainId) && envChainId > 0 ? envChainId : FALLBACK_CHAIN_ID;
export const BASE_CHAIN_ID_HEX = `0x${BASE_CHAIN_ID.toString(16)}`;
export const BASE_RPC_URL = import.meta.env.VITE_BASE_RPC_URL || "https://sepolia.base.org";
export const BASE_EXPLORER = import.meta.env.VITE_BASE_EXPLORER || "https://sepolia.basescan.org";

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

// Zero address constant for unconfigured contracts
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

// Contract addresses on Base Sepolia (Chain ID: 84532)
// All addresses are read from environment variables (VITE_*)
// If not configured, returns ZERO_ADDRESS (contract considered unconfigured)

// POI Token (ERC20) - Base token contract
export const POI_TOKEN_ADDRESS = (import.meta.env.VITE_POI_ADDRESS || "0x737869142C93078Dae4d78D4E8c5dbD45160565a") as `0x${string}`;

// TGE Sale - Token Generation Event sale contract
export const TGESALE_ADDRESS = (import.meta.env.VITE_TGESALE_ADDRESS || "0x323b3197911603692729c6a5F7375d9AC8c3bA93") as `0x${string}`;

// Staking Rewards - POI staking and rewards contract
export const STAKING_REWARDS_ADDRESS = (import.meta.env.VITE_STAKING_REWARDS_ADDRESS || "0xe23f7688303768BB1CE2e2a98540A0C1ba63ec2d") as `0x${string}`;

// Vesting Vault - Token vesting and release contract
export const VESTING_VAULT_ADDRESS = (import.meta.env.VITE_VESTING_VAULT_ADDRESS || "0xe4E695722C598CBa27723ab98049818b4b827924") as `0x${string}`;

// Merkle Airdrop Distributor - Merkle tree-based airdrop distribution
export const MERKLE_AIRDROP_ADDRESS = (import.meta.env.VITE_MERKLE_AIRDROP_ADDRESS || "0xa3ae789eA6409ab5F92a69EC41dbA1E6f3C57A2e") as `0x${string}`;

// Early Bird Allowlist - Merkle whitelist for early bird allocations
export const EARLY_BIRD_ALLOWLIST_ADDRESS = (import.meta.env.VITE_EARLY_BIRD_ALLOWLIST_ADDRESS || "0x75D75a4870762422D85D275b22F5A87Df78b4852") as `0x${string}`;

// Referral Registry - On-chain referral relationship registry
export const REFERRAL_REGISTRY_ADDRESS = (import.meta.env.VITE_REFERRAL_REGISTRY_ADDRESS || "0xD857D2E232031CD6311Fba80c62E3F11f7Fb9bD0") as `0x${string}`;

// Achievement Badges - Soulbound ERC1155 achievement badges
export const ACHIEVEMENT_BADGES_ADDRESS = (import.meta.env.VITE_ACHIEVEMENT_BADGES_ADDRESS || "0xe86C5077b60490A11316D40AB1368d7d73770E00") as `0x${string}`;

// Immortality Badge - Immortality badge NFT contract
export const IMMORTALITY_BADGE_ADDRESS = (import.meta.env.VITE_IMMORTALITY_BADGE_ADDRESS || "0xbd637B458edbdb1dB420d220BF92F7bd02382000") as `0x${string}`;

// Uniswap V2 Router ABI (minimal interface for swap)
export const UNISWAP_V2_ROUTER_ABI = [
  "function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)",
  "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)",
  "function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
  "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
];

// ERC20 ABI (minimal interface) - Using object format for wagmi compatibility
export const ERC20_ABI = [
  {
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "address", name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

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

