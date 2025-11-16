import { useMemo } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from "wagmi";
import { useQueries } from "@tanstack/react-query";
import { VESTING_VAULT_ADDRESS, POI_TOKEN_ADDRESS, BASE_CHAIN_ID } from "@/lib/baseConfig";
import { formatUnits, parseUnits } from "viem";

const VESTING_VAULT_ABI = [
  {
    inputs: [{ internalType: "uint256", name: "scheduleId", type: "uint256" }],
    name: "getSchedule",
    outputs: [
      {
        components: [
          { internalType: "address", name: "beneficiary", type: "address" },
          { internalType: "uint256", name: "totalAmount", type: "uint256" },
          { internalType: "uint256", name: "released", type: "uint256" },
          { internalType: "uint64", name: "start", type: "uint64" },
          { internalType: "uint64", name: "cliff", type: "uint64" },
          { internalType: "uint64", name: "duration", type: "uint64" },
          { internalType: "uint64", name: "slicePeriodSeconds", type: "uint64" },
          { internalType: "bool", name: "revocable", type: "bool" },
          { internalType: "bool", name: "revoked", type: "bool" },
        ],
        internalType: "struct VestingVault.Schedule",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "beneficiary", type: "address" }],
    name: "schedulesOf",
    outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "scheduleId", type: "uint256" }],
    name: "releasableAmount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "scheduleId", type: "uint256" }],
    name: "release",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export interface VestingSchedule {
  beneficiary: `0x${string}`;
  totalAmount: bigint;
  released: bigint;
  start: bigint;
  cliff: bigint;
  duration: bigint;
  slicePeriodSeconds: bigint;
  revocable: boolean;
  revoked: boolean;
}

export interface UseVestingVaultResult {
  schedules: bigint[];
  scheduleData: Map<number, VestingSchedule>;
  releasableAmounts: Map<number, bigint>;
  isLoading: boolean;
  release: (scheduleId: number) => Promise<void>;
  isReleasing: boolean;
  isConfigured: boolean;
}

export function useVestingVault(): UseVestingVaultResult {
  const { address } = useAccount();
  const isConfigured = VESTING_VAULT_ADDRESS !== "0x0000000000000000000000000000000000000000";

  // Get user's schedules
  const {
    data: schedules,
    isLoading: isLoadingSchedules,
    refetch: refetchSchedules,
  } = useReadContract({
    address: VESTING_VAULT_ADDRESS,
    abi: VESTING_VAULT_ABI,
    functionName: "schedulesOf",
    args: address ? [address] : undefined,
    query: { enabled: isConfigured && !!address },
  });

  // Get schedule data for each schedule using useQueries
  const scheduleIds = schedules || [];
  const publicClient = usePublicClient({ chainId: BASE_CHAIN_ID });

  const scheduleQueryConfigs = useMemo(
    () =>
      scheduleIds.map((id) => ({
        queryKey: ["vestingSchedule", VESTING_VAULT_ADDRESS, id.toString()] as const,
        queryFn: async () => {
          if (!publicClient || !isConfigured) return null;
          return await publicClient.readContract({
            address: VESTING_VAULT_ADDRESS,
            abi: VESTING_VAULT_ABI,
            functionName: "getSchedule",
            args: [id],
          }) as VestingSchedule;
        },
        enabled: isConfigured && !!publicClient,
      })),
    [scheduleIds, publicClient, isConfigured]
  );

  const scheduleQueries = useQueries({
    queries: scheduleQueryConfigs,
  });

  // Get releasable amounts using useQueries
  const releasableQueryConfigs = useMemo(
    () =>
      scheduleIds.map((id) => ({
        queryKey: ["vestingReleasable", VESTING_VAULT_ADDRESS, id.toString()] as const,
        queryFn: async () => {
          if (!publicClient || !isConfigured) return null;
          return await publicClient.readContract({
            address: VESTING_VAULT_ADDRESS,
            abi: VESTING_VAULT_ABI,
            functionName: "releasableAmount",
            args: [id],
          }) as bigint;
        },
        enabled: isConfigured && !!publicClient,
      })),
    [scheduleIds, publicClient, isConfigured]
  );

  const releasableQueries = useQueries({
    queries: releasableQueryConfigs,
  });

  const { writeContract, data: releaseHash, isPending: isReleasing } = useWriteContract();
  const { isLoading: isWaitingRelease } = useWaitForTransactionReceipt({
    hash: releaseHash,
  });

  const scheduleData = new Map<number, VestingSchedule>();
  scheduleQueries.forEach((query, index) => {
    if (query.data) {
      scheduleData.set(Number(scheduleIds[index]), query.data);
    }
  });

  const releasableAmounts = new Map<number, bigint>();
  releasableQueries.forEach((query, index) => {
    if (query.data !== null && query.data !== undefined) {
      releasableAmounts.set(Number(scheduleIds[index]), query.data);
    }
  });

  const release = async (scheduleId: number) => {
    if (!isConfigured) throw new Error("VestingVault not configured");
    await writeContract({
      address: VESTING_VAULT_ADDRESS,
      abi: VESTING_VAULT_ABI,
      functionName: "release",
      args: [BigInt(scheduleId)],
    });
    // Wait for transaction, then refetch
    setTimeout(() => {
      refetchSchedules();
      scheduleQueries.forEach((q) => q.refetch());
      releasableQueries.forEach((q) => q.refetch());
    }, 2000);
  };

  return {
    schedules: scheduleIds,
    scheduleData,
    releasableAmounts,
    isLoading: isLoadingSchedules || scheduleQueries.some((q) => q.isLoading) || releasableQueries.some((q) => q.isLoading),
    release,
    isReleasing: isReleasing || isWaitingRelease,
    isConfigured,
  };
}

