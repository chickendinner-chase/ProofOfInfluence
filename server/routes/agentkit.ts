import { ethers } from "ethers";
import type { Express, Request, Response } from "express";
import { isAuthenticated } from "../auth";
import { hasRequiredRole } from "./utils";
import { getAgentKitContext } from "../agentkit/agentkitClient";
import { getAdminSigner } from "../services/agentkitUtils";
import immortalityBadgeConfig from "@shared/contracts/immortality_badge.json";
import achievementBadgesConfig from "@shared/contracts/achievement_badges.json";
import tgeSaleConfig from "@shared/contracts/poi_tge.json";
import stakingRewardsConfig from "@shared/contracts/staking_rewards.json";

// Contract configuration for role checking
interface ContractConfig {
  name: string;
  address: string;
  abi: any[];
  roles: string[];
}

const CONTRACTS_TO_CHECK: ContractConfig[] = [
  {
    name: "ImmortalityBadge",
    address: immortalityBadgeConfig.address,
    abi: immortalityBadgeConfig.abi,
    roles: ["MINTER_ROLE", "DEFAULT_ADMIN_ROLE"],
  },
  {
    name: "AchievementBadges",
    address: achievementBadgesConfig.address,
    abi: achievementBadgesConfig.abi,
    roles: ["MINTER_ROLE", "DEFAULT_ADMIN_ROLE"],
  },
  {
    name: "TGESale",
    address: tgeSaleConfig.address,
    abi: tgeSaleConfig.abi,
    roles: [], // TGESale uses Ownable, not AccessControl
  },
  {
    name: "StakingRewards",
    address: stakingRewardsConfig.address,
    abi: stakingRewardsConfig.abi,
    roles: [], // StakingRewards uses Ownable, not AccessControl
  },
];

// Map chain ID to network name
function getNetworkName(chainId: string): string {
  const id = parseInt(chainId, 16);
  if (id === 84532) return "Base Sepolia";
  if (id === 8453) return "Base Mainnet";
  return `Chain ${id}`;
}

/**
 * Register AgentKit configuration routes
 */
