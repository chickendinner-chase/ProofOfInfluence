import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { MERKLE_AIRDROP_ADDRESS, POI_TOKEN_ADDRESS } from "@/lib/baseConfig";
import { formatUnits } from "viem";

const MERKLE_AIRDROP_ABI = [
  {
    inputs: [],
    name: "currentRound",
    outputs: [{ internalType: "uint64", name: "", type: "uint64" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint64", name: "roundId", type: "uint64" },
      { internalType: "uint256", name: "index", type: "uint256" },
    ],
    name: "isClaimed",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "index", type: "uint256" },
      { internalType: "address", name: "account", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "bytes32[]", name: "merkleProof", type: "bytes32[]" },
    ],
    name: "claim",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint64", name: "roundId", type: "uint64" },
      { internalType: "uint256", name: "index", type: "uint256" },
      { internalType: "address", name: "account", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "bytes32[]", name: "merkleProof", type: "bytes32[]" },
    ],
    name: "claimFromRound",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "paused",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export interface AirdropEligibility {
  index: number;
  amount: bigint;
  proof: `0x${string}`[];
  roundId: bigint;
}

export interface UseAirdropResult {
  currentRound: bigint | null;
  isPaused: boolean;
  isClaimed: (roundId: bigint, index: number) => boolean;
  claim: (eligibility: AirdropEligibility) => Promise<void>;
  isClaiming: boolean;
  isLoading: boolean;
  isConfigured: boolean;
}

export function useAirdrop(): UseAirdropResult {
  const { address } = useAccount();
  const isConfigured = MERKLE_AIRDROP_ADDRESS !== "0x0000000000000000000000000000000000000000";

  const {
    data: currentRound,
    isLoading: isLoadingRound,
    refetch: refetchRound,
  } = useReadContract({
    address: MERKLE_AIRDROP_ADDRESS,
    abi: MERKLE_AIRDROP_ABI,
    functionName: "currentRound",
    query: { enabled: isConfigured },
  });

  const {
    data: isPaused,
    isLoading: isLoadingPaused,
    refetch: refetchPaused,
  } = useReadContract({
    address: MERKLE_AIRDROP_ADDRESS,
    abi: MERKLE_AIRDROP_ABI,
    functionName: "paused",
    query: { enabled: isConfigured },
  });

  const { writeContract, data: claimHash, isPending: isClaiming } = useWriteContract();
  const { isLoading: isWaitingClaim } = useWaitForTransactionReceipt({
    hash: claimHash,
  });

  // Note: isClaimed is a synchronous function that returns a boolean
  // For real-time checking, use the useReadContract hook directly in components
  // This function is kept for backward compatibility but should be replaced with
  // direct contract reads in components that need real-time status
  const isClaimed = (roundId: bigint, index: number): boolean => {
    // This is a placeholder - components should use useReadContract directly
    // Example usage in component:
    // const { data: claimed } = useReadContract({
    //   address: MERKLE_AIRDROP_ADDRESS,
    //   abi: MERKLE_AIRDROP_ABI,
    //   functionName: "isClaimed",
    //   args: [roundId, BigInt(index)],
    //   query: { enabled: isConfigured },
    // });
    return false;
  };

  const claim = async (eligibility: AirdropEligibility) => {
    if (!isConfigured) throw new Error("MerkleAirdropDistributor not configured");
    if (!address) throw new Error("Wallet not connected");

    await writeContract({
      address: MERKLE_AIRDROP_ADDRESS,
      abi: MERKLE_AIRDROP_ABI,
      functionName: eligibility.roundId === currentRound ? "claim" : "claimFromRound",
      args:
        eligibility.roundId === currentRound
          ? [BigInt(eligibility.index), address, eligibility.amount, eligibility.proof]
          : [eligibility.roundId, BigInt(eligibility.index), address, eligibility.amount, eligibility.proof],
    });

    // Wait for transaction, then refetch
    setTimeout(() => {
      refetchRound();
      refetchPaused();
    }, 2000);
  };

  return {
    currentRound: currentRound ?? null,
    isPaused: isPaused ?? false,
    isClaimed,
    claim,
    isClaiming: isClaiming || isWaitingClaim,
    isLoading: isLoadingRound || isLoadingPaused,
    isConfigured,
  };
}

