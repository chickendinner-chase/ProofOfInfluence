import { z } from "zod";
import { ethers } from "ethers";
import { storage } from "../storage";
import type { Express } from "express";
import { isAuthenticated } from "../auth";
import { getReferral, hasReferral, getReferralCount, getTotalRewardsEarned } from "../agentkit/referral";

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

      // Get or create referral code
      const referralCodeRecord = await storage.getOrCreateReferralCode(userId);
      const code = body.referralCode || referralCodeRecord.referralCode;

      // Convert code to bytes32
      const codeBytes32 = ethers.utils.formatBytes32String(code);

      // Prepare transaction data for user wallet signing
      // ReferralRegistry.selfRegister must be called by the user themselves
      const { contractService } = await import("../services/contracts");
      
      const txData = await contractService.prepareTransaction(
        "ReferralRegistry",
        "selfRegister",
        [body.inviterAddress, codeBytes32]
      );

      res.json({
        message: "推荐关系注册交易已准备",
        inviterAddress: body.inviterAddress,
        inviteeAddress: user.walletAddress,
        code: codeBytes32,
        transaction: txData,
        note: "请在前端使用用户钱包签名并发送此交易",
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

      // Query ReferralRegistry contract
      try {
        const referralInfo = await getReferral(user.walletAddress);
        const referralCount = await getReferralCount(user.walletAddress);
        const totalRewards = await getTotalRewardsEarned(user.walletAddress);

        res.json({
          hasReferral: referralInfo.exists,
          inviter: referralInfo.exists ? referralInfo.inviter : null,
          code: referralInfo.exists ? referralInfo.code : null,
          timestamp: referralInfo.exists ? referralInfo.timestamp : null,
          referralCount: referralCount,
          totalRewardsEarned: totalRewards,
        });
      } catch (error: any) {
        // If contract query fails, return safe defaults
        console.error("Error querying ReferralRegistry:", error);
        res.json({
          hasReferral: false,
          inviter: null,
          referralCount: "0",
          totalRewardsEarned: "0",
          note: error.message || "合约查询失败",
        });
      }
    } catch (error: any) {
      console.error("Error fetching on-chain referral:", error);
      res.status(500).json({ message: "Failed to fetch on-chain referral" });
    }
  });
}

