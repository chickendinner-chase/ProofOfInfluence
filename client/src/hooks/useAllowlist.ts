import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { EARLY_BIRD_ALLOWLIST_ADDRESS } from "@/lib/baseConfig";

const EARLY_BIRD_ALLOWLIST_ABI = [
  {
    inputs: [
      { internalType: "address", name: "account", type: "address" },
      { internalType: "uint256", name: "allocation", type: "uint256" },
      { internalType: "bytes32[]", name: "proof", type: "bytes32[]" },
    ],
    name: "verify",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "remaining",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "merkleRoot",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "rootVersion",
    outputs: [{ internalType: "uint64", name: "", type: "uint64" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export interface UseAllowlistResult {
  merkleRoot: `0x${string}` | null;
  rootVersion: bigint | null;
  verify: (account: `0x${string}`, allocation: bigint, proof: `0x${string}`[]) => Promise<boolean>;
  remaining: bigint | null;
  isLoading: boolean;
  isConfigured: boolean;
}

export function useAllowlist(): UseAllowlistResult {
  const { address } = useAccount();
  const isConfigured = EARLY_BIRD_ALLOWLIST_ADDRESS !== "0x0000000000000000000000000000000000000000";

  const {
    data: merkleRoot,
    isLoading: isLoadingRoot,
    refetch: refetchRoot,
  } = useReadContract({
    address: EARLY_BIRD_ALLOWLIST_ADDRESS,
    abi: EARLY_BIRD_ALLOWLIST_ABI,
    functionName: "merkleRoot",
    query: { enabled: isConfigured },
  });

  const {
    data: rootVersion,
    isLoading: isLoadingVersion,
    refetch: refetchVersion,
  } = useReadContract({
    address: EARLY_BIRD_ALLOWLIST_ADDRESS,
    abi: EARLY_BIRD_ALLOWLIST_ABI,
    functionName: "rootVersion",
    query: { enabled: isConfigured },
  });

  const {
    data: remaining,
    isLoading: isLoadingRemaining,
    refetch: refetchRemaining,
  } = useReadContract({
    address: EARLY_BIRD_ALLOWLIST_ADDRESS,
    abi: EARLY_BIRD_ALLOWLIST_ABI,
    functionName: "remaining",
    args: address ? [address] : undefined,
    query: { enabled: isConfigured && !!address },
  });

  // Note: verify is an async function that should call the contract
  // For real-time verification in components, use useReadContract directly
  // This function is kept for backward compatibility
  const verify = async (
    account: `0x${string}`,
    allocation: bigint,
    proof: `0x${string}`[]
  ): Promise<boolean> => {
    if (!isConfigured) return false;
    // Components should use useReadContract directly for real-time verification
    // Example usage in component:
    // const { data: isValid } = useReadContract({
    //   address: EARLY_BIRD_ALLOWLIST_ADDRESS,
    //   abi: EARLY_BIRD_ALLOWLIST_ABI,
    //   functionName: "verify",
    //   args: [account, allocation, proof],
    //   query: { enabled: isConfigured && !!account && !!proof.length },
    // });
    return false;
  };

  return {
    merkleRoot: merkleRoot ?? null,
    rootVersion: rootVersion ?? null,
    verify,
    remaining: remaining ?? null,
    isLoading: isLoadingRoot || isLoadingVersion || isLoadingRemaining,
    isConfigured,
  };
}

