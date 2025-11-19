import type { Express } from "express";
import { z } from "zod";
import { TestScenarioRunner } from "../services/testScenarioRunner";
import { storage } from "../storage";

const scenarioRunner = new TestScenarioRunner(storage);

const runScenarioSchema = z.object({
  scenario: z.enum(["immortality-playable-agent", "immortality-demo-seed"]),
  wallets: z.number().int().min(1).max(50).optional(),
  seedMemories: z.boolean().optional(),
  label: z.string().min(1).max(120).optional(),
});

export function registerTestRoutes(app: Express) {
  app.post("/api/test/run-scenario", async (req, res) => {
    if (process.env.NODE_ENV === "production") {
      return res.status(403).json({ message: "Test scenarios are disabled in production" });
    }

    let payload: z.infer<typeof runScenarioSchema>;
    try {
      payload = runScenarioSchema.parse(req.body);
    } catch (error: any) {
      return res.status(400).json({ message: error?.message ?? "Invalid payload" });
    }

    try {
      const result = await scenarioRunner.runScenario(payload);
      return res.json({ ok: true, scenario: payload.scenario, result });
    } catch (error: any) {
      console.error(`[TestRoutes] scenario ${payload.scenario} failed`, error);
      return res.status(500).json({ message: error?.message ?? "Scenario failed" });
    }
  });
}
