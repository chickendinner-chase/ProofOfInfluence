import { utils } from "ethers";
import achievementBadgesConfig from "@shared/contracts/achievement_badges.json";
import { getAgentKitContext } from "./agentkitClient";

/**
 * Mint achievement badge via AgentKit
 * @param to - User's wallet address to receive the badge
 * @param badgeType - Badge type ID (must be enabled in contract)
 * @returns Transaction hash
 */
export async function mintAchievementBadge(to: string, badgeType: number): Promise<string> {
  if (!achievementBadgesConfig.address || achievementBadgesConfig.address === "0x0000000000000000000000000000000000000000") {
    throw new Error("AchievementBadges contract address is not configured or deployed");
  }

  const { walletProvider } = await getAgentKitContext();
  const iface = new utils.Interface(achievementBadgesConfig.abi as any);
  
  // Call mintBadge(address to, uint256 badgeType)
  const data = iface.encodeFunctionData("mintBadge", [to, badgeType]);
  
  const txHash = await walletProvider.sendTransaction({
    to: achievementBadgesConfig.address as `0x${string}`,
    data: data as `0x${string}`,
    value: 0n,
  });
  
  await walletProvider.waitForTransactionReceipt(txHash as `0x${string}`);
  return txHash;
}

