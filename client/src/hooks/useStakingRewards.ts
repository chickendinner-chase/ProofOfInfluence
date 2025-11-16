import { useAccount, useReadContract, useWriteContract, usePublicClient } from "wagmi";
import { useCallback, useMemo, useState } from "react";
import { formatUnits, parseUnits } from "viem";
import { STAKING_REWARDS_ADDRESS, BASE_CHAIN_ID } from "@/lib/baseConfig";

const STAKING_ABI = [
  "function stake(uint256 amount) external",
  "function withdraw(uint256 amount) external",
  "function getReward() external",
  "function exit() external",
  "function balanceOf(address) view returns (uint256)",
  "function earned(address) view returns (uint256)",
  "function rewardRate() view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function periodFinish() view returns (uint256)",
  "function rewardsDuration() view returns (uint256)",
] as const;

const POI_UNIT = 18;
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export interface UseStakingRewardsResult {
  // State
  stakedBalance: bigint;
  earned: bigint;
  formattedStaked: string;
  formattedEarned: string;
  rewardRate: bigint | null;
  totalSupply: bigint | null;
  periodFinish: bigint | null;
  rewardsDuration: bigint | null;
  
  // Actions
  stake: (amount: string) => Promise<`0x${string}`>;
  withdraw: (amount: string) => Promise<`0x${string}`>;
  claimReward: () => Promise<`0x${string}`>;
  exit: () => Promise<`0x${string}`>;
  
  // Loading states
  isStaking: boolean;
  isWithdrawing: boolean;
  isClaiming: boolean;
  
  // Utils
  refetch: () => Promise<void>;
  isConfigured: boolean;
}

/**
 * Hook to interact with StakingRewards contract
 * Provides staking, withdrawal, reward claiming, and exit functionality
 */
export function useStakingRewards(): UseStakingRewardsResult {
  const { address } = useAccount();
  const publicClient = usePublicClient({ chainId: BASE_CHAIN_ID });
  const { writeContractAsync } = useWriteContract();

  const stakingAddress = STAKING_REWARDS_ADDRESS !== ZERO_ADDRESS ? STAKING_REWARDS_ADDRESS : ZERO_ADDRESS;
  const enabled = stakingAddress !== ZERO_ADDRESS && Boolean(address);

  const [isStaking, setIsStaking] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  // Read staked balance
  const { data: stakedBalance, refetch: refetchStaked } = useReadContract({
    address: stakingAddress,
    abi: STAKING_ABI,
    functionName: "balanceOf",
    args: [address!],
    query: { enabled },
  });

  // Read earned rewards
  const { data: earned, refetch: refetchEarned } = useReadContract({
    address: stakingAddress,
    abi: STAKING_ABI,
    functionName: "earned",
    args: [address!],
    query: { enabled },
  });

  // Read reward rate
  const { data: rewardRate } = useReadContract({
    address: stakingAddress,
    abi: STAKING_ABI,
    functionName: "rewardRate",
    query: { enabled },
  });

  // Read total supply
  const { data: totalSupply } = useReadContract({
    address: stakingAddress,
    abi: STAKING_ABI,
    functionName: "totalSupply",
    query: { enabled },
  });

  // Read period finish
  const { data: periodFinish } = useReadContract({
    address: stakingAddress,
    abi: STAKING_ABI,
    functionName: "periodFinish",
    query: { enabled },
  });

  // Read rewards duration
  const { data: rewardsDuration } = useReadContract({
    address: stakingAddress,
    abi: STAKING_ABI,
    functionName: "rewardsDuration",
    query: { enabled },
  });

  const stake = useCallback(
    async (amount: string): Promise<`0x${string}`> => {
      if (stakingAddress === ZERO_ADDRESS) {
        throw new Error("StakingRewards contract not configured");
      }
      setIsStaking(true);
      try {
        const parsedAmount = parseUnits(amount, POI_UNIT);
        const hash = await writeContractAsync({
          address: stakingAddress,
          abi: STAKING_ABI,
          functionName: "stake",
          args: [parsedAmount],
        });
        if (publicClient) {
          await publicClient.waitForTransactionReceipt({ hash });
        }
        await refetchStaked();
        return hash;
      } finally {
        setIsStaking(false);
      }
    },
    [stakingAddress, writeContractAsync, publicClient, refetchStaked],
  );

  const withdraw = useCallback(
    async (amount: string): Promise<`0x${string}`> => {
      if (stakingAddress === ZERO_ADDRESS) {
        throw new Error("StakingRewards contract not configured");
      }
      setIsWithdrawing(true);
      try {
        const parsedAmount = parseUnits(amount, POI_UNIT);
        const hash = await writeContractAsync({
          address: stakingAddress,
          abi: STAKING_ABI,
          functionName: "withdraw",
          args: [parsedAmount],
        });
        if (publicClient) {
          await publicClient.waitForTransactionReceipt({ hash });
        }
        await refetchStaked();
        return hash;
      } finally {
        setIsWithdrawing(false);
      }
    },
    [stakingAddress, writeContractAsync, publicClient, refetchStaked],
  );

  const claimReward = useCallback(async (): Promise<`0x${string}`> => {
    if (stakingAddress === ZERO_ADDRESS) {
      throw new Error("StakingRewards contract not configured");
    }
    setIsClaiming(true);
    try {
      const hash = await writeContractAsync({
        address: stakingAddress,
        abi: STAKING_ABI,
        functionName: "getReward",
      });
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash });
      }
      await refetchEarned();
      return hash;
    } finally {
      setIsClaiming(false);
    }
  }, [stakingAddress, writeContractAsync, publicClient, refetchEarned]);

  const exit = useCallback(async (): Promise<`0x${string}`> => {
    if (stakingAddress === ZERO_ADDRESS) {
      throw new Error("StakingRewards contract not configured");
    }
    setIsWithdrawing(true);
    try {
      const hash = await writeContractAsync({
        address: stakingAddress,
        abi: STAKING_ABI,
        functionName: "exit",
      });
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash });
      }
      await Promise.all([refetchStaked(), refetchEarned()]);
      return hash;
    } finally {
      setIsWithdrawing(false);
    }
  }, [stakingAddress, writeContractAsync, publicClient, refetchStaked, refetchEarned]);

  const refetch = useCallback(async () => {
    await Promise.all([refetchStaked(), refetchEarned()]);
  }, [refetchStaked, refetchEarned]);

  const formattedStaked = useMemo(() => {
    if (!stakedBalance) return "0.00";
    return Number(formatUnits(stakedBalance, POI_UNIT)).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, [stakedBalance]);

  const formattedEarned = useMemo(() => {
    if (!earned) return "0.00";
    return Number(formatUnits(earned, POI_UNIT)).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, [earned]);

  return {
    stakedBalance: stakedBalance ?? 0n,
    earned: earned ?? 0n,
    formattedStaked,
    formattedEarned,
    rewardRate: rewardRate ?? null,
    totalSupply: totalSupply ?? null,
    periodFinish: periodFinish ?? null,
    rewardsDuration: rewardsDuration ?? null,
    stake,
    withdraw,
    claimReward,
    exit,
    isStaking,
    isWithdrawing,
    isClaiming,
    refetch,
    isConfigured: stakingAddress !== ZERO_ADDRESS,
  };
}

