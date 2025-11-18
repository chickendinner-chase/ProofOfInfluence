import { z } from "zod";
import { ethers } from "ethers";
import { storage } from "../storage";
import {
  buildMerkleTreeFromEligibilities,
  generateProofsForBatch,
  formatAmountToWei,
} from "../services/merkleAirdrop";
import type { Express } from "express";

/**
 * Register airdrop-related routes
 */
export function registerAirdropRoutes(app: Express) {
  // Create airdrop eligibility (admin only - for seeding)
  app.post("/api/admin/airdrop/eligibility", async (req: any, res) => {
    try {
      const schema = z.object({
        walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
        amount: z.number().min(0),
        userId: z.string().optional(),
        merkleIndex: z.number().optional(),
        merkleProof: z.array(z.string()).optional(),
        roundId: z.number().default(0),
      });

      const body = schema.parse(req.body);

      const eligibility = await storage.createAirdropEligibility({
        walletAddress: body.walletAddress.toLowerCase(),
        amount: body.amount,
        eligible: true,
        claimed: false,
        userId: body.userId || null,
        merkleIndex: body.merkleIndex || null,
        merkleProof: body.merkleProof || null,
        roundId: body.roundId || 0,
      });

      res.json(eligibility);
    } catch (error: any) {
      console.error("Error creating airdrop eligibility:", error);
      res.status(500).json({ message: error.message || "Failed to create eligibility" });
    }
  });

  // Batch create airdrop eligibility records (admin)
  app.post("/api/admin/airdrop/batch", async (req: any, res) => {
    try {
      const schema = z.object({
        recipients: z.array(
          z.object({
            walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
            amount: z.number().min(0),
            userId: z.string().optional(),
          })
        ),
        roundId: z.number().default(0),
      });

      const body = schema.parse(req.body);

      if (body.recipients.length === 0) {
        return res.status(400).json({ message: "Recipients array cannot be empty" });
      }

      // Build Merkle tree from eligibilities
      const { tree, root, leaves } = buildMerkleTreeFromEligibilities(
        body.recipients.map((r) => ({
          walletAddress: r.walletAddress,
          amount: r.amount,
        }))
      );

      // Generate proofs for all eligibilities
      const proofResults = generateProofsForBatch(
        tree,
        body.recipients.map((r) => ({
          walletAddress: r.walletAddress,
          amount: r.amount,
        }))
      );

      // Create eligibility records with proofs
      const eligibilityData = body.recipients.map((recipient, i) => {
        const proofResult = proofResults[i];
        return {
          walletAddress: recipient.walletAddress.toLowerCase(),
          amount: recipient.amount,
          userId: recipient.userId || null,
          merkleIndex: proofResult.index,
          merkleProof: proofResult.proof,
          roundId: body.roundId,
        };
      });

      const created = await Promise.all(
        eligibilityData.map((data) =>
          storage.createAirdropEligibility({
            ...data,
            eligible: true,
            claimed: false,
          })
        )
      );

      res.json({
        created: created.length,
        root,
        recipients: created.map((e, i) => ({
          walletAddress: e.walletAddress,
          amount: e.amount,
          index: e.merkleIndex,
        })),
      });
    } catch (error: any) {
      console.error("Error batch creating airdrop eligibility:", error);
      res.status(500).json({ message: error.message || "Failed to batch create" });
    }
  });
}

