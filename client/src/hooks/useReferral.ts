import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { REFERRAL_REGISTRY_ADDRESS, BASE_CHAIN_ID } from "@/lib/baseConfig";
import { formatUnits } from "viem";

const REFERRAL_REGISTRY_ABI = [
  {
    inputs: [{ internalType: "address", name: "invitee", type: "address" }],
    name: "getReferral",
    outputs: [
      {
        components: [
          { internalType: "address", name: "inviter", type: "address" },
          { internalType: "bytes32", name: "code", type: "bytes32" },
          { internalType: "uint64", name: "timestamp", type: "uint64" },
          { internalType: "bool", name: "exists", type: "bool" },
        ],
        internalType: "struct ReferralRegistry.Referral",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "invitee", type: "address" }],
    name: "hasReferral",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "referralCounts",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "totalRewardsEarned",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "inviter", type: "address" },
      { internalType: "bytes32", name: "code", type: "bytes32" },
    ],
    name: "selfRegister",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export interface ReferralData {
  inviter: `0x${string}`;
  code: `0x${string}`;
  timestamp: bigint;
  exists: boolean;
}

export interface UseReferralResult {
  referral: ReferralData | null;
  hasReferral: boolean;
  referralCount: bigint | null;
  totalRewardsEarned: bigint | null;
  formattedRewards: string;
  selfRegister: (inviter: `0x${string}`, code: string) => Promise<void>;
  isRegistering: boolean;
  isLoading: boolean;
  isConfigured: boolean;
}

export function useReferral(): UseReferralResult {
  const { address } = useAccount();
  const isConfigured = REFERRAL_REGISTRY_ADDRESS !== "0x0000000000000000000000000000000000000000";

  const {
    data: referral,
    isLoading: isLoadingReferral,
    refetch: refetchReferral,
  } = useReadContract({
    address: REFERRAL_REGISTRY_ADDRESS,
    abi: REFERRAL_REGISTRY_ABI,
    functionName: "getReferral",
    args: address ? [address] : undefined,
    query: { enabled: isConfigured && !!address },
  });

  const {
    data: hasReferral,
    isLoading: isLoadingHasReferral,
  } = useReadContract({
    address: REFERRAL_REGISTRY_ADDRESS,
    abi: REFERRAL_REGISTRY_ABI,
    functionName: "hasReferral",
    args: address ? [address] : undefined,
    query: { enabled: isConfigured && !!address },
  });

  const {
    data: referralCount,
    isLoading: isLoadingCount,
  } = useReadContract({
    address: REFERRAL_REGISTRY_ADDRESS,
    abi: REFERRAL_REGISTRY_ABI,
    functionName: "referralCounts",
    args: address ? [address] : undefined,
    query: { enabled: isConfigured && !!address },
  });

  const {
    data: totalRewardsEarned,
    isLoading: isLoadingRewards,
  } = useReadContract({
    address: REFERRAL_REGISTRY_ADDRESS,
    abi: REFERRAL_REGISTRY_ABI,
    functionName: "totalRewardsEarned",
    args: address ? [address] : undefined,
    query: { enabled: isConfigured && !!address },
  });

  const { writeContract, data: registerHash, isPending: isRegistering } = useWriteContract();
  const { isLoading: isWaitingRegister } = useWaitForTransactionReceipt({
    hash: registerHash,
  });

  const formattedRewards = totalRewardsEarned
    ? formatUnits(totalRewardsEarned, 18)
    : "0.00";

  const selfRegister = async (inviter: `0x${string}`, code: string) => {
    if (!isConfigured) throw new Error("ReferralRegistry not configured");
    if (!address) throw new Error("Wallet not connected");

    // Convert code string to bytes32
    const codeBytes32 = `0x${Buffer.from(code.padEnd(32, "\0")).toString("hex")}` as `0x${string}`;

    await writeContract({
      address: REFERRAL_REGISTRY_ADDRESS,
      abi: REFERRAL_REGISTRY_ABI,
      functionName: "selfRegister",
      args: [inviter, codeBytes32],
    });

    // Wait for transaction, then refetch
    setTimeout(() => {
      refetchReferral();
    }, 2000);
  };

  return {
    referral: referral as ReferralData | null,
    hasReferral: hasReferral ?? false,
    referralCount: referralCount ?? null,
    totalRewardsEarned: totalRewardsEarned ?? null,
    formattedRewards,
    selfRegister,
    isRegistering: isRegistering || isWaitingRegister,
    isLoading: isLoadingReferral || isLoadingHasReferral || isLoadingCount || isLoadingRewards,
    isConfigured,
  };
}

