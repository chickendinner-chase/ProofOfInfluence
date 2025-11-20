import { ethers } from "ethers";

/**
 * Get admin signer for contract operations
 * Uses PRIVATE_KEY or DEPLOYER_PRIVATE_KEY from environment variables
 */
export function getAdminSigner(): ethers.Wallet {
  const privateKey = process.env.PRIVATE_KEY || process.env.DEPLOYER_PRIVATE_KEY;
  
  if (!privateKey) {
    throw new Error("PRIVATE_KEY or DEPLOYER_PRIVATE_KEY must be set in environment variables");
  }

  // Get network from environment or default to base-sepolia
  const networkId = process.env.AGENTKIT_DEFAULT_CHAIN || "base-sepolia";
  
  // Create RPC URL based on network
  let rpcUrl: string;
  if (networkId === "base-sepolia" || networkId === "84532") {
    rpcUrl = process.env.BASE_SEPOLIA_RPC_URL || process.env.BASE_RPC_URL || "https://sepolia.base.org";
  } else if (networkId === "base" || networkId === "8453") {
    rpcUrl = process.env.BASE_RPC_URL || "https://mainnet.base.org";
  } else {
    // Default to base-sepolia
    rpcUrl = process.env.BASE_SEPOLIA_RPC_URL || process.env.BASE_RPC_URL || "https://sepolia.base.org";
  }

  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  return new ethers.Wallet(privateKey, provider);
}
