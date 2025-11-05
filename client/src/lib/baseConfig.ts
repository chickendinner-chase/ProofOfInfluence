// Base Chain Configuration for Uniswap V2 Trading

export const BASE_CHAIN_ID = 8453;
export const BASE_CHAIN_ID_HEX = "0x2105";
export const BASE_RPC_URL = "https://mainnet.base.org";
export const BASE_EXPLORER = "https://basescan.org";

// BaseSwap (Uniswap V2 fork on Base)
// BaseSwap is the main Uniswap V2 compatible DEX on Base
export const BASESWAP_ROUTER_ADDRESS = "0x327Df1E6de05895d2ab08513aaDD9313Fe505d86";
export const BASESWAP_FACTORY_ADDRESS = "0xFDa619b6d20975be80A10332cD39b9a4b0FAa8BB";

// Token addresses on Base mainnet
export const WETH_ADDRESS = "0x4200000000000000000000000000000000000006"; // Wrapped ETH on Base
export const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"; // USDC on Base (6 decimals)

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

