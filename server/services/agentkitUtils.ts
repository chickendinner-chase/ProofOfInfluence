import { ethers } from "ethers";
import { getRpcUrl } from "../utils/rpcProvider";

/**
 * Get admin signer for contract operations
 * Uses PRIVATE_KEY or DEPLOYER_PRIVATE_KEY from environment variables
 */
export function getAdminSigner(): ethers.Wallet {
  const privateKey = process.env.PRIVATE_KEY || process.env.DEPLOYER_PRIVATE_KEY;
  
  if (!privateKey) {
    throw new Error("PRIVATE_KEY or DEPLOYER_PRIVATE_KEY must be set in environment variables");
  }

  const rpcUrl = getRpcUrl();
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  return new ethers.Wallet(privateKey, provider);
}
