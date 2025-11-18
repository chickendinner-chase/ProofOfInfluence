import { useContractAction, type ContractActionOptions } from "./useContractAction";

/**
 * Configuration for agent-initiated contract actions
 * These actions are executed by the backend/AgentKit wallet
 */
export type AgentContractActionConfig = Omit<ContractActionOptions, "mode">;

/**
 * Hook for agent-initiated contract actions
 * Always uses "agentkit" mode - backend executes via AgentKit CDP wallet
 * 
 * Use this for actions where:
 * - Contract has explicit `to`/`beneficiary` parameter
 * - Backend can represent the user (e.g. has MINTER_ROLE)
 * - No direct user wallet involvement required
 * 
 * Examples:
 * - ImmortalityBadge.mintBadge(to, badgeType) - backend has MINTER_ROLE
 * - Future agent-mediated actions
 */
export function useAgentContractAction(config: AgentContractActionConfig) {
  return useContractAction({
    ...config,
    mode: "agentkit",
  });
}

