import type { Express, Request } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { isAuthenticated } from "../auth";
import { getRequestUserId, hasRequiredRole } from "./utils";

const ADMIN_ROLES = ["admin"];

const historyQuerySchema = z.object({
  range: z.enum(["7d", "30d", "90d"]).default("30d"),
});

const buybackSchema = z.object({
  amountUSDC: z
    .string()
    .min(1)
    .refine((value) => Number(value) > 0, "amountUSDC must be greater than zero"),
  minPOI: z
    .string()
    .min(1)
    .refine((value) => Number(value) > 0, "minPOI must be greater than zero"),
  idempotencyKey: z.string().min(1),
});

const withdrawSchema = z.object({
  amount: z
    .string()
    .min(1)
    .refine((value) => Number(value) > 0, "amount must be greater than zero"),
  asset: z.string().min(1),
  to: z.string().min(1),
  idempotencyKey: z.string().min(1),
});

function ensureAdmin(req: Request, res: any): boolean {
  if (!hasRequiredRole(req, ADMIN_ROLES)) {
    res.status(403).json({ message: "Forbidden" });
    return false;
  }
  return true;
}

function toFixedString(value: string | number | null | undefined, decimals = 2): string {
  const numeric = typeof value === "string" ? Number(value) : value ?? 0;
  if (!Number.isFinite(numeric)) {
    return (0).toFixed(decimals);
  }
  return Number(numeric).toFixed(decimals);
}

function toIsoString(value: unknown): string | undefined {
  if (!value) {
    return undefined;
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  const parsed = new Date(value as any);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }
  return parsed.toISOString();
}

function mapRangeToDays(range: string): number {
  switch (range) {
    case "7d":
      return 7;
    case "90d":
      return 90;
    case "30d":
    default:
      return 30;
  }
}

function formatBuybackResponse(action: any) {
  const payload = (action?.payload ?? {}) as Record<string, unknown>;
  return {
    actionId: action.id,
    status: action.status,
    amountUSDC: payload.amountUSDC ?? "0",
    estimatedPOI: payload.estimatedPOI ?? payload.minPOI ?? "0",
    createdAt: toIsoString(action.createdAt) ?? new Date().toISOString(),
  };
}

