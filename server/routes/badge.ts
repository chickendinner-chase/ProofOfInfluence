import { z } from "zod";
import { ethers } from "ethers";
import { storage } from "../storage";
import { triggerSync } from "../services/badgeSync";
import type { Express } from "express";
import { isAuthenticated } from "../auth";

// Get provider from environment (for manual sync endpoint)
function getProvider(): ethers.providers.Provider | null {
  const rpcUrl = process.env.BASE_RPC_URL || process.env.BASE_SEPOLIA_RPC_URL;
  if (!rpcUrl) {
    return null;
  }
  return new ethers.providers.JsonRpcProvider(rpcUrl);
}

/**
 * Register badge-related routes that integrate with AchievementBadges contract
 */
export function registerBadgeRoutes(app: Express) {
  // Get user's badge token IDs (authenticated)
  app.get("/api/badges/tokens", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const address = req.query.address as string | undefined;

      // Get user's wallet address
      const user = await storage.getUser(userId);
      const walletAddress = address || user?.walletAddress;

      if (!walletAddress) {
        return res.status(400).json({ message: "钱包地址未找到" });
      }

      // Query badges from database (indexed from events)
      const badges = await storage.getBadgesByOwner(walletAddress);
      const tokenIds = badges.map((badge) => BigInt(badge.tokenId).toString());

      res.json({
        tokenIds,
        badges: badges.map((badge) => ({
          tokenId: badge.tokenId,
          badgeType: badge.badgeType,
          tokenURI: badge.tokenURI,
          mintedAt: badge.mintedAt.toISOString(),
        })),
      });
    } catch (error: any) {
      console.error("Error fetching badge tokens:", error);
      res.status(500).json({ message: error.message || "Failed to fetch badge tokens" });
    }
  });

  // Get badge details by token ID (public)
  app.get("/api/badges/:tokenId", async (req: any, res) => {
    try {
      const tokenId = req.params.tokenId;

      // Query badge from database
      const badge = await storage.getBadgeByTokenId(tokenId);

      if (!badge) {
        return res.status(404).json({ message: "Badge not found" });
      }

      res.json({
        tokenId: badge.tokenId,
        badgeType: badge.badgeType,
        tokenURI: badge.tokenURI,
        owner: badge.owner,
        mintedAt: badge.mintedAt.toISOString(),
        blockNumber: badge.blockNumber,
        transactionHash: badge.transactionHash,
      });
    } catch (error: any) {
      console.error("Error fetching badge details:", error);
      res.status(500).json({ message: error.message || "Failed to fetch badge details" });
    }
  });

  // Manual sync endpoint (admin - for testing)
  app.post("/api/admin/badges/sync", isAuthenticated, async (req: any, res) => {
    try {
      const provider = getProvider();
      if (!provider) {
        return res.status(500).json({ message: "RPC provider not configured" });
      }

      const result = await triggerSync(provider);

      res.json({
        message: "Sync completed",
        indexed: result.indexed,
        lastBlock: result.lastBlock,
      });
    } catch (error: any) {
      console.error("Error triggering badge sync:", error);
      res.status(500).json({ message: error.message || "Failed to trigger sync" });
    }
  });

  // Mint badge (admin only - for testing)
  app.post("/api/badges/mint", isAuthenticated, async (req: any, res) => {
    try {
      const schema = z.object({
        to: z.string().regex(/^0x[a-fA-F0-9]{40}$/).optional(),
        badgeType: z.number().min(1).optional(),
      });

      const body = schema.parse(req.body);
      const userId = req.user.claims.sub;

      // Get user's wallet address
      const user = await storage.getUser(userId);
      if (!user || !user.walletAddress) {
        return res.status(400).json({ message: "请先绑定钱包地址" });
      }

      // Use contract service to mint badge via AgentKit
      const { contractService } = await import("../services/contracts");
      
      const recipient = body.to || user.walletAddress;
      const badgeType = body.badgeType || 1;

      const result = await contractService.call(
        "AchievementBadges",
        "mintBadge",
        { to: recipient, badgeType },
        {
          mode: "agentkit",
          userWallet: user.walletAddress,
        }
      );

      res.json({
        message: "徽章铸造成功",
        to: recipient,
        badgeType,
        txHash: result.txHash,
      });
    } catch (error: any) {
      console.error("Error minting badge:", error);
      res.status(500).json({ message: error.message || "Failed to mint badge" });
    }
  });
}

