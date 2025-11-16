import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useWalletClient, usePublicClient } from "wagmi";
import { useToast } from "@/hooks/use-toast";

interface ContractActionOptions {
  contract: string;
  action: string;
  mode?: "user-wallet" | "agentkit";
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

interface ExecuteOptions {
  args: any;
  mode?: "user-wallet" | "agentkit";
}

/**
 * Unified hook for executing contract actions
 * Supports two modes:
 * - user-wallet: User signs transaction with their connected wallet (MetaMask)
 * - agentkit: Backend executes transaction via AgentKit CDP wallet
 */
export function useContractAction(options: ContractActionOptions) {
  const { contract, action, mode: defaultMode = "agentkit" } = options;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const mutation = useMutation({
    mutationFn: async ({ args, mode = defaultMode }: ExecuteOptions) => {
      if (mode === "agentkit") {
        // AgentKit mode: Backend executes via CDP wallet
        const response = await fetch(`/api/contracts/${contract}/${action}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ mode: "agentkit", args }),
        });

        if (!response.ok) {
          const error = await safeJson(response);
          throw new Error((error && error.message) || `Failed to execute ${action}`);
        }

        return await response.json();
      } else {
        // User-wallet mode: Frontend signs and sends transaction
        if (!walletClient) {
          throw new Error("Please connect your wallet");
        }

        // Get transaction data from backend
        const prepareResponse = await fetch(`/api/contracts/${contract}/${action}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ mode: "user-wallet", args }),
        });

        if (!prepareResponse.ok) {
          const error = await safeJson(prepareResponse);
          throw new Error((error && error.message) || `Failed to prepare ${action}`);
        }

        const { to, data, value } = await prepareResponse.json();

        // Send transaction via user's wallet
        const hash = await walletClient.sendTransaction({
          to: to as `0x${string}`,
          data: data as `0x${string}`,
          value: BigInt(value || 0),
        });

        // Wait for transaction confirmation
        if (publicClient) {
          await publicClient.waitForTransactionReceipt({ hash });
        }

        return { txHash: hash, status: "success", mode: "user-wallet" };
      }
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/immortality/balance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/immortality/actions"] });

      // Show success toast
      toast({
        title: "Transaction Successful",
        description: data?.txHash
          ? `Transaction: ${String(data.txHash).slice(0, 10)}...`
          : "Action completed successfully",
      });

      options.onSuccess?.(data);
    },
    onError: (error: Error) => {
      toast({
        title: "Transaction Failed",
        description: error.message,
        variant: "destructive",
      });

      options.onError?.(error);
    },
  });

  return {
    execute: mutation.mutate,
    executeAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
}

async function safeJson(res: Response): Promise<any | null> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Specialized hooks for common contract actions
 */

// Badge minting
export function useMintBadge(options?: { onSuccess?: (data: any) => void }) {
  return useContractAction({
    contract: "ImmortalityBadge",
    action: "mintBadge",
    mode: "agentkit",
    ...options,
  });
}

// TGE purchase
export function useTgePurchase(options?: { onSuccess?: (data: any) => void }) {
  return useContractAction({
    contract: "TGESale",
    action: "purchase",
    mode: "agentkit",
    ...options,
  });
}

// Staking
export function useStakePoi(options?: { onSuccess?: (data: any) => void }) {
  return useContractAction({
    contract: "StakingRewards",
    action: "stake",
    mode: "agentkit",
    ...options,
  });
}

export function useUnstakePoi(options?: { onSuccess?: (data: any) => void }) {
  return useContractAction({
    contract: "StakingRewards",
    action: "unstake",
    mode: "agentkit",
    ...options,
  });
}

export function useClaimReward(options?: { onSuccess?: (data: any) => void }) {
  return useContractAction({
    contract: "StakingRewards",
    action: "claimReward",
    mode: "agentkit",
    ...options,
  });
}