export function registerReservePoolRoutes(app: Express) {
  app.get("/api/reserve-pool", isAuthenticated, async (req, res) => {
    if (!ensureAdmin(req, res)) {
      return;
    }

    try {
      const balances = await storage.getReserveBalances();
      const balanceMap: Record<string, string> = {};
      for (const balance of balances) {
        balanceMap[balance.asset] = toFixedString(balance.balance ?? "0", 8);
      }

      const totalFees7d = toFixedString(await storage.sumFeesLedgerSince(7));
      const totalFees30d = toFixedString(await storage.sumFeesLedgerSince(30));
      const totalBuyback = toFixedString(await storage.sumReserveActionsByType("buyback"));
      const lastBuyback = await storage.getLatestReserveAction("buyback");
      const lastBuybackDate = toIsoString(lastBuyback?.createdAt) ?? null;
      let nextBuybackScheduled: string | null = null;
      if (lastBuybackDate) {
        const next = new Date(lastBuybackDate);
        next.setUTCDate(next.getUTCDate() + 1);
        nextBuybackScheduled = next.toISOString();
      }

      res.json({
        balances: balanceMap,
        totalFees7d,
        totalFees30d,
        totalBuyback,
        lastBuybackDate,
        nextBuybackScheduled,
      });
    } catch (error) {
      console.error("[reserve] failed to fetch overview", error);
      res.status(500).json({ message: "Failed to load reserve data" });
    }
  });

  app.get("/api/reserve-pool/history", isAuthenticated, async (req, res) => {
    if (!ensureAdmin(req, res)) {
      return;
    }

    const parsed = historyQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.flatten().formErrors.join(", ") });
    }

    try {
      const days = mapRangeToDays(parsed.data.range);
      const data = await storage.getReserveHistory(days);
      res.json({ range: parsed.data.range, data });
    } catch (error) {
      console.error("[reserve] failed to fetch history", error);
      res.status(500).json({ message: "Failed to load reserve history" });
    }
  });

  app.post("/api/reserve-pool/buyback", isAuthenticated, async (req, res) => {
    if (!ensureAdmin(req, res)) {
      return;
    }

    const parsed = buybackSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.flatten().formErrors.join(", ") });
    }

    const { amountUSDC, minPOI, idempotencyKey } = parsed.data;
    try {
      const existing = await storage.getReserveActionByIdempotency("buyback", idempotencyKey);
      if (existing) {
        res.status(200).json(formatBuybackResponse(existing));
        return;
      }

      const usdcBalance = await storage.getReserveBalance("USDC");
      const availableBalance = Number(usdcBalance?.balance ?? 0);
      if (!Number.isFinite(availableBalance) || availableBalance < Number(amountUSDC)) {
        return res.status(400).json({ message: "Insufficient USDC balance" });
      }

      const estimated = Math.max(Number(minPOI), Number(amountUSDC) * 0.98);
      const payload = {
        amountUSDC,
        minPOI,
        estimatedPOI: toFixedString(estimated),
      };

      const action = await storage.createReserveAction({
        type: "buyback",
        payload,
        status: "PENDING",
        idempotencyKey,
      });

      const userId = getRequestUserId(req);
      console.info("[reserve] buyback requested", {
        userId,
        amountUSDC,
        minPOI,
        idempotencyKey,
        actionId: action.id,
      });

      res.status(202).json(formatBuybackResponse(action));
    } catch (error) {
      console.error("[reserve] failed to create buyback", error);
      res.status(500).json({ message: "Failed to create buyback" });
    }
  });

  app.post("/api/reserve-pool/withdraw", isAuthenticated, async (req, res) => {
    if (!ensureAdmin(req, res)) {
      return;
    }

    const parsed = withdrawSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.flatten().formErrors.join(", ") });
    }

    const { amount, asset, to, idempotencyKey } = parsed.data;
    try {
      const existing = await storage.getReserveActionByIdempotency("withdraw", idempotencyKey);
      if (existing) {
        const payload = (existing.payload ?? {}) as Record<string, unknown>;
        res.status(200).json({
          actionId: existing.id,
          status: existing.status,
          txRef: (existing.result as any)?.txRef ?? null,
          amount: payload.amount ?? amount,
          asset: (payload.asset as string) ?? asset.toUpperCase(),
          createdAt: toIsoString(existing.createdAt) ?? new Date().toISOString(),
        });
        return;
      }

      const payload = { amount, asset: asset.toUpperCase(), to };
      const action = await storage.createReserveAction({
        type: "withdraw",
        payload,
        status: "PENDING",
        idempotencyKey,
      });

      const userId = getRequestUserId(req);
      console.info("[reserve] withdraw requested", {
        userId,
        amount,
        asset: asset.toUpperCase(),
        to,
        idempotencyKey,
        actionId: action.id,
      });

      res.status(202).json({
        actionId: action.id,
        status: action.status,
        txRef: null,
        amount,
        asset: asset.toUpperCase(),
        createdAt: toIsoString(action.createdAt) ?? new Date().toISOString(),
      });
    } catch (error) {
      console.error("[reserve] failed to create withdraw action", error);
      res.status(500).json({ message: "Failed to create withdraw action" });
    }
  });

  app.get("/api/reserve-pool/analytics", isAuthenticated, async (req, res) => {
    if (!ensureAdmin(req, res)) {
      return;
    }

    try {
      const history = await storage.getReserveHistory(90);
      const totalFeesAllTimeRaw = Number(await storage.sumFeesLedgerAllTime());
      const totalBuybackAllTimeRaw = Number(await storage.sumReserveActionsByType("buyback"));
      const totalFeesAllTime = Number.isFinite(totalFeesAllTimeRaw) ? totalFeesAllTimeRaw : 0;
      const totalBuybackAllTime = Number.isFinite(totalBuybackAllTimeRaw) ? totalBuybackAllTimeRaw : 0;

      const totals = history.reduce(
        (acc, day) => {
          const feesValue = Number(day.fees ?? 0);
          const buybackValue = Number(day.buyback ?? 0);
          return {
            fees: acc.fees + (Number.isFinite(feesValue) ? feesValue : 0),
            buyback: acc.buyback + (Number.isFinite(buybackValue) ? buybackValue : 0),
          };
        },
        { fees: 0, buyback: 0 },
      );

      const avgMonthlyFees = history.length > 0 ? (totals.fees / history.length) * 30 : 0;
      const avgBuybackRatio = totals.fees > 0 ? totals.buyback / totals.fees : 0;

      res.json({
        avgMonthlyFees: Number(avgMonthlyFees.toFixed(2)),
        avgBuybackRatio: Number(avgBuybackRatio.toFixed(2)),
        totalFeesAllTime: Number(totalFeesAllTime.toFixed(2)),
        totalBuybackAllTime: Number(totalBuybackAllTime.toFixed(2)),
      });
    } catch (error) {
      console.error("[reserve] failed to load analytics", error);
      res.status(500).json({ message: "Failed to load analytics" });
    }
  });

  app.get("/api/reserve-pool/activities", isAuthenticated, async (req, res) => {
    if (!ensureAdmin(req, res)) {
      return;
    }

    try {
      const actions = await storage.listRecentReserveActions(25);
      const activities = actions.map((action) => ({
        id: action.id,
        type: action.type,
        status: action.status,
        details: action.payload ?? {},
        result: action.result ?? undefined,
        createdAt: toIsoString(action.createdAt),
        executedAt: toIsoString(action.executedAt),
      }));

      res.json({ activities });
    } catch (error) {
      console.error("[reserve] failed to load activities", error);
      res.status(500).json({ message: "Failed to load reserve activities" });
    }
  });
}
