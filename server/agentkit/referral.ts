import { ethers } from "ethers";
import referralConfig from "@shared/contracts/referral_registry.json";

/**
 * Get provider from environment
 */
function getProvider(): ethers.providers.Provider | null {
  const rpcUrl = process.env.BASE_RPC_URL || process.env.BASE_SEPOLIA_RPC_URL;
  if (!rpcUrl) {
    return null;
  }
  return new ethers.providers.JsonRpcProvider(rpcUrl);
}

/**
 * Get referral information for an invitee
 * @param inviteeAddress - Address of the invitee
 * @returns Referral struct with inviter, code, timestamp, and exists flag
 */
export async function getReferral(inviteeAddress: string): Promise<{
  inviter: string;
  code: string;
  timestamp: number;
  exists: boolean;
}> {
  if (!referralConfig.address || referralConfig.address === "0x0000000000000000000000000000000000000000") {
    throw new Error("ReferralRegistry contract address is not configured or deployed");
  }

  const provider = getProvider();
  if (!provider) {
    throw new Error("RPC provider not configured");
  }

  const contract = new ethers.Contract(
    referralConfig.address,
    referralConfig.abi,
    provider
  );

  const referral = await contract.getReferral(inviteeAddress);
  
  return {
    inviter: referral.inviter,
    code: referral.code,
    timestamp: Number(referral.timestamp),
    exists: referral.exists,
  };
}

/**
 * Check if an address has a referral relationship
 * @param inviteeAddress - Address to check
 * @returns True if the address has a referral relationship
 */
export async function hasReferral(inviteeAddress: string): Promise<boolean> {
  if (!referralConfig.address || referralConfig.address === "0x0000000000000000000000000000000000000000") {
    return false;
  }

  try {
    const provider = getProvider();
    if (!provider) {
      return false;
    }

    const contract = new ethers.Contract(
      referralConfig.address,
      referralConfig.abi,
      provider
    );

    return await contract.hasReferral(inviteeAddress);
  } catch (error) {
    console.error("Error checking referral:", error);
    return false;
  }
}

/**
 * Get referral count for an inviter
 * @param inviterAddress - Address of the inviter
 * @returns Number of referrals
 */
export async function getReferralCount(inviterAddress: string): Promise<string> {
  if (!referralConfig.address || referralConfig.address === "0x0000000000000000000000000000000000000000") {
    return "0";
  }

  try {
    const provider = getProvider();
    if (!provider) {
      return "0";
    }

    const contract = new ethers.Contract(
      referralConfig.address,
      referralConfig.abi,
      provider
    );

    const count = await contract.referralCounts(inviterAddress);
    return count.toString();
  } catch (error) {
    console.error("Error getting referral count:", error);
    return "0";
  }
}

/**
 * Get total rewards earned by an inviter
 * @param inviterAddress - Address of the inviter
 * @returns Total rewards earned (in wei)
 */
export async function getTotalRewardsEarned(inviterAddress: string): Promise<string> {
  if (!referralConfig.address || referralConfig.address === "0x0000000000000000000000000000000000000000") {
    return "0";
  }

  try {
    const provider = getProvider();
    if (!provider) {
      return "0";
    }

    const contract = new ethers.Contract(
      referralConfig.address,
      referralConfig.abi,
      provider
    );

    const rewards = await contract.totalRewardsEarned(inviterAddress);
    return rewards.toString();
  } catch (error) {
    console.error("Error getting total rewards earned:", error);
    return "0";
  }
}

