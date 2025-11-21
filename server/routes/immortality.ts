import type { Express } from "express";
import { isAuthenticated } from "../auth";
import { storage } from "../storage";
import { contractService } from "../services/contracts";

/**
 * Register immortality chat action routes
 */
export function registerImmortalityRoutes(app: Express) {
  const isMockMode = process.env.IMMORTALITY_MOCK_ACTIONS === "true";

  // Activate user's AI agent
  app.post("/api/immortality/activate-agent", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const mode = isMockMode ? "Mock" : "Real";
      console.log(`[ImmortalityActions] activate-agent (${mode} mode) for user ${userId}`);

      if (isMockMode) {
        return res.json({
          status: "success",
          txHash: "mock-activate-0001",
          message: "代理激活成功（模拟）",
        });
      }

      // Real mode: Create agent activation record in database
      // TODO: Implement actual agent activation logic when agent service is ready
      // For now, just log the activation request
      console.log(`[ImmortalityActions] Agent activation requested for user ${userId}`);

      return res.json({
        status: "success",
        txHash: null,
        message: "代理激活成功",
      });
    } catch (error: any) {
      console.error("[ImmortalityActions] Error activating agent:", error);
      return res.status(500).json({
        status: "error",
        message: error.message || "激活代理失败",
      });
    }
  });

  // Upload memory data to storage/IPFS
  app.post("/api/immortality/upload-memory", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { text, emotion } = req.body;
      const mode = isMockMode ? "Mock" : "Real";
      console.log(`[ImmortalityActions] upload-memory (${mode} mode) for user ${userId}`);

      if (isMockMode) {
        return res.json({
          status: "success",
          txHash: "mock-upload-0001",
          message: "记忆上传成功（模拟）",
        });
      }

      // Real mode: Store memory via storage.createUserMemory()
      if (!text || typeof text !== "string" || text.trim().length === 0) {
        return res.status(400).json({
          status: "error",
          message: "记忆内容不能为空",
        });
      }

      const memory = await storage.createUserMemory({
        userId,
        text: text.trim(),
        emotion: emotion || null,
        tags: null,
        mediaUrl: null,
      });

      console.log(`[ImmortalityActions] Memory uploaded: ${memory.id}`);

      return res.json({
        status: "success",
        txHash: null,
        message: "记忆上传成功",
      });
    } catch (error: any) {
      console.error("[ImmortalityActions] Error uploading memory:", error);
      return res.status(500).json({
        status: "error",
        message: error.message || "上传记忆失败",
      });
    }
  });

  // Mint NFT badge via blockchain
  app.post("/api/immortality/mint-badge", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const mode = isMockMode ? "Mock" : "Real";
      console.log(`[ImmortalityActions] mint-badge (${mode} mode) for user ${userId}`);

      if (isMockMode) {
        return res.json({
          status: "success",
          txHash: "mock-mint-0001",
          message: "徽章铸造成功（模拟）",
        });
      }

      // Real mode: Use existing badge minting logic via contract service
      const user = await storage.getUser(userId);
      if (!user || !user.walletAddress) {
        return res.status(400).json({
          status: "error",
          message: "请先绑定钱包地址",
        });
      }

      // Use contract service to mint badge
      const result = await contractService.call(
        "AchievementBadges",
        "mintBadge",
        { to: user.walletAddress, badgeType: 1 },
        {
          mode: "agentkit",
          userWallet: user.walletAddress,
        }
      );

      if (!result.txHash) {
        throw new Error("Transaction hash not returned");
      }

      console.log(`[ImmortalityActions] Badge minted: ${result.txHash}`);

      return res.json({
        status: "success",
        txHash: result.txHash,
        message: "徽章铸造成功",
      });
    } catch (error: any) {
      console.error("[ImmortalityActions] Error minting badge:", error);
      return res.status(500).json({
        status: "error",
        message: error.message || "铸造徽章失败",
      });
    }
  });
}
