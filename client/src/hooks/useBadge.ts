import { useMemo } from "react";
import { useAccount, useReadContract, usePublicClient } from "wagmi";
import { ACHIEVEMENT_BADGES_ADDRESS, BASE_CHAIN_ID } from "@/lib/baseConfig";
import { useQueries } from "@tanstack/react-query";

const ACHIEVEMENT_BADGES_ABI = [
  {
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "ownerOf",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "tokenURI",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "badgeTypeOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "badgeType", type: "uint256" }],
    name: "getBadgeType",
    outputs: [
      {
        components: [
          { internalType: "string", name: "uri", type: "string" },
          { internalType: "bool", name: "enabled", type: "bool" },
        ],
        internalType: "struct AchievementBadges.BadgeType",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

export interface BadgeInfo {
  tokenId: bigint;
  badgeType: bigint;
  tokenURI: string;
}

export interface UseBadgeResult {
  balance: bigint | null;
  badges: BadgeInfo[];
  isLoading: boolean;
  isConfigured: boolean;
  fetchBadges: (tokenIds: bigint[]) => Promise<void>;
  refetch: () => void;
}

/**
 * Hook to interact with AchievementBadges contract
 * Note: Contract doesn't implement ERC721Enumerable, so we need tokenIds from events or backend
 */
export function useBadge(): UseBadgeResult {
  const { address } = useAccount();
  const isConfigured = ACHIEVEMENT_BADGES_ADDRESS !== "0x0000000000000000000000000000000000000000";
  const publicClient = usePublicClient({ chainId: BASE_CHAIN_ID });

  // Get badge balance
  const {
    data: balance,
    isLoading: isLoadingBalance,
    refetch: refetchBalance,
  } = useReadContract({
    address: ACHIEVEMENT_BADGES_ADDRESS,
    abi: ACHIEVEMENT_BADGES_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: isConfigured && !!address },
  });

  // For now, we'll use a simplified approach
  // In production, token IDs should come from events or a backend indexer
  const badges: BadgeInfo[] = useMemo(() => {
    // This will be populated when tokenIds are provided
    return [];
  }, []);

  const fetchBadges = async (tokenIds: bigint[]) => {
    if (!publicClient || !isConfigured || tokenIds.length === 0) return;

    // This would fetch badge details for given token IDs
    // Implementation would use useQueries or batch readContract calls
  };

  const refetch = () => {
    refetchBalance();
  };

  return {
    balance: balance ?? null,
    badges,
    isLoading: isLoadingBalance,
    isConfigured,
    fetchBadges,
    refetch,
  };
}

