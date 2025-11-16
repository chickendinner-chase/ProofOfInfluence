import { utils } from "ethers";
import tgeConfig from "@shared/contracts/poi_tge.json";
import { getAgentKitContext } from "./agentkitClient";

/**
 * Purchase POI tokens via TGE sale using AgentKit
 * @param usdcAmount - Amount of USDC to spend (in wei/smallest unit)
 * @param proof - Merkle proof for whitelist (empty array if public sale)
 * @returns Transaction hash and purchase details
 */
export async function buyWithBaseToken(
  usdcAmount: string,
  proof: string[] = []
): Promise<{ txHash: string; usdcAmount: string; poiAmount?: string }> {
  if (!tgeConfig.address || tgeConfig.address === "0x0000000000000000000000000000000000000000") {
    throw new Error("TGE Sale contract address is not configured or deployed");
  }

  const { walletProvider } = await getAgentKitContext();
  const iface = new utils.Interface(tgeConfig.abi as any);
  
  // Encode buyWithBaseToken(uint256 usdcAmount, bytes32[] calldata proof)
  const data = iface.encodeFunctionData("buyWithBaseToken", [usdcAmount, proof]);
  
  const txHash = await walletProvider.sendTransaction({
    to: tgeConfig.address as `0x${string}`,
    data: data as `0x${string}`,
    value: 0n,
  });
  
  await walletProvider.waitForTransactionReceipt(txHash as `0x${string}`);
  
  return {
    txHash,
    usdcAmount,
  };
}

/**
 * Check if TGE sale is currently active
 */
export async function isSaleActive(): Promise<boolean> {
  if (!tgeConfig.address || tgeConfig.address === "0x0000000000000000000000000000000000000000") {
    return false;
  }

  try {
    const { walletProvider } = await getAgentKitContext();
    const iface = new utils.Interface(tgeConfig.abi as any);
    const data = iface.encodeFunctionData("isSaleActive", []);
    
    // Call (read-only)
    const result = await walletProvider.request({
      method: "eth_call",
      params: [
        {
          to: tgeConfig.address,
          data,
        },
        "latest",
      ],
    });
    
    return iface.decodeFunctionResult("isSaleActive", result as string)[0];
  } catch (error) {
    console.error("Error checking sale status:", error);
    return false;
  }
}

/**
 * Get max contribution for a user
 * @param userAddress - User's wallet address
 */
export async function getMaxContribution(userAddress: string): Promise<string> {
  if (!tgeConfig.address || tgeConfig.address === "0x0000000000000000000000000000000000000000") {
    throw new Error("TGE Sale contract not deployed");
  }

  const { walletProvider } = await getAgentKitContext();
  const iface = new utils.Interface(tgeConfig.abi as any);
  const data = iface.encodeFunctionData("maxContribution", [userAddress]);
  
  const result = await walletProvider.request({
    method: "eth_call",
    params: [
      {
        to: tgeConfig.address,
        data,
      },
      "latest",
    ],
  });
  
  return iface.decodeFunctionResult("maxContribution", result as string)[0].toString();
}

/**
 * Get current sale status (public-friendly)
 */
export async function getSaleStatus(userAddress?: string): Promise<{
  isActive: boolean;
  currentTier?: number;
  pricePerToken?: string;
  remainingTokens?: string;
  maxContribution?: string;
}> {
  if (!tgeConfig.address || tgeConfig.address === "0x0000000000000000000000000000000000000000") {
    return { isActive: false };
  }

  const { walletProvider } = await getAgentKitContext();
  const iface = new utils.Interface(tgeConfig.abi as any);

  // isSaleActive
  const isActiveCall = iface.encodeFunctionData("isSaleActive", []);
  const isActiveRes = (await walletProvider.request({
    method: "eth_call",
    params: [{ to: tgeConfig.address, data: isActiveCall }, "latest"],
  })) as string;
  const isActive = iface.decodeFunctionResult("isSaleActive", isActiveRes)[0] as boolean;

  // currentTier
  let currentTier: number | undefined;
  let pricePerToken: string | undefined;
  let remainingTokens: string | undefined;
  try {
    const tierIndexCall = iface.encodeFunctionData("currentTier", []);
    const tierIndexRes = (await walletProvider.request({
      method: "eth_call",
      params: [{ to: tgeConfig.address, data: tierIndexCall }, "latest"],
    })) as string;
    const tierIndex = iface.decodeFunctionResult("currentTier", tierIndexRes)[0] as any;
    currentTier = Number(tierIndex);

    const tiersCall = iface.encodeFunctionData("tiers", [currentTier]);
    const tiersRes = (await walletProvider.request({
      method: "eth_call",
      params: [{ to: tgeConfig.address, data: tiersCall }, "latest"],
    })) as string;
    const [price, remaining] = iface.decodeFunctionResult("tiers", tiersRes) as any;
    pricePerToken = price.toString();
    remainingTokens = remaining.toString();
  } catch {
    // ignore decoding errors if sale not configured
  }

  // maxContribution (optional, when user provided)
  let maxContribution: string | undefined;
  if (userAddress) {
    try {
      const data = iface.encodeFunctionData("maxContribution", [userAddress]);
      const result = (await walletProvider.request({
        method: "eth_call",
        params: [{ to: tgeConfig.address, data }, "latest"],
      })) as string;
      maxContribution = iface.decodeFunctionResult("maxContribution", result)[0].toString();
    } catch {
      // ignore
    }
  }

  return { isActive, currentTier, pricePerToken, remainingTokens, maxContribution };
}