export function registerAgentKitRoutes(app: Express) {
  // Get AgentKit wallet information
  app.get("/api/agentkit/wallet", isAuthenticated, async (req: Request, res: Response) => {
    try {
      if (!hasRequiredRole(req, ["admin"])) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { walletProvider } = await getAgentKitContext();
      const address = await walletProvider.getAddress();
      
      // Get balance
      const balanceHex = await walletProvider.request({
        method: "eth_getBalance",
        params: [address, "latest"],
      });
      const balance = ethers.utils.formatEther(balanceHex);

      // Get chain ID
      const chainIdHex = await walletProvider.request({
        method: "eth_chainId",
      });
      const networkName = getNetworkName(chainIdHex);

      res.json({
        connected: true,
        address,
        balance,
        network: networkName,
        chainId: chainIdHex,
      });
    } catch (error: any) {
      console.error("[AgentKit] Error fetching wallet info:", error);
      res.status(500).json({
        connected: false,
        error: error.message || "Failed to fetch wallet information",
      });
    }
  });

  // Get all contract roles status
  app.get("/api/agentkit/roles", isAuthenticated, async (req: Request, res: Response) => {
    try {
      if (!hasRequiredRole(req, ["admin"])) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { walletProvider } = await getAgentKitContext();
      const agentKitAddress = await walletProvider.getAddress();

      // Get RPC URL for provider
      const networkId = process.env.AGENTKIT_DEFAULT_CHAIN || "base-sepolia";
      let rpcUrl: string;
      if (networkId === "base-sepolia" || networkId === "84532") {
        rpcUrl = process.env.BASE_SEPOLIA_RPC_URL || process.env.BASE_RPC_URL || "https://sepolia.base.org";
      } else if (networkId === "base" || networkId === "8453") {
        rpcUrl = process.env.BASE_RPC_URL || "https://mainnet.base.org";
      } else {
        rpcUrl = process.env.BASE_SEPOLIA_RPC_URL || process.env.BASE_RPC_URL || "https://sepolia.base.org";
      }

      const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
      const rolesStatus: Record<string, any> = {};

      for (const contractConfig of CONTRACTS_TO_CHECK) {
        const contract = new ethers.Contract(contractConfig.address, contractConfig.abi, provider);
        const contractStatus: any = {
          address: contractConfig.address,
        };

        // Check each role
        for (const roleName of contractConfig.roles) {
          try {
            // Get role ID
            const roleId = await contract[roleName]();
            // Check if AgentKit wallet has the role
            const hasRole = await contract.hasRole(roleId, agentKitAddress);
            contractStatus[roleName] = hasRole;
          } catch (error: any) {
            console.warn(`[AgentKit] Error checking role ${roleName} for ${contractConfig.name}:`, error.message);
            contractStatus[roleName] = false;
          }
        }

        rolesStatus[contractConfig.name] = contractStatus;
      }

      res.json(rolesStatus);
    } catch (error: any) {
      console.error("[AgentKit] Error fetching roles:", error);
      res.status(500).json({ message: error.message || "Failed to fetch roles" });
    }
  });

  // Test AgentKit connection
  app.post("/api/agentkit/test", isAuthenticated, async (req: Request, res: Response) => {
    try {
      if (!hasRequiredRole(req, ["admin"])) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { walletProvider } = await getAgentKitContext();
      const address = await walletProvider.getAddress();
      
      // Test basic operations
      const balanceHex = await walletProvider.request({
        method: "eth_getBalance",
        params: [address, "latest"],
      });
      const balance = ethers.utils.formatEther(balanceHex);

      res.json({
        success: true,
        message: "AgentKit connection successful",
        address,
        balance,
      });
    } catch (error: any) {
      console.error("[AgentKit] Test connection error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Connection test failed",
      });
    }
  });

  // Configure roles (grant required roles to AgentKit wallet)
  app.post("/api/agentkit/configure-roles", isAuthenticated, async (req: Request, res: Response) => {
    try {
      if (!hasRequiredRole(req, ["admin"])) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { walletProvider } = await getAgentKitContext();
      const agentKitAddress = await walletProvider.getAddress();
      const adminSigner = getAdminSigner();

      // Get RPC URL for provider
      const networkId = process.env.AGENTKIT_DEFAULT_CHAIN || "base-sepolia";
      let rpcUrl: string;
      if (networkId === "base-sepolia" || networkId === "84532") {
        rpcUrl = process.env.BASE_SEPOLIA_RPC_URL || process.env.BASE_RPC_URL || "https://sepolia.base.org";
      } else if (networkId === "base" || networkId === "8453") {
        rpcUrl = process.env.BASE_RPC_URL || "https://mainnet.base.org";
      } else {
        rpcUrl = process.env.BASE_SEPOLIA_RPC_URL || process.env.BASE_RPC_URL || "https://sepolia.base.org";
      }

      const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
      const transactions: Array<{ contract: string; role: string; txHash: string }> = [];

      for (const contractConfig of CONTRACTS_TO_CHECK) {
        if (contractConfig.roles.length === 0) {
          continue; // Skip contracts without roles
        }

        const contract = new ethers.Contract(contractConfig.address, contractConfig.abi, adminSigner);

        for (const roleName of contractConfig.roles) {
          try {
            // Get role ID
            const roleId = await contract[roleName]();
            
            // Check if already has role
            const hasRole = await contract.hasRole(roleId, agentKitAddress);
            if (hasRole) {
              console.log(`[AgentKit] ${contractConfig.name} already has ${roleName}`);
              continue;
            }

            // Grant role
            console.log(`[AgentKit] Granting ${roleName} to ${agentKitAddress} on ${contractConfig.name}...`);
            const tx = await contract.grantRole(roleId, agentKitAddress);
            await tx.wait();
            
            transactions.push({
              contract: contractConfig.name,
              role: roleName,
              txHash: tx.hash,
            });
          } catch (error: any) {
            console.error(`[AgentKit] Error granting ${roleName} for ${contractConfig.name}:`, error);
            // Continue with other roles/contracts
          }
        }
      }

      res.json({
        success: true,
        message: `Granted ${transactions.length} role(s)`,
        transactions,
      });
    } catch (error: any) {
      console.error("[AgentKit] Error configuring roles:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to configure roles",
      });
    }
  });
}
