import { z } from "zod";
import { ethers } from "ethers";
import { storage } from "../storage";
import type { Express } from "express";
import { isAuthenticated } from "../replitAuth";

/**
 * Register referral-related routes that integrate with ReferralRegistry contract
 */
export function registerReferralContractRoutes(app: Express) {
  // Register referral on-chain (authenticated)
  app.post("/api/referral/register-on-chain", isAuthenticated, async (req: any, res) => {
    try {
      const schema = z.object({
        inviterAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
        referralCode: z.string().optional(),
      });

      const body = schema.parse(req.body);
      const userId = req.user.claims.sub;

      // Get user's wallet address
      const user = await storage.getUser(userId);
      if (!user || !user.walletAddress) {
        return res.status(400).json({ message: "请先绑定钱包地址" });
      }

      // TODO: Call ReferralRegistry contract's selfRegister function
      // This would require AgentKit or user wallet signing
      // For now, we'll just record it in the database
      
      // Get or create referral code
      const referralCodeRecord = await storage.getOrCreateReferralCode(userId);
      const code = body.referralCode || referralCodeRecord.referralCode;

      // Convert code to bytes32
      const codeBytes32 = ethers.utils.formatBytes32String(code);

      // Store the on-chain registration intent
      // In production, this would trigger a contract call
      res.json({
        message: "推荐关系注册请求已提交",
        inviterAddress: body.inviterAddress,
        inviteeAddress: user.walletAddress,
        code: codeBytes32,
        note: "需要用户在前端通过钱包签名完成链上注册",
      });
    } catch (error: any) {
      console.error("Error registering referral on-chain:", error);
      res.status(500).json({ message: error.message || "Failed to register referral" });
    }
  });

  // Get on-chain referral data (authenticated)
  app.get("/api/referral/on-chain", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || !user.walletAddress) {
        return res.status(400).json({ message: "请先绑定钱包地址" });
      }

      // TODO: Query ReferralRegistry contract
      // For now, return placeholder
      res.json({
        hasReferral: false,
        inviter: null,
        referralCount: 0,
        totalRewardsEarned: "0",
        note: "需要连接 ReferralRegistry 合约地址",
      });
    } catch (error: any) {
      console.error("Error fetching on-chain referral:", error);
      res.status(500).json({ message: "Failed to fetch on-chain referral" });
    }
  });
}

