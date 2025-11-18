import { useMemo } from "react";
import { useAccount, useReadContract, usePublicClient } from "wagmi";
import { useQuery, useQueries } from "@tanstack/react-query";
import { ACHIEVEMENT_BADGES_ADDRESS, BASE_CHAIN_ID } from "@/lib/baseConfig";

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

  // Fetch token IDs from backend API
  const {
    data: badgesData,
    isLoading: isLoadingBadges,
    refetch: refetchBadges,
  } = useQuery({
    queryKey: ["badges", address],
    queryFn: async () => {
      if (!address) return null;
      
      const response = await fetch(`/api/badges/tokens?address=${address}`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch badges");
      }
      
      return await response.json();
    },
    enabled: isConfigured && !!address,
    staleTime: 30000, // 30 seconds
  });

  // Fetch badge details from contract using tokenIds
  const tokenIds = badgesData?.tokenIds || [];
  const badgeQueries = useQueries({
    queries: tokenIds.map((tokenId: string) => ({
      queryKey: ["badge", tokenId],
      queryFn: async () => {
        if (!publicClient || !isConfigured) return null;
        
        const [badgeType, tokenURI] = await Promise.all([
          publicClient.readContract({
            address: ACHIEVEMENT_BADGES_ADDRESS,
            abi: ACHIEVEMENT_BADGES_ABI,
            functionName: "badgeTypeOf",
            args: [BigInt(tokenId)],
          }) as Promise<bigint>,
          publicClient.readContract({
            address: ACHIEVEMENT_BADGES_ADDRESS,
            abi: ACHIEVEMENT_BADGES_ABI,
            functionName: "tokenURI",
            args: [BigInt(tokenId)],
          }) as Promise<string>,
        ]);
        
        return {
          tokenId: BigInt(tokenId),
          badgeType,
          tokenURI,
        } as BadgeInfo;
      },
      enabled: isConfigured && !!tokenId,
      staleTime: 60000, // 1 minute
    })),
  });

  // Combine badge data
  const badges: BadgeInfo[] = useMemo(() => {
    return badgeQueries
      .map((query) => query.data)
      .filter((badge): badge is BadgeInfo => badge !== null && badge !== undefined);
  }, [badgeQueries]);

  const fetchBadges = async (tokenIds: bigint[]) => {
    // Trigger refetch if needed
    await refetchBadges();
  };

  const refetch = () => {
    refetchBalance();
    refetchBadges();
  };

  return {
    balance: balance ?? null,
    badges,
    isLoading: isLoadingBalance || isLoadingBadges,
    isConfigured,
    fetchBadges,
    refetch,
  };
}

