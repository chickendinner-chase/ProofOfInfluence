import { utils } from "ethers";
import stakingConfig from "@shared/contracts/staking_rewards.json";
import { getAgentKitContext } from "./agentkitClient";

/**
 * Stake POI tokens using AgentKit
 * @param amount - Amount of POI to stake (in wei/smallest unit)
 * @param userAddress - User's wallet address (for validation)
 * @returns Transaction hash and staked amount
 */
export async function stakePoi(
  amount: string,
  userAddress: string
): Promise<{ txHash: string; amount: string }> {
  if (!stakingConfig.address || stakingConfig.address === "0x0000000000000000000000000000000000000000") {
    throw new Error("Staking contract address is not configured or deployed");
  }

  const { walletProvider } = await getAgentKitContext();
  const iface = new utils.Interface(stakingConfig.abi as any);
  
  // Encode stake(uint256 amount)
  const data = iface.encodeFunctionData("stake", [amount]);
  
  const txHash = await walletProvider.sendTransaction({
    to: stakingConfig.address as `0x${string}`,
    data: data as `0x${string}`,
    value: 0n,
  });
  
  await walletProvider.waitForTransactionReceipt(txHash as `0x${string}`);
  
  return {
    txHash,
    amount,
  };
}

/**
 * Unstake/withdraw POI tokens using AgentKit
 * @param amount - Amount of POI to withdraw (in wei/smallest unit)
 * @param userAddress - User's wallet address (for validation)
 * @returns Transaction hash and withdrawn amount
 */
export async function unstakePoi(
  amount: string,
  userAddress: string
): Promise<{ txHash: string; amount: string }> {
  if (!stakingConfig.address || stakingConfig.address === "0x0000000000000000000000000000000000000000") {
    throw new Error("Staking contract address is not configured or deployed");
  }

  const { walletProvider } = await getAgentKitContext();
  const iface = new utils.Interface(stakingConfig.abi as any);
  
  // Encode withdraw(uint256 amount)
  const data = iface.encodeFunctionData("withdraw", [amount]);
  
  const txHash = await walletProvider.sendTransaction({
    to: stakingConfig.address as `0x${string}`,
    data: data as `0x${string}`,
    value: 0n,
  });
  
  await walletProvider.waitForTransactionReceipt(txHash as `0x${string}`);
  
  return {
    txHash,
    amount,
  };
}

/**
 * Claim staking rewards using AgentKit
 * @param userAddress - User's wallet address (for validation)
 * @returns Transaction hash and reward amount
 */
export async function claimReward(
  userAddress: string
): Promise<{ txHash: string; reward?: string }> {
  if (!stakingConfig.address || stakingConfig.address === "0x0000000000000000000000000000000000000000") {
    throw new Error("Staking contract address is not configured or deployed");
  }

  const { walletProvider } = await getAgentKitContext();
  const iface = new utils.Interface(stakingConfig.abi as any);
  
  // First, check earned rewards
  let earnedAmount: string | undefined;
  try {
    const earnedData = iface.encodeFunctionData("earned", [userAddress]);
    const result = await walletProvider.request({
      method: "eth_call",
      params: [
        {
          to: stakingConfig.address,
          data: earnedData,
        },
        "latest",
      ],
    });
    earnedAmount = iface.decodeFunctionResult("earned", result as string)[0].toString();
  } catch (error) {
    console.warn("Could not fetch earned amount:", error);
  }
  
  // Encode getReward()
  const data = iface.encodeFunctionData("getReward", []);
  
  const txHash = await walletProvider.sendTransaction({
    to: stakingConfig.address as `0x${string}`,
    data: data as `0x${string}`,
    value: 0n,
  });
  
  await walletProvider.waitForTransactionReceipt(txHash as `0x${string}`);
  
  return {
    txHash,
    reward: earnedAmount,
  };
}

/**
 * Get user's staked balance
 * @param userAddress - User's wallet address
 */
export async function getStakedBalance(userAddress: string): Promise<string> {
  if (!stakingConfig.address || stakingConfig.address === "0x0000000000000000000000000000000000000000") {
    return "0";
  }

  try {
    const { walletProvider } = await getAgentKitContext();
    const iface = new utils.Interface(stakingConfig.abi as any);
    const data = iface.encodeFunctionData("balanceOf", [userAddress]);
    
    const result = await walletProvider.request({
      method: "eth_call",
      params: [
        {
          to: stakingConfig.address,
          data,
        },
        "latest",
      ],
    });
    
    return iface.decodeFunctionResult("balanceOf", result as string)[0].toString();
  } catch (error) {
    console.error("Error getting staked balance:", error);
    return "0";
  }
}

/**
 * Get user's earned rewards
 * @param userAddress - User's wallet address
 */
export async function getEarnedRewards(userAddress: string): Promise<string> {
  if (!stakingConfig.address || stakingConfig.address === "0x0000000000000000000000000000000000000000") {
    return "0";
  }

  try {
    const { walletProvider } = await getAgentKitContext();
    const iface = new utils.Interface(stakingConfig.abi as any);
    const data = iface.encodeFunctionData("earned", [userAddress]);
    
    const result = await walletProvider.request({
      method: "eth_call",
      params: [
        {
          to: stakingConfig.address,
          data,
        },
        "latest",
      ],
    });
    
    return iface.decodeFunctionResult("earned", result as string)[0].toString();
  } catch (error) {
    console.error("Error getting earned rewards:", error);
    return "0";
  }
}

