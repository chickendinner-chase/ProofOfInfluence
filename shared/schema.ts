import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  timestamp,
  integer,
  boolean,
  jsonb,
  index,
  bigint,
  numeric,
  serial,
  uniqueIndex,
  date,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table - handles authentication (Replit Auth + Web3)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  // Replit Auth fields
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  // Custom fields
  username: text("username").unique(),
  walletAddress: text("wallet_address").unique(),
  role: varchar("role", { length: 20 }).default("user").notNull(), // user, admin
  plan: varchar("plan", { length: 10 }).default("free"), // free, paid
  referredByProfileId: varchar("referred_by_profile_id"), // Profile ID of referrer
  // Metadata
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  lastLoginAt: timestamp("last_login_at"),
});

// User personality profiles (MBTI + values)
export const userPersonalityProfiles = pgTable("user_personality_profiles", {
  userId: varchar("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  mbtiType: varchar("mbti_type", { length: 4 }),
  mbtiScores: jsonb("mbti_scores"),
  values: jsonb("values"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// User memories (short journal entries)
export const userMemories = pgTable("user_memories", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  emotion: varchar("emotion", { length: 32 }),
  tags: jsonb("tags"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  mediaUrl: text("media_url"),
});

// Profiles table - public showcase information
export const profiles = pgTable("profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  // Social media links
  googleUrl: text("google_url"),
  twitterUrl: text("twitter_url"),
  weiboUrl: text("weibo_url"),
  tiktokUrl: text("tiktok_url"),
  // Visibility and analytics
  isPublic: boolean("is_public").default(true).notNull(),
  totalViews: integer("total_views").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Links table - showcase links
export const links = pgTable("links", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  url: text("url").notNull(),
  visible: boolean("visible").default(true).notNull(),
  position: integer("position").notNull().default(0),
  clicks: integer("clicks").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Transactions table - payment records
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "set null" }), // nullable for anonymous purchases
  stripeSessionId: varchar("stripe_session_id").unique(), // Stripe Checkout Session ID
  stripePaymentIntentId: varchar("stripe_payment_intent_id"), // Payment Intent ID from webhook
  amount: integer("amount").notNull(), // Amount in cents
  currency: varchar("currency").default("usd").notNull(),
  status: varchar("status").default("pending").notNull(), // pending, completed, failed, refunded
  poiTokens: integer("poi_tokens").notNull(), // Amount of $POI tokens purchased (for simplicity: 1:1 with USD)
  email: varchar("email"), // Email for receipt (especially for anonymous purchases)
  metadata: jsonb("metadata"), // Additional data (e.g., user IP, browser info)
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Fiat transactions - Stripe ledger
export const fiatTransactions = pgTable("fiat_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "set null" }),
  stripeSessionId: varchar("stripe_session_id").unique(),
  amountFiat: integer("amount_fiat").notNull(), // in cents
  currency: varchar("currency").default("usd").notNull(),
  status: varchar("status").default("pending").notNull(), // pending, completed, failed, refunded
  credits: integer("credits").default(0).notNull(), // Immortality credits granted
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// User balances - Immortality credits ledger
export const userBalances = pgTable("user_balances", {
  userId: varchar("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  immortalityCredits: integer("immortality_credits").default(0).notNull(),
  poiCredits: integer("poi_credits").default(0).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Ledger entries for audit trail
export const immortalityLedger = pgTable("immortality_ledger", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type").notNull(), // credit | debit
  amountCredits: integer("amount_credits").notNull(),
  source: varchar("source").notNull(), // stripe, manual, spend, etc.
  reference: varchar("reference"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// AgentKit action audit log
export const agentkitActions = pgTable("agentkit_actions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "set null" }),
  actionType: varchar("action_type", { length: 100 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  txHash: varchar("tx_hash"),
  errorMessage: text("error_message"),
  requestPayload: jsonb("request_payload"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// POI Tiers - membership levels based on POI balance/staking
export const poiTiers = pgTable("poi_tiers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  minPoi: bigint("min_poi", { mode: "number" }).notNull(), // Min POI balance required
  feeDiscountRate: numeric("fee_discount_rate", { precision: 5, scale: 4 }).notNull().default("0"), // 0.10 = 10% discount
  shippingCreditCapCents: integer("shipping_credit_cap_cents").notNull().default(0), // Max shipping credit in cents
});

// POI Fee Credits - non-transferable credits from burning POI
export const poiFeeCredits = pgTable("poi_fee_credits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  balanceCents: bigint("balance_cents", { mode: "number" }).notNull().default(0), // Available fee credit balance in cents
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// POI Burn Intents - record of POI burns for fee credits
export const poiBurnIntents = pgTable("poi_burn_intents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  burnTxHash: text("burn_tx_hash").notNull().unique(), // Blockchain transaction hash
  poiAmount: bigint("poi_amount", { mode: "number" }).notNull(), // Amount of POI burned
  creditedCents: bigint("credited_cents", { mode: "number" }).notNull(), // Fee credits received in cents
  snapshotRate: numeric("snapshot_rate", { precision: 18, scale: 8 }).notNull(), // POI to USD rate at burn time
  status: varchar("status").default("credited").notNull(), // credited, verified, rejected
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// POI Fee Credit Locks - prevents double-spending during checkout
export const poiFeeCreditLocks = pgTable("poi_fee_credit_locks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  orderId: varchar("order_id").notNull(),
  lockedCents: bigint("locked_cents", { mode: "number" }).notNull(), // Amount locked
  status: varchar("status").default("locked").notNull(), // locked, consumed, released
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});


// Market tables
export const marketOrders = pgTable(
  "market_orders",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    side: varchar("side", { length: 4 }).notNull(),
    tokenIn: varchar("token_in", { length: 50 }).notNull(),
    tokenOut: varchar("token_out", { length: 50 }).notNull(),
    amountIn: numeric("amount_in", { precision: 20, scale: 8 }).notNull(),
    amountOut: numeric("amount_out", { precision: 20, scale: 8 }),
    quotedAmountOut: numeric("quoted_amount_out", { precision: 20, scale: 8 }),
    feeBps: integer("fee_bps").notNull().default(0),
    status: varchar("status", { length: 20 }).notNull().default("PENDING"),
    txRef: varchar("tx_ref", { length: 255 }),
    route: jsonb("route"),
    idempotencyKey: varchar("idempotency_key", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_market_orders_user_id").on(table.userId),
    index("idx_market_orders_status").on(table.status),
    index("idx_market_orders_created_at").on(table.createdAt),
    uniqueIndex("uniq_market_orders_idempotency").on(table.userId, table.idempotencyKey),
  ],
);

export const marketTrades = pgTable(
  "market_trades",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    orderId: varchar("order_id").notNull().references(() => marketOrders.id, { onDelete: "cascade" }),
    price: numeric("price", { precision: 20, scale: 8 }).notNull(),
    amount: numeric("amount", { precision: 20, scale: 8 }).notNull(),
    route: varchar("route", { length: 50 }),
    txRef: varchar("tx_ref", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("idx_market_trades_order_id").on(table.orderId)],
);


// Reserve pool tables
export const feesLedger = pgTable(
  "fees_ledger",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    orderId: varchar("order_id").references(() => marketOrders.id, { onDelete: "set null" }),
    token: varchar("token", { length: 50 }).notNull(),
    amount: numeric("amount", { precision: 20, scale: 8 }).notNull(),
    source: varchar("source", { length: 50 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_fees_ledger_created_at").on(table.createdAt),
    index("idx_fees_ledger_token").on(table.token),
  ],
);

export const reserveBalances = pgTable("reserve_balances", {
  id: serial("id").primaryKey(),
  asset: varchar("asset", { length: 50 }).notNull().unique(),
  balance: numeric("balance", { precision: 20, scale: 8 }).notNull().default("0"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const reserveActions = pgTable(
  "reserve_actions",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    type: varchar("type", { length: 20 }).notNull(),
    payload: jsonb("payload").notNull(),
    result: jsonb("result"),
    status: varchar("status", { length: 20 }).notNull().default("PENDING"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    executedAt: timestamp("executed_at"),
    idempotencyKey: varchar("idempotency_key", { length: 255 }),
  },
  (table) => [
    index("idx_reserve_actions_type").on(table.type),
    index("idx_reserve_actions_created_at").on(table.createdAt),
    uniqueIndex("uniq_reserve_actions_idempotency")
      .on(table.type, table.idempotencyKey)
      .where(sql`idempotency_key IS NOT NULL`),
  ],
);


// Merchant tables
export const products = pgTable(
  "products",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    merchantId: varchar("merchant_id", { length: 255 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    sku: varchar("sku", { length: 100 }),
    description: text("description"),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 10 }).notNull().default("USDC"),
    status: varchar("status", { length: 20 }).notNull().default("ACTIVE"),
    media: jsonb("media"),
    idempotencyKey: varchar("idempotency_key", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_products_merchant_id").on(table.merchantId),
    index("idx_products_status").on(table.status),
    uniqueIndex("uniq_products_sku").on(table.sku).where(sql`sku IS NOT NULL`),
    uniqueIndex("uniq_products_idempotency")
      .on(table.merchantId, table.idempotencyKey)
      .where(sql`idempotency_key IS NOT NULL`),
  ],
);

export const merchantOrders = pgTable(
  "merchant_orders",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    productId: varchar("product_id").references(() => products.id, { onDelete: "set null" }),
    merchantId: varchar("merchant_id", { length: 255 }).notNull(),
    buyerId: varchar("buyer_id", { length: 255 }),
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    fee: numeric("fee", { precision: 10, scale: 2 }).notNull().default("0"),
    status: varchar("status", { length: 20 }).notNull().default("PENDING"),
    txRef: varchar("tx_ref", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_merchant_orders_merchant_id").on(table.merchantId),
    index("idx_merchant_orders_status").on(table.status),
  ],
);

export const taxReports = pgTable(
  "tax_reports",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    merchantId: varchar("merchant_id", { length: 255 }).notNull(),
    periodStart: date("period_start").notNull(),
    periodEnd: date("period_end").notNull(),
    grossSales: numeric("gross_sales", { precision: 12, scale: 2 }).notNull(),
    platformFees: numeric("platform_fees", { precision: 12, scale: 2 }).notNull(),
    netAmount: numeric("net_amount", { precision: 12, scale: 2 }).notNull(),
    taxableAmount: numeric("taxable_amount", { precision: 12, scale: 2 }),
    fileUrl: varchar("file_url", { length: 500 }),
    idempotencyKey: varchar("idempotency_key", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_tax_reports_merchant_id").on(table.merchantId),
    uniqueIndex("uniq_tax_reports_period")
      .on(table.merchantId, table.periodStart, table.periodEnd),
    uniqueIndex("uniq_tax_reports_idempotency")
      .on(table.merchantId, table.idempotencyKey)
      .where(sql`idempotency_key IS NOT NULL`),
  ],
);


// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLoginAt: true,
});

export const upsertUserSchema = createInsertSchema(users).pick({
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  totalViews: true,
});

export const insertLinkSchema = createInsertSchema(links).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  clicks: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFiatTransactionSchema = createInsertSchema(fiatTransactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserBalanceSchema = createInsertSchema(userBalances).omit({
  updatedAt: true,
});

export const insertImmortalityLedgerSchema = createInsertSchema(immortalityLedger).omit({
  id: true,
  createdAt: true,
});

export const insertUserPersonalityProfileSchema = createInsertSchema(userPersonalityProfiles).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertUserMemorySchema = createInsertSchema(userMemories).omit({
  id: true,
  createdAt: true,
});

export const insertAgentkitActionSchema = createInsertSchema(agentkitActions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPoiTierSchema = createInsertSchema(poiTiers).omit({
  id: true,
});

export const insertPoiFeeCreditSchema = createInsertSchema(poiFeeCredits).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPoiBurnIntentSchema = createInsertSchema(poiBurnIntents).omit({
  id: true,
  createdAt: true,
});

export const insertPoiFeeCreditLockSchema = createInsertSchema(poiFeeCreditLocks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMarketOrderSchema = createInsertSchema(marketOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  amountOut: true,
});

export const insertMarketTradeSchema = createInsertSchema(marketTrades).omit({
  id: true,
  createdAt: true,
});

export const insertFeesLedgerSchema = createInsertSchema(feesLedger).omit({
  id: true,
  createdAt: true,
});

export const insertReserveBalanceSchema = createInsertSchema(reserveBalances).omit({
  id: true,
  updatedAt: true,
});

export const insertReserveActionSchema = createInsertSchema(reserveActions).omit({
  id: true,
  createdAt: true,
  executedAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMerchantOrderSchema = createInsertSchema(merchantOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTaxReportSchema = createInsertSchema(taxReports).omit({
  id: true,
  createdAt: true,
});


// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type UserPlan = "free" | "paid";
export type User = typeof users.$inferSelect;

export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profiles.$inferSelect;

export type InsertLink = z.infer<typeof insertLinkSchema>;
export type Link = typeof links.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertFiatTransaction = z.infer<typeof insertFiatTransactionSchema>;
export type FiatTransaction = typeof fiatTransactions.$inferSelect;
export type InsertUserBalance = z.infer<typeof insertUserBalanceSchema>;
export type UserBalance = typeof userBalances.$inferSelect;
export type InsertImmortalityLedgerEntry = z.infer<typeof insertImmortalityLedgerSchema>;
export type ImmortalityLedgerEntry = typeof immortalityLedger.$inferSelect;

export type InsertUserPersonalityProfile = z.infer<typeof insertUserPersonalityProfileSchema>;
export type UserPersonalityProfile = typeof userPersonalityProfiles.$inferSelect;

export type InsertUserMemory = z.infer<typeof insertUserMemorySchema>;
export type UserMemory = typeof userMemories.$inferSelect;

export type InsertAgentkitAction = z.infer<typeof insertAgentkitActionSchema>;
export type AgentkitAction = typeof agentkitActions.$inferSelect;

export type InsertPoiTier = z.infer<typeof insertPoiTierSchema>;
export type PoiTier = typeof poiTiers.$inferSelect;

export type InsertPoiFeeCredit = z.infer<typeof insertPoiFeeCreditSchema>;
export type PoiFeeCredit = typeof poiFeeCredits.$inferSelect;

export type InsertPoiBurnIntent = z.infer<typeof insertPoiBurnIntentSchema>;
export type PoiBurnIntent = typeof poiBurnIntents.$inferSelect;

export type InsertPoiFeeCreditLock = z.infer<typeof insertPoiFeeCreditLockSchema>;
export type PoiFeeCreditLock = typeof poiFeeCreditLocks.$inferSelect;

export type InsertMarketOrder = z.infer<typeof insertMarketOrderSchema>;
export type MarketOrder = typeof marketOrders.$inferSelect;

export type InsertMarketTrade = z.infer<typeof insertMarketTradeSchema>;
export type MarketTrade = typeof marketTrades.$inferSelect;

export type InsertFeesLedger = z.infer<typeof insertFeesLedgerSchema>;
export type FeesLedgerEntry = typeof feesLedger.$inferSelect;

export type InsertReserveBalance = z.infer<typeof insertReserveBalanceSchema>;
export type ReserveBalance = typeof reserveBalances.$inferSelect;

export type InsertReserveAction = z.infer<typeof insertReserveActionSchema>;
export type ReserveAction = typeof reserveActions.$inferSelect;

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

export type InsertMerchantOrder = z.infer<typeof insertMerchantOrderSchema>;
export type MerchantOrder = typeof merchantOrders.$inferSelect;

export type InsertTaxReport = z.infer<typeof insertTaxReportSchema>;
export type TaxReport = typeof taxReports.$inferSelect;

// TGE Email Subscriptions table
export const tgeEmailSubscriptions = pgTable("tge_email_subscriptions", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  source: varchar("source", { length: 50 }).default("tge_page"), // tge_page, early_bird, etc.
  subscribed: boolean("subscribed").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertTgeEmailSubscriptionSchema = createInsertSchema(tgeEmailSubscriptions, {
  email: z.string().email("Invalid email address"),
  source: z.string().optional(),
});

export type InsertTgeEmailSubscription = z.infer<typeof insertTgeEmailSubscriptionSchema>;
export type TgeEmailSubscription = typeof tgeEmailSubscriptions.$inferSelect;

// Early-Bird Tasks table - Define available tasks
export const earlyBirdTasks = pgTable("early_bird_tasks", {
  id: varchar("id", { length: 100 }).primaryKey(), // e.g., "register_verify_email"
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  reward: integer("reward").notNull(), // POI amount
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertEarlyBirdTaskSchema = createInsertSchema(earlyBirdTasks);

export type InsertEarlyBirdTask = z.infer<typeof insertEarlyBirdTaskSchema>;
export type EarlyBirdTask = typeof earlyBirdTasks.$inferSelect;

// User Early-Bird Task Progress table - Track user completion
export const userEarlyBirdProgress = pgTable("user_early_bird_progress", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  taskId: varchar("task_id", { length: 100 }).notNull().references(() => earlyBirdTasks.id, { onDelete: "cascade" }),
  completed: boolean("completed").default(false).notNull(),
  completedAt: timestamp("completed_at"),
  claimed: boolean("claimed").default(false).notNull(),
  claimedAt: timestamp("claimed_at"),
  rewardAmount: integer("reward_amount").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  uniqueIndex("user_task_unique").on(table.userId, table.taskId),
]);

export const insertUserEarlyBirdProgressSchema = createInsertSchema(userEarlyBirdProgress);

export type InsertUserEarlyBirdProgress = z.infer<typeof insertUserEarlyBirdProgressSchema>;
export type UserEarlyBirdProgress = typeof userEarlyBirdProgress.$inferSelect;

// Early-Bird Campaign Config table
export const earlyBirdConfig = pgTable("early_bird_config", {
  id: serial("id").primaryKey(),
  endDate: timestamp("end_date").notNull(),
  participantCap: integer("participant_cap"), // Optional: max participants
  totalRewardPool: varchar("total_reward_pool", { length: 100 }).notNull(), // Total POI allocated
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertEarlyBirdConfigSchema = createInsertSchema(earlyBirdConfig);

export type InsertEarlyBirdConfig = z.infer<typeof insertEarlyBirdConfigSchema>;
export type EarlyBirdConfig = typeof earlyBirdConfig.$inferSelect;

// Referral Program tables
// Stores user referral codes and tracking
export const referralCodes = pgTable("referral_codes", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  referralCode: varchar("referral_code", { length: 20 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertReferralCodeSchema = createInsertSchema(referralCodes);

export type InsertReferralCode = z.infer<typeof insertReferralCodeSchema>;
export type ReferralCode = typeof referralCodes.$inferSelect;

// Stores referral relationships
export const referrals = pgTable("referrals", {
  id: serial("id").primaryKey(),
  inviterId: varchar("inviter_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  inviteeId: varchar("invitee_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  referralCode: varchar("referral_code", { length: 20 }).notNull(),
  status: varchar("status", { length: 20 }).default("registered").notNull(), // registered, verified, activated
  inviterRewardAmount: integer("inviter_reward_amount").default(0).notNull(),
  inviteeRewardAmount: integer("invitee_reward_amount").default(0).notNull(),
  inviterRewarded: boolean("inviter_rewarded").default(false).notNull(),
  inviteeRewarded: boolean("invitee_rewarded").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  uniqueIndex("referral_invitee_unique").on(table.inviteeId),
]);

export const insertReferralSchema = createInsertSchema(referrals);

export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type Referral = typeof referrals.$inferSelect;

// Airdrop Eligibility table
export const airdropEligibility = pgTable("airdrop_eligibility", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").unique().references(() => users.id, { onDelete: "cascade" }),
  walletAddress: varchar("wallet_address", { length: 42 }).unique(),
  amount: integer("amount").notNull(), // POI amount (in POI units, not wei)
  eligible: boolean("eligible").default(true).notNull(),
  claimed: boolean("claimed").default(false).notNull(),
  claimDate: timestamp("claim_date"),
  vestingInfo: text("vesting_info"), // Optional vesting details
  // Merkle proof fields for MerkleAirdropDistributor
  merkleIndex: integer("merkle_index"), // Index in Merkle tree
  merkleProof: jsonb("merkle_proof"), // Array of hex strings for Merkle proof
  roundId: integer("round_id").default(0), // Airdrop round ID
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("airdrop_wallet_idx").on(table.walletAddress),
]);

export const insertAirdropEligibilitySchema = createInsertSchema(airdropEligibility);

export type InsertAirdropEligibility = z.infer<typeof insertAirdropEligibilitySchema>;
export type AirdropEligibility = typeof airdropEligibility.$inferSelect;

// Unified identity bindings (multi-provider auth)
export const userIdentities = pgTable("user_identities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  provider: varchar("provider", { length: 32 }).notNull(), // email | google | apple | wallet | replit
  providerUserId: varchar("provider_user_id", { length: 255 }), // sub/email/address
  email: varchar("email", { length: 255 }),
  emailVerified: boolean("email_verified").default(false).notNull(),
  walletAddress: varchar("wallet_address", { length: 64 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("uniq_identity_provider_uid").on(table.provider, table.providerUserId).where(sql`provider_user_id IS NOT NULL`),
  uniqueIndex("uniq_identity_wallet").on(table.walletAddress).where(sql`wallet_address IS NOT NULL`),
  index("idx_identity_user").on(table.userId),
  index("idx_identity_email").on(table.email),
]);

export const insertUserIdentitySchema = createInsertSchema(userIdentities).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUserIdentity = z.infer<typeof insertUserIdentitySchema>;
export type UserIdentity = typeof userIdentities.$inferSelect;

// Early-Bird Registrations (minimal viable registration table)
export const earlyBirdRegistrations = pgTable("early_bird_registrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email", { length: 255 }).notNull().unique(),
  wallet: varchar("wallet", { length: 64 }).notNull().unique(),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending | verified | bounced
  referralCode: varchar("referral_code", { length: 20 }).unique(),
  referrerCode: varchar("referrer_code", { length: 20 }),
  verifyToken: varchar("verify_token", { length: 64 }),
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_ebr_email").on(table.email),
  index("idx_ebr_referrer").on(table.referrerCode),
]);

export const insertEarlyBirdRegistrationSchema = createInsertSchema(earlyBirdRegistrations, {
  email: z.string().email("Invalid email address"),
  wallet: z.string().regex(/^0x[a-fA-F0-9]{40}$/).transform((v) => v.toLowerCase()),
  referrerCode: z.string().optional(),
});

export type InsertEarlyBirdRegistration = z.infer<typeof insertEarlyBirdRegistrationSchema>;
export type EarlyBirdRegistration = typeof earlyBirdRegistrations.$inferSelect;

// Badges table for AchievementBadges event indexing
export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  tokenId: varchar("token_id", { length: 78 }).unique().notNull(), // bigint as string
  owner: varchar("owner", { length: 42 }).notNull(), // wallet address (lowercase)
  badgeType: integer("badge_type").notNull(),
  tokenURI: text("token_uri"), // nullable, fetched on demand
  mintedAt: timestamp("minted_at").notNull(),
  blockNumber: varchar("block_number", { length: 78 }).notNull(), // bigint as string
  transactionHash: varchar("transaction_hash", { length: 66 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("badges_owner_idx").on(table.owner),
  index("badges_token_id_idx").on(table.tokenId),
]);

export const insertBadgeSchema = createInsertSchema(badges);
export type InsertBadge = z.infer<typeof insertBadgeSchema>;
export type Badge = typeof badges.$inferSelect;

// Event sync state table for tracking indexing progress
export const eventSyncState = pgTable("event_sync_state", {
  id: serial("id").primaryKey(),
  contractName: varchar("contract_name", { length: 50 }).unique().notNull(),
  lastBlockNumber: varchar("last_block_number", { length: 78 }), // bigint as string, nullable for first run
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertEventSyncStateSchema = createInsertSchema(eventSyncState);
export type InsertEventSyncState = z.infer<typeof insertEventSyncStateSchema>;
export type EventSyncState = typeof eventSyncState.$inferSelect;

// Test wallets for automated scenario runner
export const testWallets = pgTable(
  "test_wallets",
  {
    id: serial("id").primaryKey(),
    walletAddress: varchar("wallet_address", { length: 42 }).notNull().unique(),
    privateKey: text("private_key").notNull(), // encrypted
    chainId: integer("chain_id").notNull(),
    network: varchar("network", { length: 50 }).notNull(),
    userId: varchar("user_id").references(() => users.id, { onDelete: "set null" }),
    label: varchar("label", { length: 255 }),
    scenario: varchar("scenario", { length: 100 }),
    status: varchar("status", { length: 20 }).default("idle").notNull(), // idle/in_use/locked/disabled
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    lastUsedAt: timestamp("last_used_at"),
  },
  (table) => [
    index("test_wallets_address_idx").on(table.walletAddress),
    index("test_wallets_scenario_idx").on(table.scenario),
    index("test_wallets_status_idx").on(table.status),
    index("test_wallets_user_id_idx").on(table.userId),
  ],
);

export const insertTestWalletSchema = createInsertSchema(testWallets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastUsedAt: true,
});

export type InsertTestWallet = z.infer<typeof insertTestWalletSchema>;
export type TestWallet = typeof testWallets.$inferSelect;

// UserVault tables
export const userVaults = pgTable(
  "user_vaults",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    ownerUserId: varchar("owner_user_id").references(() => users.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 20 }).notNull().default("demo"), // demo|test|real|system
    label: varchar("label", { length: 255 }),
    metadata: jsonb("metadata"),
    status: varchar("status", { length: 20 }).notNull().default("active"), // active|inactive|archived
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("user_vaults_owner_idx").on(table.ownerUserId),
    index("user_vaults_type_idx").on(table.type),
    index("user_vaults_status_idx").on(table.status),
  ],
);

export const vaultWallets = pgTable(
  "vault_wallets",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    vaultId: varchar("vault_id")
      .notNull()
      .references(() => userVaults.id, { onDelete: "cascade" }),
    walletAddress: varchar("wallet_address", { length: 42 }).notNull(),
    chainId: integer("chain_id").notNull().default(84532), // base-sepolia
    network: varchar("network", { length: 50 }).notNull().default("base-sepolia"),
    role: varchar("role", { length: 20 }).notNull().default("nft"), // nft|gas|test|primary
    status: varchar("status", { length: 20 }).notNull().default("idle"), // idle|in_use|locked|disabled
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    lastUsedAt: timestamp("last_used_at"),
  },
  (table) => [
    index("vault_wallets_vault_id_idx").on(table.vaultId),
    index("vault_wallets_address_idx").on(table.walletAddress),
    index("vault_wallets_chain_id_idx").on(table.chainId),
  ],
);

export const agents = pgTable("agents", {
  id: varchar("id", { length: 100 }).primaryKey(), // e.g. 'immortality-ai' or 'system-admin'
  type: varchar("type", { length: 20 }).notNull(), // 'user' | 'system'
  name: varchar("name", { length: 255 }),
  walletAddress: varchar("wallet_address", { length: 42 }),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const vaultAgentPermissions = pgTable(
  "vault_agent_permissions",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    vaultId: varchar("vault_id")
      .notNull()
      .references(() => userVaults.id, { onDelete: "cascade" }),
    agentId: varchar("agent_id", { length: 100 })
      .notNull()
      .references(() => agents.id, { onDelete: "cascade" }),
    scopes: jsonb("scopes").notNull(), // ["memory.read", "badge.mint", ...]
    constraints: jsonb("constraints"), // { maxMints: 1, expiresAt: ... }
    status: varchar("status", { length: 20 }).notNull().default("active"), // active|revoked
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("vault_agent_permissions_vault_id_idx").on(table.vaultId),
    index("vault_agent_permissions_agent_id_idx").on(table.agentId),
    index("vault_agent_permissions_status_idx").on(table.status),
    uniqueIndex("vault_agent_permissions_unique").on(table.vaultId, table.agentId),
  ],
);

export const testRuns = pgTable(
  "test_runs",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    scenarioKey: varchar("scenario_key", { length: 100 }).notNull(),
    demoUserId: varchar("demo_user_id"),
    vaultId: varchar("vault_id").references(() => userVaults.id, { onDelete: "set null" }),
    status: varchar("status", { length: 20 }).notNull(), // running|success|failed
    result: jsonb("result"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("test_runs_scenario_key_idx").on(table.scenarioKey),
    index("test_runs_demo_user_id_idx").on(table.demoUserId),
    index("test_runs_status_idx").on(table.status),
  ],
);

export const testSteps = pgTable(
  "test_steps",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    runId: varchar("run_id")
      .notNull()
      .references(() => testRuns.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 100 }).notNull(),
    status: varchar("status", { length: 20 }).notNull(), // success|failed
    input: jsonb("input"),
    output: jsonb("output"),
    error: jsonb("error"), // { code, message, cause, data }
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("test_steps_run_id_idx").on(table.runId),
    index("test_steps_status_idx").on(table.status),
  ],
);

// Insert schemas
export const insertUserVaultSchema = createInsertSchema(userVaults).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVaultWalletSchema = createInsertSchema(vaultWallets).omit({
  id: true,
  createdAt: true,
  lastUsedAt: true,
});

export const insertAgentSchema = createInsertSchema(agents).omit({
  createdAt: true,
});

export const insertVaultAgentPermissionSchema = createInsertSchema(vaultAgentPermissions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTestRunSchema = createInsertSchema(testRuns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTestStepSchema = createInsertSchema(testSteps).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUserVault = z.infer<typeof insertUserVaultSchema>;
export type UserVault = typeof userVaults.$inferSelect;

export type InsertVaultWallet = z.infer<typeof insertVaultWalletSchema>;
export type VaultWallet = typeof vaultWallets.$inferSelect;

export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type Agent = typeof agents.$inferSelect;

export type InsertVaultAgentPermission = z.infer<typeof insertVaultAgentPermissionSchema>;
export type VaultAgentPermission = typeof vaultAgentPermissions.$inferSelect;

export type InsertTestRun = z.infer<typeof insertTestRunSchema>;
export type TestRun = typeof testRuns.$inferSelect;

export type InsertTestStep = z.infer<typeof insertTestStepSchema>;
export type TestStep = typeof testSteps.$inferSelect;

// Phase 3: Profile Stats, Badges, and Activity Feed types

/**
 * ProfileStats - Extended stats for profile pages
 */
export interface ProfileStats {
  // Existing stats
  views: number;
  referralsCount: number;
  linkClicks: number;
  // New stats - PnL (Profit and Loss)
  pnl7d?: number | null;
  pnl30d?: number | null;
  pnlAll?: number | null;
  // Task completion
  tasksCompleted?: number;
  // Social stats (defer if not implemented)
  followersCount?: number | null;
  // AI-specific stats
  aiSubscribersCount?: number | null;
  aiWinRate?: number | null;
  aiVolatility?: number | null;
}

/**
 * ProfileActivity - Recent activity events
 */
export interface ProfileActivity {
  id: string;
  type: 'task_completed' | 'trade_opened' | 'action_executed' | 'badge_earned';
  title: string;
  createdAt: string;
}

/**
 * UserBadgeStatus - Badge unlock status for a user
 */
export interface UserBadgeStatus {
  badgeId: number; // Badge type ID (1-12)
  unlocked: boolean;
  unlockedAt?: string | null; // ISO timestamp
  tokenId?: string | null; // If unlocked, the NFT tokenId
}

