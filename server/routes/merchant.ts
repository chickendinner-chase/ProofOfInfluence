import type { Express, Request } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { isAuthenticated } from "../auth";
import { getRequestUserId, getRequestRole, hasRequiredRole } from "./utils";

const MERCHANT_ROLES = ["merchant", "admin"];
const PRODUCT_STATUSES = ["ACTIVE", "INACTIVE", "ARCHIVED"] as const;
const ORDER_STATUSES = ["PENDING", "PAID", "SHIPPED", "COMPLETED", "REFUNDED", "CANCELED"] as const;

const listProductsQuerySchema = z.object({
  status: z.enum(PRODUCT_STATUSES).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  merchantId: z.string().optional(),
});

const createProductSchema = z.object({
  title: z.string().min(1),
  sku: z.string().max(100).optional(),
  description: z.string().optional(),
  price: z
    .string()
    .min(1)
    .refine((value) => Number(value) > 0, "price must be greater than zero"),
  currency: z.string().default("USDC"),
  status: z.enum(PRODUCT_STATUSES).optional(),
  media: z.array(z.string()).optional(),
  idempotencyKey: z.string().min(1),
  merchantId: z.string().optional(),
});

const updateProductSchema = z
  .object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    price: z
      .string()
      .min(1)
      .refine((value) => Number(value) > 0, "price must be greater than zero")
      .optional(),
    status: z.enum(PRODUCT_STATUSES).optional(),
    media: z.array(z.string()).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

const listOrdersQuerySchema = z.object({
  status: z.enum(ORDER_STATUSES).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  merchantId: z.string().optional(),
});

const updateOrderSchema = z.object({
  status: z.enum(ORDER_STATUSES),
  txRef: z.string().optional(),
});

const createTaxReportSchema = z.object({
  periodStart: z.string().min(1),
  periodEnd: z.string().min(1),
  idempotencyKey: z.string().min(1),
  merchantId: z.string().optional(),
});

function ensureMerchantAccess(req: Request, res: any): { role: string; userId?: string } | null {
  if (!hasRequiredRole(req, MERCHANT_ROLES)) {
    res.status(403).json({ message: "Forbidden" });
    return null;
  }

  const role = getRequestRole(req) as string;
  const userId = getRequestUserId(req);
  if (role !== "admin" && !userId) {
    res.status(403).json({ message: "Forbidden" });
    return null;
  }

  return { role, userId };
}

