import { ethers } from "ethers";

/**
 * Get RPC URL based on network ID from environment
 * Supports base-sepolia and base networks
 */
export function getRpcUrl(): string {
  const networkId = process.env.AGENTKIT_DEFAULT_CHAIN || "base-sepolia";
  
  if (networkId === "base-sepolia" || networkId === "84532") {
    return process.env.BASE_SEPOLIA_RPC_URL || process.env.BASE_RPC_URL || "https://sepolia.base.org";
  } else if (networkId === "base" || networkId === "8453") {
    return process.env.BASE_RPC_URL || "https://mainnet.base.org";
  } else {
    // Default to Base Sepolia
    return process.env.BASE_SEPOLIA_RPC_URL || process.env.BASE_RPC_URL || "https://sepolia.base.org";
  }
}

/**
 * Create ethers provider from RPC URL
 * @param rpcUrl - Optional RPC URL, if not provided uses getRpcUrl()
 * @returns ethers JsonRpcProvider instance
 */
export function createEthersProvider(rpcUrl?: string): ethers.providers.JsonRpcProvider {
  const url = rpcUrl || getRpcUrl();
  return new ethers.providers.JsonRpcProvider(url);
}

