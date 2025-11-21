import express, { type Express } from "express";
import { isAuthenticated } from "../auth";
import { storage } from "../storage";
import { z } from "zod";
import { agentPermissionService } from "../services/agentPermissionService";
import { userVaultService } from "../services/userVaultService";
import { mintTestBadge } from "../agentkit";

const IMMORTALITY_AGENT_ID = "immortality-ai";
const DEFAULT_SCOPES = ["chat.invoke", "memory.read", "memory.write", "badge.mint"];

// Check if mock mode is enabled
const isMockMode = () => {
  return process.env.IMMORTALITY_MOCK_ACTIONS === "true";
};

// Standard response format
interface ActionResponse {
  status: "success" | "error";
  txHash?: string;
  message: string;
}

// Log mode on startup
if (isMockMode()) {
  console.log("[Immortality] Running in MOCK mode");
} else {
  console.log("[Immortality] Running in REAL mode");
}

const memorySchema = z.object({
  text: z.string().min(1).max(2000),
  emotion: z.string().max(32).optional(),
});

export function registerImmortalityRoutes(app: Express): void {
  /**
   * POST /api/immortality/activate-agent
   * Activate the immortality-ai agent for the user's vault
   */
  app.post("/api/immortality/activate-agent", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(400).json({
          status: "error",
          message: "User not found",
        } as ActionResponse);
      }

      if (isMockMode()) {
        const mockTxHash = `mock-activate-${Date.now()}`;
        return res.json({
          status: "success",
          txHash: mockTxHash,
          message: "代理激活成功（模拟）",
        } as ActionResponse);
      }

      // Real mode: Get or create user vault
      const vault = await userVaultService.getOrCreateDemoVault(userId);
      
      // Grant permissions to immortality-ai agent
      const permission = await agentPermissionService.grant(
        vault.id,
        IMMORTALITY_AGENT_ID,
        DEFAULT_SCOPES
      );

      return res.json({
        status: "success",
        txHash: permission.id, // Return permission ID as txHash
        message: "代理激活成功",
      } as ActionResponse);
    } catch (error: any) {
      console.error("[Immortality] Error activating agent:", error);
      return res.status(500).json({
        status: "error",
        message: error?.message || "激活代理失败",
      } as ActionResponse);
    }
  });

  /**
   * POST /api/immortality/upload-memory
   * Upload a memory (reuses existing /api/me/memories logic)
   */
  app.post("/api/immortality/upload-memory", isAuthenticated, async (req: any, res) => {
    try {
      // Support demoUserId query param or header (dev/staging only)
      const demoUserId = req.query.demoUserId || req.headers["x-demo-user-id"];
      let userId = req.user.claims.sub;

      if (demoUserId && process.env.NODE_ENV !== "production") {
        userId = demoUserId;
      }

      const validated = memorySchema.parse(req.body);

      if (isMockMode()) {
        const mockTxHash = `mock-upload-${Date.now()}`;
        return res.json({
          status: "success",
          txHash: mockTxHash,
          message: "记忆上传成功（模拟）",
        } as ActionResponse);
      }

      // Real mode: Create memory (reuse existing logic)
      const memory = await storage.createUserMemory({
        userId,
        text: validated.text,
        emotion: validated.emotion ?? null,
        tags: null,
        mediaUrl: null,
      });

      return res.json({
        status: "success",
        txHash: memory.id, // Return memory ID as txHash
        message: "记忆上传成功",
      } as ActionResponse);
    } catch (error: any) {
      console.error("[Immortality] Error uploading memory:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          status: "error",
          message: "Invalid request data",
        } as ActionResponse);
      }

      return res.status(500).json({
        status: "error",
        message: error?.message || "上传记忆失败",
      } as ActionResponse);
    }
  });

  /**
   * POST /api/immortality/mint-badge
   * Mint a test badge (reuses existing /api/immortality/actions/mint-test-badge logic)
   */
  app.post("/api/immortality/mint-badge", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || !user.walletAddress) {
        return res.status(400).json({
          status: "error",
          message: "请先绑定钱包地址",
        } as ActionResponse);
      }

      if (isMockMode()) {
        const mockTxHash = `mock-mint-${Date.now()}`;
        return res.json({
          status: "success",
          txHash: mockTxHash,
          message: "徽章铸造成功（模拟）",
        } as ActionResponse);
      }

      // Real mode: Create action record and mint badge
      const action = await storage.createAgentkitAction({
        userId,
        actionType: "MINT_TEST_BADGE",
        status: "pending",
        requestPayload: { badgeId: 1 },
        metadata: { network: process.env.AGENTKIT_DEFAULT_CHAIN || "base-sepolia" },
      });

      try {
        const txHash = await mintTestBadge(user.walletAddress);
        await storage.updateAgentkitAction(action.id, {
          status: "success",
          txHash,
        });

        return res.json({
          status: "success",
          txHash,
          message: "徽章铸造成功",
        } as ActionResponse);
      } catch (err: any) {
        await storage.updateAgentkitAction(action.id, {
          status: "failed",
          errorMessage: err?.message ?? "Unknown error",
        });
        throw err;
      }
    } catch (error: any) {
      console.error("[Immortality] Error minting badge:", error);
      return res.status(500).json({
        status: "error",
        message: error?.message || "铸造徽章失败",
      } as ActionResponse);
    }
  });
}
