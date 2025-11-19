import { z } from "zod";
import type { Express } from "express";
import { isAuthenticated } from "../auth";
import { testScenarioRunner, type ScenarioName } from "../services/testScenarioRunner";
import { storage } from "../storage";

const runScenarioSchema = z.object({
  scenario: z.enum(["immortality-playable-agent", "immortality-demo-seed"]),
  params: z.record(z.any()).optional(),
});

/**
 * Register test scenario routes
 */
export function registerTestRoutes(app: Express) {
  // Run a test scenario
  app.post("/api/test/run-scenario", isAuthenticated, async (req: any, res) => {
    try {
      const validated = runScenarioSchema.parse(req.body);
      const result = await testScenarioRunner.runScenario(
        validated.scenario as ScenarioName,
        validated.params || {}
      );
      res.json(result);
    } catch (error: any) {
      console.error("Error running scenario:", error);
      res.status(400).json({ message: error.message || "Failed to run scenario", details: error });
    }
  });

  // Get demo users list
  app.get("/api/test/demo-users", isAuthenticated, async (req: any, res) => {
    try {
      const scenario = req.query.scenario as string | undefined;
      
      // Get test wallets
      const wallets = scenario
        ? await storage.getTestWalletsByScenario(scenario)
        : await storage.getTestWalletsByScenario("immortality-demo-seed");

      // Get associated users
      const results = await Promise.all(
        wallets.map(async (wallet) => {
          let username: string | undefined;
          if (wallet.userId) {
            const user = await storage.getUser(wallet.userId);
            username = user?.username || undefined;
          }
          return {
            userId: wallet.userId || null,
            walletAddress: wallet.walletAddress,
            label: wallet.label || undefined,
            username,
          };
        })
      );

      res.json(results);
    } catch (error: any) {
      console.error("Error fetching demo users:", error);
      res.status(500).json({ message: error.message || "Failed to fetch demo users" });
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

      // Get associated test wallet
      const wallet = await storage.getTestWalletByAddress(user.walletAddress || "");
      
      res.json({
        userId: user.id,
        walletAddress: user.walletAddress,
        username: user.username,
        email: user.email,
        label: wallet?.label,
        scenario: wallet?.scenario,
        status: wallet?.status,
      });
    } catch (error: any) {
      console.error("Error fetching demo user:", error);
      res.status(500).json({ message: error.message || "Failed to fetch demo user" });
    }
  });
}