function resolveMerchantId(role: string, userId: string | undefined, requested?: unknown): string | null {
  if (role === "admin") {
    if (typeof requested === "string" && requested.length > 0) {
      return requested;
    }
    return userId ?? null;
  }
  return userId ?? null;
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

function toFixedAmount(value: string | number | null | undefined, decimals = 2): string {
  const numeric = typeof value === "string" ? Number(value) : value ?? 0;
  if (!Number.isFinite(numeric)) {
    return (0).toFixed(decimals);
  }
  return Number(numeric).toFixed(decimals);
}

function parseDateOnly(input: string): Date | null {
  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  parsed.setUTCHours(0, 0, 0, 0);
  return parsed;
}

function endOfDay(date: Date): Date {
  const end = new Date(date);
  end.setUTCHours(23, 59, 59, 999);
  return end;
}

function formatProduct(product: any) {
  return {
    id: product.id,
    merchantId: product.merchantId,
    title: product.title,
    sku: product.sku ?? undefined,
    description: product.description ?? undefined,
    price: toFixedAmount(product.price ?? "0"),
    currency: product.currency,
    status: product.status,
    media: product.media ?? [],
    createdAt: toIsoString(product.createdAt),
    updatedAt: toIsoString(product.updatedAt),
  };
}

function formatOrder(order: any) {
  return {
    id: order.id,
    productId: order.productId ?? undefined,
    merchantId: order.merchantId,
    buyerId: order.buyerId ?? undefined,
    amount: toFixedAmount(order.amount ?? "0"),
    fee: toFixedAmount(order.fee ?? "0"),
    status: order.status,
    txRef: order.txRef ?? undefined,
    createdAt: toIsoString(order.createdAt),
    updatedAt: toIsoString(order.updatedAt),
  };
}

function formatTaxReport(report: any) {
  return {
    id: report.id,
    merchantId: report.merchantId,
    periodStart: report.periodStart,
    periodEnd: report.periodEnd,
    grossSales: toFixedAmount(report.grossSales ?? "0"),
    platformFees: toFixedAmount(report.platformFees ?? "0"),
    netAmount: toFixedAmount(report.netAmount ?? "0"),
    taxableAmount: toFixedAmount(report.taxableAmount ?? report.netAmount ?? "0"),
    fileUrl: report.fileUrl ?? undefined,
    createdAt: toIsoString(report.createdAt),
  };
}

export function registerMerchantRoutes(app: Express) {
  app.get("/api/merchant/products", isAuthenticated, async (req, res) => {
    const context = ensureMerchantAccess(req, res);
    if (!context) {
      return;
    }

    const parsed = listProductsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.flatten().formErrors.join(", ") });
    }

    const merchantId = resolveMerchantId(context.role, context.userId, parsed.data.merchantId);
    if (!merchantId) {
      return res.status(400).json({ message: "merchantId is required" });
    }

    try {
      const result = await storage.listProducts({
        merchantId,
        status: parsed.data.status,
        limit: parsed.data.limit,
        offset: parsed.data.offset,
      });

      res.json({
        products: result.products.map(formatProduct),
        total: result.total,
        hasMore: result.total > parsed.data.offset + result.products.length,
      });
    } catch (error) {
      console.error("[merchant] failed to list products", error);
      res.status(500).json({ message: "Failed to load products" });
    }
  });

  app.post("/api/merchant/products", isAuthenticated, async (req, res) => {
    const context = ensureMerchantAccess(req, res);
    if (!context) {
      return;
    }

    const parsed = createProductSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.flatten().formErrors.join(", ") });
    }

    const merchantId = resolveMerchantId(context.role, context.userId, parsed.data.merchantId);
    if (!merchantId) {
      return res.status(400).json({ message: "merchantId is required" });
    }

    try {
      const existing = await storage.getProductByIdempotency(merchantId, parsed.data.idempotencyKey);
      if (existing) {
        return res.status(200).json(formatProduct(existing));
      }

      const product = await storage.createProduct({
        merchantId,
        title: parsed.data.title,
        sku: parsed.data.sku,
        description: parsed.data.description,
        price: toFixedAmount(parsed.data.price),
        currency: parsed.data.currency ?? "USDC",
        status: parsed.data.status ?? "ACTIVE",
        media: parsed.data.media ?? [],
        idempotencyKey: parsed.data.idempotencyKey,
      });

      console.info("[merchant] product created", {
        merchantId,
        productId: product.id,
        title: product.title,
      });

      res.status(201).json(formatProduct(product));
    } catch (error) {
      console.error("[merchant] failed to create product", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.put("/api/merchant/products/:id", isAuthenticated, async (req, res) => {
    const context = ensureMerchantAccess(req, res);
    if (!context) {
      return;
    }

    const parsed = updateProductSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.flatten().formErrors.join(", ") });
    }

    try {
      const product = await storage.getProductById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      if (context.role !== "admin" && product.merchantId !== context.userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const updates: any = { ...parsed.data };
      if (parsed.data.price) {
        updates.price = toFixedAmount(parsed.data.price);
      }

      const updated = await storage.updateProduct(product.id, updates);
      res.json(formatProduct(updated));
    } catch (error) {
      console.error("[merchant] failed to update product", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/merchant/products/:id", isAuthenticated, async (req, res) => {
    const context = ensureMerchantAccess(req, res);
    if (!context) {
      return;
    }

    try {
      const product = await storage.getProductById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      if (context.role !== "admin" && product.merchantId !== context.userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      await storage.archiveProduct(product.id);
      res.json({ id: product.id, status: "ARCHIVED" });
    } catch (error) {
      console.error("[merchant] failed to archive product", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  app.get("/api/merchant/orders", isAuthenticated, async (req, res) => {
    const context = ensureMerchantAccess(req, res);
    if (!context) {
      return;
    }

    const parsed = listOrdersQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.flatten().formErrors.join(", ") });
    }

    const merchantId = resolveMerchantId(context.role, context.userId, parsed.data.merchantId);
    if (!merchantId) {
      return res.status(400).json({ message: "merchantId is required" });
    }

    try {
      const result = await storage.listMerchantOrders({
        merchantId,
        status: parsed.data.status,
        limit: parsed.data.limit,
        offset: parsed.data.offset,
      });

      res.json({
        orders: result.orders.map(formatOrder),
        total: result.total,
        hasMore: result.total > parsed.data.offset + result.orders.length,
      });
    } catch (error) {
      console.error("[merchant] failed to list orders", error);
      res.status(500).json({ message: "Failed to load orders" });
    }
  });

  app.get("/api/merchant/orders/:id", isAuthenticated, async (req, res) => {
    const context = ensureMerchantAccess(req, res);
    if (!context) {
      return;
    }

    try {
      const order = await storage.getMerchantOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      if (context.role !== "admin" && order.merchantId !== context.userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      res.json(formatOrder(order));
    } catch (error) {
      console.error("[merchant] failed to load order", error);
      res.status(500).json({ message: "Failed to load order" });
    }
  });

  app.put("/api/merchant/orders/:id", isAuthenticated, async (req, res) => {
    const context = ensureMerchantAccess(req, res);
    if (!context) {
      return;
    }

    const parsed = updateOrderSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.flatten().formErrors.join(", ") });
    }

    try {
      const order = await storage.getMerchantOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      if (context.role !== "admin" && order.merchantId !== context.userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const updated = await storage.updateMerchantOrder(order.id, parsed.data);
      res.json(formatOrder(updated));
    } catch (error) {
      console.error("[merchant] failed to update order", error);
      res.status(500).json({ message: "Failed to update order" });
    }
  });

  app.get("/api/merchant/tax-reports", isAuthenticated, async (req, res) => {
    const context = ensureMerchantAccess(req, res);
    if (!context) {
      return;
    }

    const merchantId = resolveMerchantId(context.role, context.userId, req.query.merchantId);
    if (!merchantId) {
      return res.status(400).json({ message: "merchantId is required" });
    }

    try {
      const reports = await storage.listTaxReports(merchantId);
      res.json({ reports: reports.map(formatTaxReport) });
    } catch (error) {
      console.error("[merchant] failed to list tax reports", error);
      res.status(500).json({ message: "Failed to load tax reports" });
    }
  });

  app.post("/api/merchant/tax-reports", isAuthenticated, async (req, res) => {
    const context = ensureMerchantAccess(req, res);
    if (!context) {
      return;
    }

    const parsed = createTaxReportSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.flatten().formErrors.join(", ") });
    }

    const merchantId = resolveMerchantId(context.role, context.userId, parsed.data.merchantId);
    if (!merchantId) {
      return res.status(400).json({ message: "merchantId is required" });
    }

    const startDate = parseDateOnly(parsed.data.periodStart);
    const endDate = parseDateOnly(parsed.data.periodEnd);
    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Invalid period range" });
    }
    if (endDate < startDate) {
      return res.status(400).json({ message: "periodEnd must be after periodStart" });
    }

    try {
      const existing = await storage.getTaxReportByIdempotency(merchantId, parsed.data.idempotencyKey);
      if (existing) {
        return res.status(200).json(formatTaxReport(existing));
      }

      const summary = await storage.getMerchantOrderSummary({
        merchantId,
        start: startDate,
        end: endOfDay(endDate),
      });

      const grossSales = toFixedAmount(summary.sales);
      const platformFees = toFixedAmount(summary.fees);
      const netAmountValue = Number(grossSales) - Number(platformFees);
      const netAmount = toFixedAmount(netAmountValue);

      const report = await storage.createTaxReport({
        merchantId,
        periodStart: parsed.data.periodStart,
        periodEnd: parsed.data.periodEnd,
        grossSales,
        platformFees,
        netAmount,
        taxableAmount: netAmount,
        fileUrl: null,
        idempotencyKey: parsed.data.idempotencyKey,
      });

      const fileUrl = `https://files.projectex.dev/tax-reports/${report.id}.csv`;
      const withFileUrl = await storage.updateTaxReport(report.id, { fileUrl });

      console.info("[merchant] tax report generated", {
        merchantId,
        reportId: report.id,
        periodStart: parsed.data.periodStart,
        periodEnd: parsed.data.periodEnd,
      });

      res.status(201).json(formatTaxReport(withFileUrl));
    } catch (error) {
      console.error("[merchant] failed to create tax report", error);
      res.status(500).json({ message: "Failed to create tax report" });
    }
  });

  app.get("/api/merchant/tax-reports/:id/download", isAuthenticated, async (req, res) => {
    const context = ensureMerchantAccess(req, res);
    if (!context) {
      return;
    }

    try {
      const report = await storage.getTaxReportById(req.params.id);
      if (!report) {
        return res.status(404).json({ message: "Tax report not found" });
      }
      if (context.role !== "admin" && report.merchantId !== context.userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const fileUrl = report.fileUrl ?? `https://files.projectex.dev/tax-reports/${report.id}.csv`;
      res.json({ url: fileUrl });
    } catch (error) {
      console.error("[merchant] failed to provide tax report download", error);
      res.status(500).json({ message: "Failed to download tax report" });
    }
  });

  app.get("/api/merchant/analytics", isAuthenticated, async (req, res) => {
    const context = ensureMerchantAccess(req, res);
    if (!context) {
      return;
    }

    const merchantId = resolveMerchantId(context.role, context.userId, req.query.merchantId);
    if (!merchantId) {
      return res.status(400).json({ message: "merchantId is required" });
    }

    try {
      const now = new Date();
      const end = endOfDay(now);

      const weekStart = new Date(end);
      weekStart.setUTCDate(weekStart.getUTCDate() - 6);
      weekStart.setUTCHours(0, 0, 0, 0);

      const monthStart = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), 1));
      monthStart.setUTCHours(0, 0, 0, 0);

      const weekSummary = await storage.getMerchantOrderSummary({ merchantId, start: weekStart, end });
      const monthSummary = await storage.getMerchantOrderSummary({ merchantId, start: monthStart, end });

      res.json({
        thisWeek: {
          sales: toFixedAmount(weekSummary.sales),
          orders: weekSummary.orders,
          fees: toFixedAmount(weekSummary.fees),
        },
        thisMonth: {
          sales: toFixedAmount(monthSummary.sales),
          orders: monthSummary.orders,
          fees: toFixedAmount(monthSummary.fees),
        },
      });
    } catch (error) {
      console.error("[merchant] failed to load analytics", error);
      res.status(500).json({ message: "Failed to load merchant analytics" });
    }
  });
}
