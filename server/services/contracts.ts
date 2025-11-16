import { utils } from "ethers";
import { getAgentKitContext } from "../agentkit/agentkitClient";
import { mintTestBadge } from "../agentkit/badge";
import badgeConfig from "@shared/contracts/immortality_badge.json";
import tgeConfig from "@shared/contracts/poi_tge.json";
import stakingConfig from "@shared/contracts/staking_rewards.json";

// Contract configurations
const CONTRACT_CONFIGS: Record<string, { address: string; abi: any; name: string }> = {
  ImmortalityBadge: {
    address: badgeConfig.address,
    abi: badgeConfig.abi,
    name: "ImmortalityBadge",
  },
  TGESale: {
    address: tgeConfig.address,
    abi: tgeConfig.abi,
    name: "TGESale",
  },
  StakingRewards: {
    address: stakingConfig.address,
    abi: stakingConfig.abi,
    name: "StakingRewards",
  },
};

interface TransactionRequest {
  to: string;
  data: string;
  value?: string;
}

interface CallOptions {
  mode: "user-wallet" | "agentkit";
  userWallet?: string;
}

export class ContractService {
  /**
   * Prepare transaction data for user wallet signing (frontend MetaMask)
   */
  async prepareTransaction(
    contract: string,
    action: string,
    args: any[]
  ): Promise<TransactionRequest> {
    const config = CONTRACT_CONFIGS[contract];
    if (!config) {
      throw new Error(`Contract ${contract} not found`);
    }

    if (!config.address || config.address === "0x0000000000000000000000000000000000000000") {
      throw new Error(`Contract ${contract} not deployed`);
    }

    const iface = new utils.Interface(config.abi);
    const data = iface.encodeFunctionData(action, args);

    return {
      to: config.address,
      data,
      value: "0",
    };
  }

  /**
   * Execute transaction via AgentKit (backend controlled wallet)
   */
  async executeViaAgentKit(
    contract: string,
    action: string,
    args: any,
    userWallet: string
  ): Promise<{ txHash: string; [key: string]: any }> {
    // Route to appropriate helper based on contract
    switch (contract) {
      case "ImmortalityBadge":
        return await this.executeBadgeAction(action, args, userWallet);
      
      case "TGESale":
        return await this.executeTGEAction(action, args, userWallet);
      
      case "StakingRewards":
        return await this.executeStakingAction(action, args, userWallet);
      
      default:
        throw new Error(`AgentKit execution not supported for ${contract}`);
    }
  }

  /**
   * Execute badge actions via AgentKit
   */
  private async executeBadgeAction(
    action: string,
    args: any,
    userWallet: string
  ): Promise<{ txHash: string }> {
    if (action === "mintBadge" || action === "mintTestBadge") {
      const txHash = await mintTestBadge(userWallet);
      return { txHash };
    }
    throw new Error(`Badge action ${action} not supported`);
  }

  /**
   * Execute TGE actions via AgentKit
   */
  private async executeTGEAction(
    action: string,
    args: any,
    userWallet: string
  ): Promise<{ txHash: string; usdcAmount?: string; poiAmount?: string }> {
    const { buyWithBaseToken } = await import("../agentkit/tge");
    
    if (action === "purchase" || action === "buyWithBaseToken") {
      const { usdcAmount, proof = [] } = args;
      const result = await buyWithBaseToken(usdcAmount, proof);
      return result;
    }
    throw new Error(`TGE action ${action} not supported`);
  }

  /**
   * Execute staking actions via AgentKit
   */
  private async executeStakingAction(
    action: string,
    args: any,
    userWallet: string
  ): Promise<{ txHash: string; amount?: string; reward?: string }> {
    const { stakePoi, unstakePoi, claimReward } = await import("../agentkit/staking");
    
    switch (action) {
      case "stake":
        return await stakePoi(args.amount, userWallet);
      
      case "withdraw":
      case "unstake":
        return await unstakePoi(args.amount, userWallet);
      
      case "getReward":
      case "claimReward":
        return await claimReward(userWallet);
      
      default:
        throw new Error(`Staking action ${action} not supported`);
    }
  }

  /**
   * Main entry point - unified call method
   */
  async call(
    contract: string,
    action: string,
    args: any,
    options: CallOptions
  ): Promise<any> {
    if (options.mode === "agentkit") {
      if (!options.userWallet) {
        throw new Error("userWallet is required for agentkit mode");
      }
      return await this.executeViaAgentKit(contract, action, args, options.userWallet);
    } else {
      // user-wallet mode: return transaction request for frontend to sign
      const argsArray = Array.isArray(args) ? args : Object.values(args);
      return await this.prepareTransaction(contract, action, argsArray);
    }
  }

  /**
   * Get contract configuration
   */
  getContractConfig(contract: string) {
    return CONTRACT_CONFIGS[contract];
  }

  /**
   * Check if contract is deployed
   */
  isContractDeployed(contract: string): boolean {
    const config = CONTRACT_CONFIGS[contract];
    return !!(
      config &&
      config.address &&
      config.address !== "0x0000000000000000000000000000000000000000"
    );
  }
}

export const contractService = new ContractService();

