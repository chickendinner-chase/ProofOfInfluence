import { Router } from "express";
import { TestWalletService } from "../services/testWalletService";
import { TestScenarioRunner, type ScenarioName } from "../services/testScenarioRunner";
import { getImmortalityAgentKitService } from "../services/agentkit";

const router = Router();

router.post("/run-scenario", async (req, res) => {
  try {
    const { scenario, label, walletCount, params } = req.body as {
      scenario?: ScenarioName;
      label?: string;
      walletCount?: number;
      params?: Record<string, any>;
    };

    if (!scenario) {
      return res.status(400).json({ ok: false, error: "scenario is required" });
    }

    const desiredWalletCount = typeof walletCount === "number" && walletCount > 0 ? walletCount : 1;
    const resolvedLabel = label || `test:${scenario}`;

    const agentKit = getImmortalityAgentKitService();
    const walletService = new TestWalletService(agentKit);
    const runner = new TestScenarioRunner(agentKit);

    let wallets = await walletService.listTestWallets(resolvedLabel, desiredWalletCount);

    const missing = desiredWalletCount - wallets.length;
    if (missing > 0) {
      const newWallets = await walletService.createManyTestWallets(resolvedLabel, missing);
      wallets = wallets.concat(newWallets);
    }

    if (wallets.length > desiredWalletCount) {
      wallets = wallets.slice(0, desiredWalletCount);
    }

    const result = await runner.runScenario(scenario, wallets, params || {});

    res.json({
      ok: true,
      scenario,
      label: resolvedLabel,
      walletCount: wallets.length,
      results: result.results,
    });
  } catch (error: any) {
    console.error("[TestRunner] run-scenario failed", error);
    res.status(500).json({ ok: false, error: error?.message || "Unknown error" });
  }
});

export default router;
