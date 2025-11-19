import type { Express, Request } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { isAuthenticated } from "../auth";
import type { MarketOrder, MarketTrade } from "@shared/schema";

const MARKET_STATUSES = ["PENDING", "FILLED", "PARTIAL", "CANCELED", "FAILED"] as const;
const DEFAULT_FEE_BPS = 10;
const SLIPPAGE_BPS = 150;

const createOrderSchema = z.object({
  side: z.enum(["buy", "sell"]),
  tokenIn: z.string().min(1),
  tokenOut: z.string().min(1),
  amountIn: z
    .string()
    .min(1)
    .refine((value) => Number(value) > 0, "amountIn must be greater than zero"),
  idempotencyKey: z.string().min(1),
});

const updateOrderSchema = z.object({
  amountIn: z
    .string()
    .min(1)
    .refine((value) => Number(value) > 0, "amountIn must be greater than zero"),
});

const listOrdersQuerySchema = z.object({
  status: z.enum(MARKET_STATUSES).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

const pairQuerySchema = z.object({
  pair: z
    .string()
    .min(3)
    .refine((value) => value.includes("-"), "pair must be in format TOKENA-TOKENB"),
  limit: z.coerce.number().int().min(1).max(200).optional(),
});

function estimateAmountOut(amountIn: string, feeBps: number): string {
  const numericAmount = Number(amountIn);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    return "0";
  }

  const feeMultiplier = 1 - feeBps / 10_000;
  const slippageMultiplier = 1 - SLIPPAGE_BPS / 10_000;
  const estimated = numericAmount * feeMultiplier * slippageMultiplier;
  return estimated.toFixed(8);
}

function parsePair(pair: string): { quoteToken: string; baseToken: string } {
  const [quoteToken, baseToken] = pair.split("-");
  if (!quoteToken || !baseToken) {
    throw new Error("Invalid trading pair");
  }
  return { quoteToken: quoteToken.trim().toUpperCase(), baseToken: baseToken.trim().toUpperCase() };
}

function formatOrderSummary(order: MarketOrder) {
  return {
    id: order.id,
    side: order.side,
    tokenIn: order.tokenIn,
    tokenOut: order.tokenOut,
    amountIn: order.amountIn ?? "0",
    amountOut: order.amountOut ?? undefined,
    status: order.status,
    createdAt: order.createdAt instanceof Date ? order.createdAt.toISOString() : new Date(order.createdAt as any).toISOString(),
    updatedAt: order.updatedAt instanceof Date ? order.updatedAt.toISOString() : new Date(order.updatedAt as any).toISOString(),
  };
}

function formatOrderDetail(order: MarketOrder, trades: MarketTrade[]) {
  const base = formatOrderSummary(order);
  return {
    ...base,
    feeBps: order.feeBps ?? 0,
    txRef: order.txRef ?? undefined,
    route: order.route ?? undefined,
    quotedAmountOut: order.quotedAmountOut ?? undefined,
    trades: trades.map((trade) => ({
      id: trade.id,
      price: trade.price ?? "0",
      amount: trade.amount ?? "0",
      route: trade.route ?? undefined,
      txRef: trade.txRef ?? undefined,
      createdAt: trade.createdAt instanceof Date ? trade.createdAt.toISOString() : new Date(trade.createdAt as any).toISOString(),
    })),
  };
}

function buildOrderbook(orders: MarketOrder[], tokens: { quoteToken: string; baseToken: string }) {
  const bids: Record<string, number> = {};
  const asks: Record<string, number> = {};
  let latestUpdatedAt: Date | undefined;

  for (const order of orders) {
    const amountIn = Number(order.amountIn ?? 0);
    const quotedAmountOut = Number(order.quotedAmountOut ?? order.amountOut ?? 0);
    if (!Number.isFinite(amountIn) || !Number.isFinite(quotedAmountOut) || quotedAmountOut <= 0 || amountIn <= 0) {
      continue;
    }

    const tokenIn = order.tokenIn?.toUpperCase();
    const tokenOut = order.tokenOut?.toUpperCase();
    let price = 0;
    let quantity = 0;

    if (tokenIn === tokens.quoteToken && tokenOut === tokens.baseToken) {
      price = amountIn / quotedAmountOut;
      quantity = quotedAmountOut;
    } else if (tokenIn === tokens.baseToken && tokenOut === tokens.quoteToken) {
      price = quotedAmountOut / amountIn;
      quantity = amountIn;
    } else {
      continue;
    }

    if (!Number.isFinite(price) || price <= 0) {
      continue;
    }

    const bucket = order.side === "buy" ? bids : asks;
    const priceKey = price.toFixed(3);
    bucket[priceKey] = (bucket[priceKey] ?? 0) + quantity;

    const updatedAt = order.updatedAt instanceof Date ? order.updatedAt : new Date(order.updatedAt as any);
    if (!latestUpdatedAt || updatedAt > latestUpdatedAt) {
      latestUpdatedAt = updatedAt;
    }
  }

  const bidsArray = Object.entries(bids)
    .map(([price, amount]) => ({ price, amount: amount.toFixed(2) }))
    .sort((a, b) => Number(b.price) - Number(a.price));
  const asksArray = Object.entries(asks)
    .map(([price, amount]) => ({ price, amount: amount.toFixed(2) }))
    .sort((a, b) => Number(a.price) - Number(b.price));

  return {
    bids: bidsArray,
    asks: asksArray,
    updatedAt: latestUpdatedAt ? latestUpdatedAt.toISOString() : new Date().toISOString(),
  };
}

function formatTradeRow(row: { trade: MarketTrade; order: MarketOrder }) {
  return {
    price: row.trade.price ?? "0",
    amount: row.trade.amount ?? "0",
    side: row.order.side,
    timestamp: row.trade.createdAt instanceof Date
      ? row.trade.createdAt.toISOString()
      : new Date(row.trade.createdAt as any).toISOString(),
  };
}

function calculateChangePercentage(latest: number, oldest: number): string {
  if (!Number.isFinite(latest) || !Number.isFinite(oldest) || oldest <= 0) {
    return "0.0%";
  }
  const diff = ((latest - oldest) / oldest) * 100;
  const sign = diff > 0 ? "+" : "";
  return `${sign}${diff.toFixed(2)}%`;
}

function sumPendingLiquidity(orders: MarketOrder[], tokens: { quoteToken: string; baseToken: string }): number {
  let total = 0;
  for (const order of orders) {
    const amountIn = Number(order.amountIn ?? 0);
    const quotedAmountOut = Number(order.quotedAmountOut ?? order.amountOut ?? 0);
    if (!Number.isFinite(amountIn) || !Number.isFinite(quotedAmountOut) || amountIn <= 0) {
      continue;
    }

    const tokenIn = order.tokenIn?.toUpperCase();
    const tokenOut = order.tokenOut?.toUpperCase();

    if (tokenIn === tokens.quoteToken && tokenOut === tokens.baseToken) {
      total += amountIn;
    } else if (tokenIn === tokens.baseToken && tokenOut === tokens.quoteToken) {
      total += quotedAmountOut;
    }
  }
  return total;
}

export function registerMarketRoutes(app: Express) {
  app.post("/api/market/orders", isAuthenticated, async (req: Request, res) => {
    const parsed = createOrderSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.flatten().formErrors.join(", ") });
    }

    const userId = (req as any).user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { side, tokenIn, tokenOut, amountIn, idempotencyKey } = parsed.data;
    try {
      const existing = await storage.getMarketOrderByIdempotency(userId, idempotencyKey);
      if (existing) {
        const estimatedAmountOut = existing.quotedAmountOut ?? estimateAmountOut(existing.amountIn ?? "0", existing.feeBps ?? DEFAULT_FEE_BPS);
        return res.status(200).json({
          id: existing.id,
          status: existing.status,
          side: existing.side,
          tokenIn: existing.tokenIn,
          tokenOut: existing.tokenOut,
          amountIn: existing.amountIn ?? "0",
          feeBps: existing.feeBps ?? DEFAULT_FEE_BPS,
          estimatedAmountOut,
          createdAt: existing.createdAt instanceof Date
            ? existing.createdAt.toISOString()
            : new Date(existing.createdAt as any).toISOString(),
        });
      }

      const feeBps = DEFAULT_FEE_BPS;
      const estimatedAmountOut = estimateAmountOut(amountIn, feeBps);

      const order = await storage.createMarketOrder({
        userId,
        side,
        tokenIn,
        tokenOut,
        amountIn,
        feeBps,
        status: "PENDING",
        idempotencyKey,
        quotedAmountOut: estimatedAmountOut,
      });

      return res.status(201).json({
        id: order.id,
        status: order.status,
        side: order.side,
        tokenIn: order.tokenIn,
        tokenOut: order.tokenOut,
        amountIn: order.amountIn ?? "0",
        feeBps: order.feeBps ?? feeBps,
        estimatedAmountOut,
        createdAt: order.createdAt instanceof Date
          ? order.createdAt.toISOString()
          : new Date(order.createdAt as any).toISOString(),
      });
    } catch (error) {
      console.error("Failed to create market order", error);
      return res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.get("/api/market/orders", isAuthenticated, async (req: Request, res) => {
    const parsed = listOrdersQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.flatten().formErrors.join(", ") });
    }

    const userId = (req as any).user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const { status, limit, offset } = parsed.data;
      const { orders, total } = await storage.listMarketOrders({ userId, status, limit, offset });
      const formatted = orders.map(formatOrderSummary);
      return res.json({
        orders: formatted,
        total,
        hasMore: offset + formatted.length < total,
      });
    } catch (error) {
      console.error("Failed to fetch market orders", error);
      return res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/market/orders/:id", isAuthenticated, async (req: Request, res) => {
    const userId = (req as any).user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const order = await storage.getMarketOrderForUser(req.params.id, userId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      const trades = await storage.getMarketTradesForOrder(order.id);
      const detail = formatOrderDetail(order, trades);
      return res.json({
        id: detail.id,
        side: detail.side,
        tokenIn: detail.tokenIn,
        tokenOut: detail.tokenOut,
        amountIn: detail.amountIn,
        amountOut: detail.amountOut,
        feeBps: detail.feeBps,
        status: detail.status,
        txRef: detail.txRef,
        route: detail.route,
        trades: detail.trades.map((trade) => ({
          id: trade.id,
          price: trade.price,
          amount: trade.amount,
          createdAt: trade.createdAt,
        })),
        createdAt: detail.createdAt,
        updatedAt: detail.updatedAt,
        quotedAmountOut: detail.quotedAmountOut,
      });
    } catch (error) {
      console.error("Failed to fetch order detail", error);
      return res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.put("/api/market/orders/:id", isAuthenticated, async (req: Request, res) => {
    const parsed = updateOrderSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.flatten().formErrors.join(", ") });
    }

    const userId = (req as any).user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const existing = await storage.getMarketOrderForUser(req.params.id, userId);
      if (!existing) {
        return res.status(404).json({ message: "Order not found" });
      }

      if (existing.status !== "PENDING") {
        return res.status(400).json({ message: "Only pending orders can be updated" });
      }

      const feeBps = existing.feeBps ?? DEFAULT_FEE_BPS;
      const quotedAmountOut = estimateAmountOut(parsed.data.amountIn, feeBps);

      const updated = await storage.updateMarketOrder(existing.id, {
        amountIn: parsed.data.amountIn,
        quotedAmountOut,
      });

      return res.json({
        id: updated.id,
        status: updated.status,
        amountIn: updated.amountIn ?? "0",
        quotedAmountOut,
        updatedAt: updated.updatedAt instanceof Date
          ? updated.updatedAt.toISOString()
          : new Date(updated.updatedAt as any).toISOString(),
      });
    } catch (error) {
      console.error("Failed to update order", error);
      return res.status(500).json({ message: "Failed to update order" });
    }
  });

  app.delete("/api/market/orders/:id", isAuthenticated, async (req: Request, res) => {
    const userId = (req as any).user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const existing = await storage.getMarketOrderForUser(req.params.id, userId);
      if (!existing) {
        return res.status(404).json({ message: "Order not found" });
      }

      if (existing.status !== "PENDING") {
        return res.status(400).json({ message: "Only pending orders can be canceled" });
      }

      const canceled = await storage.updateMarketOrder(existing.id, { status: "CANCELED" });
      return res.json({
        id: canceled.id,
        status: canceled.status,
        canceledAt: canceled.updatedAt instanceof Date
          ? canceled.updatedAt.toISOString()
          : new Date(canceled.updatedAt as any).toISOString(),
      });
    } catch (error) {
      console.error("Failed to cancel order", error);
      return res.status(500).json({ message: "Failed to cancel order" });
    }
  });

  app.get("/api/market/orderbook", async (req: Request, res) => {
    const parsed = pairQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.flatten().formErrors.join(", ") });
    }

    try {
      const tokens = parsePair(parsed.data.pair);
      const pendingOrders = await storage.getPendingMarketOrdersForPair({
        tokenIn: tokens.quoteToken,
        tokenOut: tokens.baseToken,
      });
      const orderbook = buildOrderbook(pendingOrders, tokens);
      return res.json({
        pair: parsed.data.pair.toUpperCase(),
        bids: orderbook.bids,
        asks: orderbook.asks,
        updatedAt: orderbook.updatedAt,
      });
    } catch (error) {
      console.error("Failed to build orderbook", error);
      return res.status(500).json({ message: "Failed to fetch orderbook" });
    }
  });

  app.get("/api/market/trades", async (req: Request, res) => {
    const parsed = pairQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.flatten().formErrors.join(", ") });
    }

    try {
      const tokens = parsePair(parsed.data.pair);
      const limit = parsed.data.limit ?? 50;
      const trades = await storage.getRecentMarketTrades({
        tokenIn: tokens.quoteToken,
        tokenOut: tokens.baseToken,
        limit,
      });
      return res.json({ trades: trades.map(formatTradeRow) });
    } catch (error) {
      console.error("Failed to fetch recent trades", error);
      return res.status(500).json({ message: "Failed to fetch trades" });
    }
  });

  app.get("/api/market/stats", async (req: Request, res) => {
    const parsed = pairQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.flatten().formErrors.join(", ") });
    }

    try {
      const tokens = parsePair(parsed.data.pair);
      const limit = 1;
      const [latestRow] = await storage.getRecentMarketTrades({
        tokenIn: tokens.quoteToken,
        tokenOut: tokens.baseToken,
        limit,
      });

      const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const tradesSince = await storage.getMarketTradesSince({
        tokenIn: tokens.quoteToken,
        tokenOut: tokens.baseToken,
        since,
      });

      const latestPrice = latestRow ? Number(latestRow.trade.price ?? 0) : 0;
      const oldestPrice = tradesSince.length > 0 ? Number(tradesSince[tradesSince.length - 1].trade.price ?? 0) : latestPrice;
      const change24h = calculateChangePercentage(latestPrice, oldestPrice);

      const volume24h = tradesSince.reduce((total, row) => total + Number(row.trade.amount ?? 0), 0);
      const high24h = tradesSince.reduce((max, row) => Math.max(max, Number(row.trade.price ?? 0)), latestPrice);
      const low24h = tradesSince.reduce((min, row) => {
        const price = Number(row.trade.price ?? 0);
        if (min === 0) {
          return price;
        }
        return Math.min(min, price || min);
      }, latestPrice);

      const pending = await storage.getPendingMarketOrdersForPair({
        tokenIn: tokens.quoteToken,
        tokenOut: tokens.baseToken,
      });
      const tvl = sumPendingLiquidity(pending, tokens);

      return res.json({
        pair: parsed.data.pair.toUpperCase(),
        price: latestPrice.toFixed(3),
        change24h,
        volume24h: volume24h.toFixed(2),
        high24h: high24h ? high24h.toFixed(3) : "0.000",
        low24h: low24h ? low24h.toFixed(3) : "0.000",
        tvl: tvl.toFixed(2),
      });
    } catch (error) {
      console.error("Failed to fetch market stats", error);
      return res.status(500).json({ message: "Failed to fetch market stats" });
    }
  });
}
