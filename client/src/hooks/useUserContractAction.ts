import { useContractAction, type ContractActionOptions } from "./useContractAction";

/**
 * Configuration for user-initiated contract actions
 * These actions require the user to sign with their own wallet
 */
export type UserContractActionConfig = Omit<ContractActionOptions, "mode">;

/**
 * Hook for user-initiated contract actions
 * Always uses "user-wallet" mode - user must sign with their own wallet
 * 
 * Use this for actions where:
 * - Funds come from/go to user's wallet
 * - User is the on-chain participant (msg.sender = user address)
 * - User bears the risk and pays gas
 * 
 * Examples:
 * - TGESale.purchase
 * - StakingRewards.stake/withdraw/getReward
 * - ReferralRegistry.selfRegister
 */
export function useUserContractAction(config: UserContractActionConfig) {
  return useContractAction({
    ...config,
    mode: "user-wallet",
  });
}

