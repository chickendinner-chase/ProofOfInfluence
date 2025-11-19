import { type Express } from "express";
import { isAuthenticated } from "../auth";
import { testScenarioRunner, type ScenarioName } from "../services/testScenarioRunner";
import { storage } from "../storage";
import { db } from "../db";
import { testWallets, users } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";

export function registerTestRoutes(app: Express) {
  // Run test scenario
  app.post("/api/test/run-scenario", isAuthenticated, async (req: any, res) => {
    try {
      const schema = z.object({
        scenario: z.enum(["immortality-playable-agent", "immortality-demo-seed"]),
        params: z.record(z.any()).optional(),
      });

      const body = schema.parse(req.body);
      const { scenario, params = {} } = body;

      const result = await testScenarioRunner.runScenario(scenario as ScenarioName, params);

      res.json({
        success: result.success,
        result: result.result,
        txHashes: result.txHashes,
        errors: result.errors,
        steps: result.steps,
      });
    } catch (error: any) {
      console.error("[TestRunner] run-scenario failed", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          errors: error.errors.map((e) => `${e.path.join(".")}: ${e.message}`),
        });
      }
      res.status(500).json({
        success: false,
        errors: [error?.message || "Unknown error"],
      });
    }
  });

  // Get demo users list
  app.get("/api/test/demo-users", isAuthenticated, async (req: any, res) => {
    try {
      const scenario = (req.query.scenario as string) || undefined;
      const limit = parseInt(req.query.limit as string) || 50;

      // Query testWallets
      let query = db.select().from(testWallets);
      
      if (scenario) {
        query = query.where(eq(testWallets.scenario, scenario)) as any;
      }
      
      const wallets = await query
        .orderBy(desc(testWallets.createdAt))
        .limit(limit);

      // Join with users table to get usernames
      const demoUsers = await Promise.all(
        wallets.map(async (wallet) => {
          try {
            const user = wallet.userId
              ? await storage.getUser(wallet.userId)
              : await storage.getUserByWallet(wallet.walletAddress);

            return {
              userId: user?.id || null,
              walletAddress: wallet.walletAddress,
              label: wallet.label || null,
              username: user?.username || null,
              scenario: wallet.scenario || null,
            };
          } catch (err) {
            return {
              userId: null,
              walletAddress: wallet.walletAddress,
              label: wallet.label || null,
              username: null,
              scenario: wallet.scenario || null,
            };
          }
        })
      );

      res.json(demoUsers);
    } catch (error: any) {
      console.error("[TestRunner] demo-users failed", error);
      res.status(500).json({ message: error?.message || "Unknown error" });
    }
  });

  // Get specific demo user details
  app.get("/api/test/demo-users/:userId", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = req.params;

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "Demo user not found" });
      }

      // Find associated test wallet
      const testWallet = await storage.getTestWalletByAddress(user.walletAddress || "");

      res.json({
        userId: user.id,
        walletAddress: user.walletAddress,
        username: user.username,
        email: user.email,
        testWallet: testWallet
          ? {
              id: testWallet.id,
              label: testWallet.label,
              scenario: testWallet.scenario,
              status: testWallet.status,
            }
          : null,
      });
    } catch (error: any) {
      console.error("[TestRunner] demo-user-details failed", error);
      res.status(500).json({ message: error?.message || "Unknown error" });
    }
  });
}
