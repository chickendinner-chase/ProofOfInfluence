import { z } from "zod";
import { ethers } from "ethers";
import { storage } from "../storage";
import type { Express } from "express";
import { isAuthenticated } from "../replitAuth";

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

      // TODO: Query AchievementBadges contract events or use an indexer
      // For now, return placeholder
      res.json({
        tokenIds: [],
        note: "需要从合约事件或索引器获取 token IDs",
      });
    } catch (error: any) {
      console.error("Error fetching badge tokens:", error);
      res.status(500).json({ message: error.message || "Failed to fetch badge tokens" });
    }
  });

  // Get badge details by token ID (public)
  app.get("/api/badges/:tokenId", async (req: any, res) => {
    try {
      const tokenId = BigInt(req.params.tokenId);

      // TODO: Query AchievementBadges contract
      // For now, return placeholder
      res.json({
        tokenId: tokenId.toString(),
        badgeType: null,
        tokenURI: null,
        note: "需要连接 AchievementBadges 合约地址",
      });
    } catch (error: any) {
      console.error("Error fetching badge details:", error);
      res.status(500).json({ message: error.message || "Failed to fetch badge details" });
    }
  });

  // Mint badge (admin only - for testing)
  app.post("/api/badges/mint", isAuthenticated, async (req: any, res) => {
    try {
      const schema = z.object({
        to: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
        badgeType: z.number().min(1),
      });

      const body = schema.parse(req.body);

      // TODO: Call AchievementBadges contract's mintBadge function
      // This would require AgentKit or user wallet signing
      res.json({
        message: "徽章铸造请求已提交",
        to: body.to,
        badgeType: body.badgeType,
        note: "需要用户在前端通过钱包签名完成链上铸造",
      });
    } catch (error: any) {
      console.error("Error minting badge:", error);
      res.status(500).json({ message: error.message || "Failed to mint badge" });
    }
  });
}

