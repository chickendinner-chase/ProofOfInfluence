import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, jsonb, index, bigint, numeric, serial } from "drizzle-orm/pg-core";
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
  // Metadata
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  lastLoginAt: timestamp("last_login_at"),
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


// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profiles.$inferSelect;

export type InsertLink = z.infer<typeof insertLinkSchema>;
export type Link = typeof links.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

export type InsertPoiTier = z.infer<typeof insertPoiTierSchema>;
export type PoiTier = typeof poiTiers.$inferSelect;

export type InsertPoiFeeCredit = z.infer<typeof insertPoiFeeCreditSchema>;
export type PoiFeeCredit = typeof poiFeeCredits.$inferSelect;

export type InsertPoiBurnIntent = z.infer<typeof insertPoiBurnIntentSchema>;
export type PoiBurnIntent = typeof poiBurnIntents.$inferSelect;

export type InsertPoiFeeCreditLock = z.infer<typeof insertPoiFeeCreditLockSchema>;
export type PoiFeeCreditLock = typeof poiFeeCreditLocks.$inferSelect;
