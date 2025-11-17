// Storage implementation - includes Replit Auth required methods from blueprint:javascript_log_in_with_replit
import {
  users,
  profiles,
  links,
  transactions,
  fiatTransactions,
  userBalances,
  immortalityLedger,
  poiTiers,
  poiFeeCredits,
  poiBurnIntents,
  poiFeeCreditLocks,
  marketOrders,
  marketTrades,
  feesLedger,
  reserveBalances,
  reserveActions,
  products,
  merchantOrders,
  taxReports,
  tgeEmailSubscriptions,
  earlyBirdTasks,
  userEarlyBirdProgress,
  earlyBirdConfig,
  referralCodes,
  referrals,
  airdropEligibility,
  earlyBirdRegistrations,
  userIdentities,
  userPersonalityProfiles,
  userMemories,
  agentkitActions,
  badges,
  eventSyncState,
  type User,
  type UpsertUser,
  type InsertUser,
  type Profile,
  type InsertProfile,
  type Link,
  type InsertLink,
  type Transaction,
  type InsertTransaction,
  type FiatTransaction,
  type InsertFiatTransaction,
  type UserBalance,
  type InsertUserBalance,
  type ImmortalityLedgerEntry,
  type InsertImmortalityLedgerEntry,
  type PoiTier,
  type InsertPoiTier,
  type PoiFeeCredit,
  type InsertPoiFeeCredit,
  type PoiBurnIntent,
  type InsertPoiBurnIntent,
  type PoiFeeCreditLock,
  type InsertPoiFeeCreditLock,
  type MarketOrder,
  type InsertMarketOrder,
  type MarketTrade,
  type InsertMarketTrade,
  type FeesLedgerEntry,
  type InsertFeesLedger,
  type ReserveBalance,
  type InsertReserveBalance,
  type ReserveAction,
  type InsertReserveAction,
  type Product,
  type InsertProduct,
  type MerchantOrder,
  type InsertMerchantOrder,
  type TaxReport,
  type InsertTaxReport,
  type TgeEmailSubscription,
  type InsertTgeEmailSubscription,
  type EarlyBirdTask,
  type InsertEarlyBirdTask,
  type UserEarlyBirdProgress,
  type InsertUserEarlyBirdProgress,
  type EarlyBirdConfig,
  type InsertEarlyBirdConfig,
  type ReferralCode,
  type InsertReferralCode,
  type Referral,
  type InsertReferral,
  type AirdropEligibility,
  type InsertAirdropEligibility,
  type UserIdentity,
  type InsertUserIdentity,
  type EarlyBirdRegistration,
  type InsertEarlyBirdRegistration,
  type UserPersonalityProfile,
  type InsertUserPersonalityProfile,
  type UserMemory,
  type InsertUserMemory,
  type AgentkitAction,
  type InsertAgentkitAction,
  type Badge,
  type InsertBadge,
  type EventSyncState,
  type InsertEventSyncState,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, gte, or, lte } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // User management
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByWallet(walletAddress: string): Promise<User | undefined>;
  findOrCreateUserByWallet(walletAddress: string): Promise<User>;
  updateUserWallet(userId: string, walletAddress: string): Promise<User>;
  updateUserUsername(userId: string, username: string): Promise<User>;
  
  // Profile operations
  getProfile(userId: string): Promise<Profile | undefined>;
  getProfileByUsername(username: string): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(userId: string, updates: Partial<InsertProfile>): Promise<Profile>;
  incrementProfileViews(userId: string): Promise<void>;

  // Personality & memories
  getUserPersonalityProfile(userId: string): Promise<UserPersonalityProfile | undefined>;
  upsertUserPersonalityProfile(
    profile: InsertUserPersonalityProfile & { userId: string },
  ): Promise<UserPersonalityProfile>;
  listUserMemories(params: { userId: string; limit: number }): Promise<UserMemory[]>;
  createUserMemory(memory: InsertUserMemory & { userId: string }): Promise<UserMemory>;
  
  // Link operations
  getLinks(userId: string): Promise<Link[]>;
  getVisibleLinks(userId: string): Promise<Link[]>;
  createLink(link: InsertLink): Promise<Link>;
  updateLink(linkId: string, updates: Partial<InsertLink>): Promise<Link>;
  deleteLink(linkId: string): Promise<void>;
  incrementLinkClicks(linkId: string): Promise<void>;
  reorderLinks(userId: string, linkIds: string[]): Promise<void>;
  
  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransaction(id: string): Promise<Transaction | undefined>;
  getTransactionBySessionId(sessionId: string): Promise<Transaction | undefined>;
  updateTransaction(id: string, updates: Partial<InsertTransaction>): Promise<Transaction>;
  getUserTransactions(userId: string): Promise<Transaction[]>;
  createFiatTransaction(transaction: InsertFiatTransaction): Promise<FiatTransaction>;
  getFiatTransactionBySessionId(sessionId: string): Promise<FiatTransaction | undefined>;
  updateFiatTransaction(id: string, updates: Partial<InsertFiatTransaction>): Promise<FiatTransaction>;
  updateFiatTransactionBySessionId(
    sessionId: string,
    updates: Partial<InsertFiatTransaction>,
  ): Promise<FiatTransaction | undefined>;
  getUserBalance(userId: string): Promise<UserBalance | undefined>;
  adjustImmortalityCredits(params: {
    userId: string;
    credits: number;
    source: string;
    reference?: string;
    metadata?: Record<string, unknown>;
  }): Promise<{ balance: UserBalance; ledger: ImmortalityLedgerEntry }>;
  
  // POI Tier operations
  getAllTiers(): Promise<PoiTier[]>;
  getUserTier(poiBalance: number): Promise<PoiTier | undefined>;
  
  // POI Fee Credit operations
  getFeeCredit(userId: string): Promise<PoiFeeCredit | undefined>;
  createFeeCredit(feeCredit: InsertPoiFeeCredit): Promise<PoiFeeCredit>;
  updateFeeCreditBalance(userId: string, amountCents: number): Promise<PoiFeeCredit>;
  
  // POI Fee Credit Lock operations
  createFeeCreditLock(lock: InsertPoiFeeCreditLock): Promise<PoiFeeCreditLock>;
  getFeeCreditLock(orderId: string): Promise<PoiFeeCreditLock | undefined>;
  updateFeeCreditLockStatus(lockId: string, status: string): Promise<PoiFeeCreditLock>;
  releaseFeeCreditLock(orderId: string): Promise<void>;

  // Market operations
  createMarketOrder(order: InsertMarketOrder): Promise<MarketOrder>;
  getMarketOrderById(orderId: string): Promise<MarketOrder | undefined>;
  getMarketOrderForUser(orderId: string, userId: string): Promise<MarketOrder | undefined>;
  getMarketOrderByIdempotency(userId: string, idempotencyKey: string): Promise<MarketOrder | undefined>;
  updateMarketOrder(orderId: string, updates: Partial<InsertMarketOrder>): Promise<MarketOrder>;
  listMarketOrders(params: {
    userId: string;
    status?: string;
    limit: number;
    offset: number;
  }): Promise<{ orders: MarketOrder[]; total: number }>;
  createMarketTrade(trade: InsertMarketTrade): Promise<MarketTrade>;
  getMarketTradesForOrder(orderId: string): Promise<MarketTrade[]>;
  getRecentMarketTrades(params: {
    tokenIn: string;
    tokenOut: string;
    limit: number;
  }): Promise<Array<{ trade: MarketTrade; order: MarketOrder }>>;
  getMarketTradesSince(params: {
    tokenIn: string;
    tokenOut: string;
    since: Date;
  }): Promise<Array<{ trade: MarketTrade; order: MarketOrder }>>;
  getPendingMarketOrdersForPair(params: { tokenIn: string; tokenOut: string }): Promise<MarketOrder[]>;

  // Reserve pool operations
  getReserveBalances(): Promise<ReserveBalance[]>;
  getReserveBalance(asset: string): Promise<ReserveBalance | undefined>;
  upsertReserveBalance(balance: InsertReserveBalance): Promise<ReserveBalance>;
  sumFeesLedgerSince(days: number): Promise<string>;
  sumFeesLedgerAllTime(): Promise<string>;
  getReserveHistory(rangeDays: number): Promise<Array<{ date: string; fees: string; buyback: string }>>;
  createReserveAction(action: InsertReserveAction): Promise<ReserveAction>;
  updateReserveAction(
    id: string,
    updates: Partial<InsertReserveAction & { executedAt?: Date | null }>,
  ): Promise<ReserveAction>;
  getReserveActionById(id: string): Promise<ReserveAction | undefined>;
  getReserveActionByIdempotency(type: string, idempotencyKey: string): Promise<ReserveAction | undefined>;
  listRecentReserveActions(limit: number): Promise<ReserveAction[]>;
  sumReserveActionsByType(type: string): Promise<string>;
  getLatestReserveAction(type: string): Promise<ReserveAction | undefined>;

  // Merchant operations
  listProducts(params: {
    merchantId: string;
    status?: string;
    limit: number;
    offset: number;
  }): Promise<{ products: Product[]; total: number }>;
  getProductById(productId: string): Promise<Product | undefined>;
  getProductByIdempotency(merchantId: string, idempotencyKey: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(productId: string, updates: Partial<InsertProduct>): Promise<Product>;
  archiveProduct(productId: string): Promise<void>;

  listMerchantOrders(params: {
    merchantId: string;
    status?: string;
    limit: number;
    offset: number;
  }): Promise<{ orders: MerchantOrder[]; total: number }>;
  getMerchantOrder(orderId: string): Promise<MerchantOrder | undefined>;
  updateMerchantOrder(orderId: string, updates: Partial<InsertMerchantOrder>): Promise<MerchantOrder>;
  getMerchantOrderSummary(params: { merchantId: string; start?: Date; end?: Date }): Promise<{
    sales: string;
    orders: number;
    fees: string;
  }>;

  listTaxReports(merchantId: string): Promise<TaxReport[]>;
  getTaxReportById(reportId: string): Promise<TaxReport | undefined>;
  getTaxReportByIdempotency(merchantId: string, idempotencyKey: string): Promise<TaxReport | undefined>;
  createTaxReport(report: InsertTaxReport): Promise<TaxReport>;
  updateTaxReport(reportId: string, updates: Partial<InsertTaxReport>): Promise<TaxReport>;

  // AgentKit actions
  createAgentkitAction(action: InsertAgentkitAction): Promise<AgentkitAction>;
  updateAgentkitAction(id: string, updates: Partial<InsertAgentkitAction>): Promise<AgentkitAction>;
  getAgentkitAction(id: string): Promise<AgentkitAction | undefined>;

  // Early-bird registration
  createEarlyBirdRegistration(data: InsertEarlyBirdRegistration): Promise<EarlyBirdRegistration>;
  getEarlyBirdRegistrationByEmail(email: string): Promise<EarlyBirdRegistration | undefined>;
  getEarlyBirdRegistrationByWallet(wallet: string): Promise<EarlyBirdRegistration | undefined>;
  verifyEarlyBirdRegistration(token: string): Promise<EarlyBirdRegistration | undefined>;

  // Identity bindings
  getUserIdentities(userId: string): Promise<UserIdentity[]>;
  findIdentity(provider: string, providerUserId?: string, walletAddress?: string): Promise<UserIdentity | undefined>;
  upsertIdentity(identity: InsertUserIdentity): Promise<UserIdentity>;
  mergeUsers(primaryUserId: string, secondaryUserId: string): Promise<void>;

  // Badge operations
  getBadgesByOwner(owner: string): Promise<Badge[]>;
  getBadgeByTokenId(tokenId: string): Promise<Badge | undefined>;
  createBadge(badge: InsertBadge): Promise<Badge>;
  updateBadge(tokenId: string, updates: Partial<InsertBadge>): Promise<Badge>;
  
  // Event sync state
  getEventSyncState(contractName: string): Promise<EventSyncState | undefined>;
  upsertEventSyncState(state: InsertEventSyncState): Promise<EventSyncState>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // User management
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByWallet(walletAddress: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.walletAddress, walletAddress));
    return user;
  }

  async findOrCreateUserByWallet(walletAddress: string): Promise<User> {
    const normalized = walletAddress.toLowerCase();
    
    // Try to find existing user
    let user = await this.getUserByWallet(normalized);
    
    if (user) {
      // Update last login time
      const [updated] = await db
        .update(users)
        .set({ lastLoginAt: new Date(), updatedAt: new Date() })
        .where(eq(users.id, user.id))
        .returning();
      return updated || user;
    }
    
    // Create new user
    const userId = `wallet_${normalized.slice(2, 10)}_${Date.now()}`;
    user = await this.upsertUser({
      id: userId,
      walletAddress: normalized,
      role: "user",
    });
    
    return user;
  }

  async updateUserWallet(userId: string, walletAddress: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ walletAddress, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserUsername(userId: string, username: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ username, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Profile operations
  async getProfile(userId: string): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId));
    return profile;
  }

  async getProfileByUsername(username: string): Promise<Profile | undefined> {
    const [result] = await db
      .select({ profile: profiles })
      .from(profiles)
      .innerJoin(users, eq(profiles.userId, users.id))
      .where(eq(users.username, username));
    return result?.profile;
  }

  async createProfile(profile: InsertProfile): Promise<Profile> {
    const [newProfile] = await db.insert(profiles).values(profile).returning();
    return newProfile;
  }

  async updateProfile(userId: string, updates: Partial<InsertProfile>): Promise<Profile> {
    const [profile] = await db
      .update(profiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(profiles.userId, userId))
      .returning();
    return profile;
  }

  async incrementProfileViews(userId: string): Promise<void> {
    await db
      .update(profiles)
      .set({ totalViews: sql`${profiles.totalViews} + 1` })
      .where(eq(profiles.userId, userId));
  }

  // Personality & memories
  async getUserPersonalityProfile(userId: string): Promise<UserPersonalityProfile | undefined> {
    const [profile] = await db.select().from(userPersonalityProfiles).where(eq(userPersonalityProfiles.userId, userId));
    return profile;
  }

  async upsertUserPersonalityProfile(
    profile: InsertUserPersonalityProfile & { userId: string },
  ): Promise<UserPersonalityProfile> {
    const [record] = await db
      .insert(userPersonalityProfiles)
      .values(profile)
      .onConflictDoUpdate({
        target: userPersonalityProfiles.userId,
        set: { ...profile, updatedAt: new Date() },
      })
      .returning();
    return record;
  }

  async listUserMemories(params: { userId: string; limit: number }): Promise<UserMemory[]> {
    const { userId, limit } = params;
    return await db
      .select()
      .from(userMemories)
      .where(eq(userMemories.userId, userId))
      .orderBy(desc(userMemories.createdAt))
      .limit(limit);
  }

  async createUserMemory(memory: InsertUserMemory & { userId: string }): Promise<UserMemory> {
    const [record] = await db.insert(userMemories).values(memory).returning();
    return record;
  }

  // Link operations
  async getLinks(userId: string): Promise<Link[]> {
    return await db.select().from(links).where(eq(links.userId, userId)).orderBy(links.position);
  }

  async getVisibleLinks(userId: string): Promise<Link[]> {
    return await db
      .select()
      .from(links)
      .where(and(eq(links.userId, userId), eq(links.visible, true)))
      .orderBy(links.position);
  }

  async createLink(link: InsertLink): Promise<Link> {
    const [newLink] = await db.insert(links).values(link).returning();
    return newLink;
  }

  async updateLink(linkId: string, updates: Partial<InsertLink>): Promise<Link> {
    const [link] = await db
      .update(links)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(links.id, linkId))
      .returning();
    return link;
  }

  async deleteLink(linkId: string): Promise<void> {
    await db.delete(links).where(eq(links.id, linkId));
  }

  async incrementLinkClicks(linkId: string): Promise<void> {
    await db
      .update(links)
      .set({ clicks: sql`${links.clicks} + 1` })
      .where(eq(links.id, linkId));
  }

  async reorderLinks(userId: string, linkIds: string[]): Promise<void> {
    for (let i = 0; i < linkIds.length; i++) {
      await db
        .update(links)
        .set({ position: i, updatedAt: new Date() })
        .where(and(eq(links.id, linkIds[i]), eq(links.userId, userId)));
    }
  }

  // Transaction operations
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db.insert(transactions).values(transaction).returning();
    return newTransaction;
  }

  async getTransaction(id: string): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction;
  }

  async getTransactionBySessionId(sessionId: string): Promise<Transaction | undefined> {
    const [transaction] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.stripeSessionId, sessionId));
    return transaction;
  }

  async updateTransaction(id: string, updates: Partial<InsertTransaction>): Promise<Transaction> {
    const [transaction] = await db
      .update(transactions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(transactions.id, id))
      .returning();
    return transaction;
  }

  async getUserTransactions(userId: string): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt));
  }

  async createFiatTransaction(transaction: InsertFiatTransaction): Promise<FiatTransaction> {
    const [row] = await db.insert(fiatTransactions).values(transaction).returning();
    return row;
  }

  async updateFiatTransaction(id: string, updates: Partial<InsertFiatTransaction>): Promise<FiatTransaction> {
    const [row] = await db
      .update(fiatTransactions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(fiatTransactions.id, id))
      .returning();
    return row;
  }

  async getFiatTransactionBySessionId(sessionId: string): Promise<FiatTransaction | undefined> {
    const [row] = await db.select().from(fiatTransactions).where(eq(fiatTransactions.stripeSessionId, sessionId));
    return row;
  }

  async updateFiatTransactionBySessionId(
    sessionId: string,
    updates: Partial<InsertFiatTransaction>,
  ): Promise<FiatTransaction | undefined> {
    const [row] = await db
      .update(fiatTransactions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(fiatTransactions.stripeSessionId, sessionId))
      .returning();
    return row;
  }

  async getUserBalance(userId: string): Promise<UserBalance | undefined> {
    const [balance] = await db.select().from(userBalances).where(eq(userBalances.userId, userId));
    return balance;
  }

  async adjustImmortalityCredits(params: {
    userId: string;
    credits: number;
    source: string;
    reference?: string;
    metadata?: Record<string, unknown>;
  }): Promise<{ balance: UserBalance; ledger: ImmortalityLedgerEntry }> {
    const { userId, credits, source, reference, metadata } = params;
    const [balance] = await db
      .insert(userBalances)
      .values({
        userId,
        immortalityCredits: credits,
        poiCredits: 0,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: userBalances.userId,
        set: {
          immortalityCredits: sql`${userBalances.immortalityCredits} + ${credits}`,
          updatedAt: new Date(),
        },
      })
      .returning();

    const [ledger] = await db
      .insert(immortalityLedger)
      .values({
        userId,
        type: credits >= 0 ? "credit" : "debit",
        amountCredits: Math.abs(credits),
        source,
        reference: reference || null,
        metadata: metadata ?? null,
      })
      .returning();

    return { balance, ledger };
  }

  // POI Tier operations
  async getAllTiers(): Promise<PoiTier[]> {
    return await db
      .select()
      .from(poiTiers)
      .orderBy(poiTiers.minPoi);
  }

  async getUserTier(poiBalance: number): Promise<PoiTier | undefined> {
    const tiers = await db
      .select()
      .from(poiTiers)
      .where(gte(sql`${poiBalance}`, poiTiers.minPoi))
      .orderBy(desc(poiTiers.minPoi))
      .limit(1);
    return tiers[0];
  }

  // POI Fee Credit operations
  async getFeeCredit(userId: string): Promise<PoiFeeCredit | undefined> {
    const [feeCredit] = await db
      .select()
      .from(poiFeeCredits)
      .where(eq(poiFeeCredits.userId, userId));
    return feeCredit;
  }

  async createFeeCredit(feeCredit: InsertPoiFeeCredit): Promise<PoiFeeCredit> {
    const [newFeeCredit] = await db
      .insert(poiFeeCredits)
      .values(feeCredit)
      .returning();
    return newFeeCredit;
  }

  async updateFeeCreditBalance(userId: string, amountCents: number): Promise<PoiFeeCredit> {
    // Check if user has fee credit record
    const existing = await this.getFeeCredit(userId);
    
    if (!existing) {
      // Create new record
      return await this.createFeeCredit({
        userId,
        balanceCents: amountCents,
      });
    }

    // Update existing record
    const [updated] = await db
      .update(poiFeeCredits)
      .set({
        balanceCents: sql`${poiFeeCredits.balanceCents} + ${amountCents}`,
        updatedAt: new Date(),
      })
      .where(eq(poiFeeCredits.userId, userId))
      .returning();
    return updated;
  }

  // POI Fee Credit Lock operations
  async createFeeCreditLock(lock: InsertPoiFeeCreditLock): Promise<PoiFeeCreditLock> {
    const [newLock] = await db
      .insert(poiFeeCreditLocks)
      .values(lock)
      .returning();
    return newLock;
  }

  async getFeeCreditLock(orderId: string): Promise<PoiFeeCreditLock | undefined> {
    const [lock] = await db
      .select()
      .from(poiFeeCreditLocks)
      .where(eq(poiFeeCreditLocks.orderId, orderId));
    return lock;
  }

  async updateFeeCreditLockStatus(lockId: string, status: string): Promise<PoiFeeCreditLock> {
    const [updated] = await db
      .update(poiFeeCreditLocks)
      .set({ status, updatedAt: new Date() })
      .where(eq(poiFeeCreditLocks.id, lockId))
      .returning();
    return updated;
  }

  async releaseFeeCreditLock(orderId: string): Promise<void> {
    await db
      .update(poiFeeCreditLocks)
      .set({ status: 'released', updatedAt: new Date() })
      .where(eq(poiFeeCreditLocks.orderId, orderId));
  }

  // Market operations
  async createMarketOrder(order: InsertMarketOrder): Promise<MarketOrder> {
    const [created] = await db.insert(marketOrders).values(order).returning();
    return created;
  }

  async getMarketOrderById(orderId: string): Promise<MarketOrder | undefined> {
    const [order] = await db.select().from(marketOrders).where(eq(marketOrders.id, orderId));
    return order;
  }

  async getMarketOrderForUser(orderId: string, userId: string): Promise<MarketOrder | undefined> {
    const [order] = await db
      .select()
      .from(marketOrders)
      .where(and(eq(marketOrders.id, orderId), eq(marketOrders.userId, userId)));
    return order;
  }

  async getMarketOrderByIdempotency(userId: string, idempotencyKey: string): Promise<MarketOrder | undefined> {
    if (!idempotencyKey) {
      return undefined;
    }

    const [order] = await db
      .select()
      .from(marketOrders)
      .where(and(eq(marketOrders.userId, userId), eq(marketOrders.idempotencyKey, idempotencyKey)));
    return order;
  }

  async updateMarketOrder(orderId: string, updates: Partial<InsertMarketOrder>): Promise<MarketOrder> {
    const [order] = await db
      .update(marketOrders)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(marketOrders.id, orderId))
      .returning();
    return order;
  }

  async listMarketOrders(params: {
    userId: string;
    status?: string;
    limit: number;
    offset: number;
  }): Promise<{ orders: MarketOrder[]; total: number }> {
    const { userId, status, limit, offset } = params;
    const whereClause = status
      ? and(eq(marketOrders.userId, userId), eq(marketOrders.status, status))
      : eq(marketOrders.userId, userId);

    const orders = await db
      .select()
      .from(marketOrders)
      .where(whereClause)
      .orderBy(desc(marketOrders.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ value: total }] = await db
      .select({ value: sql<number>`count(*)` })
      .from(marketOrders)
      .where(whereClause);

    return { orders, total: Number(total ?? 0) };
  }

  async createMarketTrade(trade: InsertMarketTrade): Promise<MarketTrade> {
    const [created] = await db.insert(marketTrades).values(trade).returning();
    return created;
  }

  async getMarketTradesForOrder(orderId: string): Promise<MarketTrade[]> {
    return await db
      .select()
      .from(marketTrades)
      .where(eq(marketTrades.orderId, orderId))
      .orderBy(desc(marketTrades.createdAt));
  }

  async getRecentMarketTrades(params: {
    tokenIn: string;
    tokenOut: string;
    limit: number;
  }): Promise<Array<{ trade: MarketTrade; order: MarketOrder }>> {
    const { tokenIn, tokenOut, limit } = params;
    const pairClause = or(
      and(eq(marketOrders.tokenIn, tokenIn), eq(marketOrders.tokenOut, tokenOut)),
      and(eq(marketOrders.tokenIn, tokenOut), eq(marketOrders.tokenOut, tokenIn)),
    );

    return await db
      .select({ trade: marketTrades, order: marketOrders })
      .from(marketTrades)
      .innerJoin(marketOrders, eq(marketTrades.orderId, marketOrders.id))
      .where(pairClause)
      .orderBy(desc(marketTrades.createdAt))
      .limit(limit);
  }

  async getMarketTradesSince(params: {
    tokenIn: string;
    tokenOut: string;
    since: Date;
  }): Promise<Array<{ trade: MarketTrade; order: MarketOrder }>> {
    const { tokenIn, tokenOut, since } = params;
    const pairClause = or(
      and(eq(marketOrders.tokenIn, tokenIn), eq(marketOrders.tokenOut, tokenOut)),
      and(eq(marketOrders.tokenIn, tokenOut), eq(marketOrders.tokenOut, tokenIn)),
    );

    return await db
      .select({ trade: marketTrades, order: marketOrders })
      .from(marketTrades)
      .innerJoin(marketOrders, eq(marketTrades.orderId, marketOrders.id))
      .where(and(pairClause, gte(marketTrades.createdAt, since)))
      .orderBy(desc(marketTrades.createdAt));
  }

  async getPendingMarketOrdersForPair(params: { tokenIn: string; tokenOut: string }): Promise<MarketOrder[]> {
    const { tokenIn, tokenOut } = params;
    const pairClause = or(
      and(eq(marketOrders.tokenIn, tokenIn), eq(marketOrders.tokenOut, tokenOut)),
      and(eq(marketOrders.tokenIn, tokenOut), eq(marketOrders.tokenOut, tokenIn)),
    );

    return await db
      .select()
      .from(marketOrders)
      .where(and(pairClause, eq(marketOrders.status, 'PENDING')))
      .orderBy(desc(marketOrders.createdAt));
  }

  // Reserve pool operations
  async getReserveBalances(): Promise<ReserveBalance[]> {
    return await db.select().from(reserveBalances).orderBy(reserveBalances.asset);
  }

  async getReserveBalance(asset: string): Promise<ReserveBalance | undefined> {
    if (!asset) {
      return undefined;
    }

    const [balance] = await db
      .select()
      .from(reserveBalances)
      .where(eq(reserveBalances.asset, asset.toUpperCase()));
    return balance;
  }

  async upsertReserveBalance(balance: InsertReserveBalance): Promise<ReserveBalance> {
    const upperAsset = balance.asset.toUpperCase();
    const [updated] = await db
      .insert(reserveBalances)
      .values({ ...balance, asset: upperAsset })
      .onConflictDoUpdate({
        target: reserveBalances.asset,
        set: { balance: balance.balance, updatedAt: new Date() },
      })
      .returning();
    return updated;
  }

  async sumFeesLedgerSince(days: number): Promise<string> {
    if (days <= 0) {
      return await this.sumFeesLedgerAllTime();
    }

    const since = new Date();
    since.setUTCDate(since.getUTCDate() - days);

    const [row] = await db
      .select({ total: sql<string>`COALESCE(SUM(${feesLedger.amount}), '0')` })
      .from(feesLedger)
      .where(gte(feesLedger.createdAt, since));
    return row?.total ?? '0';
  }

  async sumFeesLedgerAllTime(): Promise<string> {
    const [row] = await db.select({ total: sql<string>`COALESCE(SUM(${feesLedger.amount}), '0')` }).from(feesLedger);
    return row?.total ?? '0';
  }

  async getReserveHistory(rangeDays: number): Promise<Array<{ date: string; fees: string; buyback: string }>> {
    const days = Math.max(rangeDays, 1);
    const start = new Date();
    start.setUTCDate(start.getUTCDate() - (days - 1));
    start.setUTCHours(0, 0, 0, 0);

    const feeRows = await db
      .select({
        day: sql<string>`DATE_TRUNC('day', ${feesLedger.createdAt})::date`,
        total: sql<string>`SUM(${feesLedger.amount})`,
      })
      .from(feesLedger)
      .where(gte(feesLedger.createdAt, start))
      .groupBy(sql`DATE_TRUNC('day', ${feesLedger.createdAt})`)
      .orderBy(sql`DATE_TRUNC('day', ${feesLedger.createdAt})`);

    const buybackRows = await db
      .select({
        day: sql<string>`DATE_TRUNC('day', ${reserveActions.createdAt})::date`,
        total: sql<string>`SUM(((${reserveActions.payload} ->> 'amountUSDC')::numeric))`,
      })
      .from(reserveActions)
      .where(and(eq(reserveActions.type, 'buyback'), gte(reserveActions.createdAt, start)))
      .groupBy(sql`DATE_TRUNC('day', ${reserveActions.createdAt})`)
      .orderBy(sql`DATE_TRUNC('day', ${reserveActions.createdAt})`);

    const feesMap = new Map<string, string>();
    for (const row of feeRows) {
      feesMap.set(row.day, row.total ?? '0');
    }

    const buybackMap = new Map<string, string>();
    for (const row of buybackRows) {
      buybackMap.set(row.day, row.total ?? '0');
    }

    const series: Array<{ date: string; fees: string; buyback: string }> = [];
    const cursor = new Date(start);
    for (let i = 0; i < days; i++) {
      const isoDate = cursor.toISOString().slice(0, 10);
      series.push({
        date: isoDate,
        fees: feesMap.get(isoDate) ?? '0',
        buyback: buybackMap.get(isoDate) ?? '0',
      });
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    return series;
  }

  async createReserveAction(action: InsertReserveAction): Promise<ReserveAction> {
    const [created] = await db.insert(reserveActions).values(action).returning();
    return created;
  }

  async updateReserveAction(
    id: string,
    updates: Partial<InsertReserveAction & { executedAt?: Date | null }>,
  ): Promise<ReserveAction> {
    const updatePayload: Record<string, unknown> = { ...updates };
    if (updatePayload.executedAt === undefined) {
      delete updatePayload.executedAt;
    }

    const [updated] = await db
      .update(reserveActions)
      .set(updatePayload)
      .where(eq(reserveActions.id, id))
      .returning();
    return updated;
  }

  async getReserveActionById(id: string): Promise<ReserveAction | undefined> {
    const [action] = await db.select().from(reserveActions).where(eq(reserveActions.id, id));
    return action;
  }

  async getReserveActionByIdempotency(type: string, idempotencyKey: string): Promise<ReserveAction | undefined> {
    if (!idempotencyKey) {
      return undefined;
    }

    const [action] = await db
      .select()
      .from(reserveActions)
      .where(and(eq(reserveActions.type, type), eq(reserveActions.idempotencyKey, idempotencyKey)));
    return action;
  }

  async listRecentReserveActions(limit: number): Promise<ReserveAction[]> {
    return await db
      .select()
      .from(reserveActions)
      .orderBy(desc(reserveActions.createdAt))
      .limit(limit);
  }

  async sumReserveActionsByType(type: string): Promise<string> {
    if (type === 'withdraw') {
      const [row] = await db
        .select({
          total: sql<string>`COALESCE(SUM(((${reserveActions.payload} ->> 'amount')::numeric)), '0')`,
        })
        .from(reserveActions)
        .where(eq(reserveActions.type, type));
      return row?.total ?? '0';
    }

    const [row] = await db
      .select({
        total: sql<string>`COALESCE(SUM(((${reserveActions.payload} ->> 'amountUSDC')::numeric)), '0')`,
      })
      .from(reserveActions)
      .where(eq(reserveActions.type, type));
    return row?.total ?? '0';
  }

  async getLatestReserveAction(type: string): Promise<ReserveAction | undefined> {
    const [latest] = await db
      .select()
      .from(reserveActions)
      .where(eq(reserveActions.type, type))
      .orderBy(desc(reserveActions.createdAt))
      .limit(1);
    return latest;
  }

  // Merchant operations
  async listProducts(params: {
    merchantId: string;
    status?: string;
    limit: number;
    offset: number;
  }): Promise<{ products: Product[]; total: number }> {
    const { merchantId, status, limit, offset } = params;
    let whereClause: any = eq(products.merchantId, merchantId);
    if (status) {
      whereClause = and(whereClause, eq(products.status, status));
    }

    const rows = await db
      .select()
      .from(products)
      .where(whereClause)
      .orderBy(desc(products.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ value: total }] = await db
      .select({ value: sql<number>`count(*)` })
      .from(products)
      .where(whereClause);

    return { products: rows, total: Number(total ?? 0) };
  }

  async getProductById(productId: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, productId));
    return product;
  }

  async getProductByIdempotency(merchantId: string, idempotencyKey: string): Promise<Product | undefined> {
    if (!idempotencyKey) {
      return undefined;
    }

    const [product] = await db
      .select()
      .from(products)
      .where(and(eq(products.merchantId, merchantId), eq(products.idempotencyKey, idempotencyKey)));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [created] = await db.insert(products).values(product).returning();
    return created;
  }

  async updateProduct(productId: string, updates: Partial<InsertProduct>): Promise<Product> {
    const [updated] = await db
      .update(products)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(products.id, productId))
      .returning();
    return updated;
  }

  async archiveProduct(productId: string): Promise<void> {
    await db
      .update(products)
      .set({ status: 'ARCHIVED', updatedAt: new Date() })
      .where(eq(products.id, productId));
  }

  async listMerchantOrders(params: {
    merchantId: string;
    status?: string;
    limit: number;
    offset: number;
  }): Promise<{ orders: MerchantOrder[]; total: number }> {
    const { merchantId, status, limit, offset } = params;
    let whereClause: any = eq(merchantOrders.merchantId, merchantId);
    if (status) {
      whereClause = and(whereClause, eq(merchantOrders.status, status));
    }

    const orders = await db
      .select()
      .from(merchantOrders)
      .where(whereClause)
      .orderBy(desc(merchantOrders.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ value: total }] = await db
      .select({ value: sql<number>`count(*)` })
      .from(merchantOrders)
      .where(whereClause);

    return { orders, total: Number(total ?? 0) };
  }

  async getMerchantOrder(orderId: string): Promise<MerchantOrder | undefined> {
    const [order] = await db.select().from(merchantOrders).where(eq(merchantOrders.id, orderId));
    return order;
  }

  async updateMerchantOrder(orderId: string, updates: Partial<InsertMerchantOrder>): Promise<MerchantOrder> {
    const [updated] = await db
      .update(merchantOrders)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(merchantOrders.id, orderId))
      .returning();
    return updated;
  }

  async getMerchantOrderSummary(params: { merchantId: string; start?: Date; end?: Date }): Promise<{
    sales: string;
    orders: number;
    fees: string;
  }> {
    const { merchantId, start, end } = params;
    let whereClause: any = eq(merchantOrders.merchantId, merchantId);
    if (start) {
      whereClause = and(whereClause, gte(merchantOrders.createdAt, start));
    }
    if (end) {
      whereClause = and(whereClause, lte(merchantOrders.createdAt, end));
    }

    const [row] = await db
      .select({
        sales: sql<string>`COALESCE(SUM(${merchantOrders.amount}), '0')`,
        fees: sql<string>`COALESCE(SUM(${merchantOrders.fee}), '0')`,
        orders: sql<number>`count(*)`,
      })
      .from(merchantOrders)
      .where(whereClause);

    return {
      sales: row?.sales ?? '0',
      fees: row?.fees ?? '0',
      orders: Number(row?.orders ?? 0),
    };
  }

  async listTaxReports(merchantId: string): Promise<TaxReport[]> {
    return await db
      .select()
      .from(taxReports)
      .where(eq(taxReports.merchantId, merchantId))
      .orderBy(desc(taxReports.periodStart));
  }

  async getTaxReportById(reportId: string): Promise<TaxReport | undefined> {
    const [report] = await db.select().from(taxReports).where(eq(taxReports.id, reportId));
    return report;
  }

  async getTaxReportByIdempotency(merchantId: string, idempotencyKey: string): Promise<TaxReport | undefined> {
    if (!idempotencyKey) {
      return undefined;
    }

    const [report] = await db
      .select()
      .from(taxReports)
      .where(and(eq(taxReports.merchantId, merchantId), eq(taxReports.idempotencyKey, idempotencyKey)));
    return report;
  }

  async createTaxReport(report: InsertTaxReport): Promise<TaxReport> {
    const [created] = await db.insert(taxReports).values(report).returning();
    return created;
  }

  async updateTaxReport(reportId: string, updates: Partial<InsertTaxReport>): Promise<TaxReport> {
    const [updated] = await db
      .update(taxReports)
      .set(updates)
      .where(eq(taxReports.id, reportId))
      .returning();
    return updated;
  }

  // TGE Email Subscription
  async subscribeTgeEmail(email: string, source?: string): Promise<TgeEmailSubscription> {
    const [subscription] = await db
      .insert(tgeEmailSubscriptions)
      .values({
        email: email.toLowerCase().trim(),
        source: source || 'tge_page',
      })
      .onConflictDoUpdate({
        target: tgeEmailSubscriptions.email,
        set: {
          subscribed: true,
          updatedAt: sql`NOW()`,
        },
      })
      .returning();
    return subscription;
  }

  // User Statistics
  async getTotalUsersCount(): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(users);
    return Number(result?.count ?? 0);
  }

  // Early-Bird Tasks
  async getEarlyBirdTasks(): Promise<EarlyBirdTask[]> {
    return await db
      .select()
      .from(earlyBirdTasks)
      .where(eq(earlyBirdTasks.isActive, true))
      .orderBy(earlyBirdTasks.sortOrder);
  }

  async createEarlyBirdTask(task: InsertEarlyBirdTask): Promise<EarlyBirdTask> {
    const [created] = await db.insert(earlyBirdTasks).values(task).returning();
    return created;
  }

  // User Early-Bird Progress
  async getUserEarlyBirdProgress(userId: string): Promise<UserEarlyBirdProgress[]> {
    return await db
      .select()
      .from(userEarlyBirdProgress)
      .where(eq(userEarlyBirdProgress.userId, userId));
  }

  async markTaskComplete(userId: string, taskId: string, rewardAmount: number): Promise<UserEarlyBirdProgress> {
    const [progress] = await db
      .insert(userEarlyBirdProgress)
      .values({
        userId,
        taskId,
        completed: true,
        completedAt: sql`NOW()`,
        rewardAmount,
      })
      .onConflictDoUpdate({
        target: [userEarlyBirdProgress.userId, userEarlyBirdProgress.taskId],
        set: {
          completed: true,
          completedAt: sql`NOW()`,
          updatedAt: sql`NOW()`,
        },
      })
      .returning();
    return progress;
  }

  // Early-Bird Campaign Stats
  async getEarlyBirdStats(): Promise<{
    totalParticipants: number;
    totalRewardsDistributed: string;
    config: EarlyBirdConfig | undefined;
  }> {
    // Get unique participants count
    const [participantsResult] = await db
      .select({ count: sql<number>`COUNT(DISTINCT ${userEarlyBirdProgress.userId})` })
      .from(userEarlyBirdProgress)
      .where(eq(userEarlyBirdProgress.completed, true));

    // Get total rewards distributed
    const [rewardsResult] = await db
      .select({ total: sql<string>`COALESCE(SUM(${userEarlyBirdProgress.rewardAmount}), '0')` })
      .from(userEarlyBirdProgress)
      .where(eq(userEarlyBirdProgress.completed, true));

    // Get active config
    const [config] = await db
      .select()
      .from(earlyBirdConfig)
      .where(eq(earlyBirdConfig.isActive, true))
      .orderBy(desc(earlyBirdConfig.createdAt))
      .limit(1);

    return {
      totalParticipants: Number(participantsResult?.count ?? 0),
      totalRewardsDistributed: rewardsResult?.total ?? '0',
      config,
    };
  }

  async getUserEarlyBirdSummary(userId: string): Promise<{
    totalEarned: number;
    totalPotential: number;
    tasksCompleted: number;
    totalTasks: number;
  }> {
    // Get all active tasks
    const allTasks = await this.getEarlyBirdTasks();
    const totalTasks = allTasks.length;
    const totalPotential = allTasks.reduce((sum, task) => sum + task.reward, 0);

    // Get user's completed tasks
    const userProgress = await this.getUserEarlyBirdProgress(userId);
    const completedTasks = userProgress.filter(p => p.completed);
    const tasksCompleted = completedTasks.length;
    const totalEarned = completedTasks.reduce((sum, p) => sum + p.rewardAmount, 0);

    return {
      totalEarned,
      totalPotential,
      tasksCompleted,
      totalTasks,
    };
  }

  async getEarlyBirdConfig(): Promise<EarlyBirdConfig | undefined> {
    const [config] = await db
      .select()
      .from(earlyBirdConfig)
      .where(eq(earlyBirdConfig.isActive, true))
      .orderBy(desc(earlyBirdConfig.createdAt))
      .limit(1);
    return config;
  }

  async createEarlyBirdConfig(config: InsertEarlyBirdConfig): Promise<EarlyBirdConfig> {
    const [created] = await db.insert(earlyBirdConfig).values(config).returning();
    return created;
  }

  // Referral Program
  async getOrCreateReferralCode(userId: string): Promise<ReferralCode> {
    // Check if user already has a referral code
    const [existing] = await db
      .select()
      .from(referralCodes)
      .where(eq(referralCodes.userId, userId));

    if (existing) {
      return existing;
    }

    // Generate a unique referral code
    const code = this.generateReferralCode();
    const [created] = await db
      .insert(referralCodes)
      .values({
        userId,
        referralCode: code,
      })
      .returning();
    
    return created;
  }

  private generateReferralCode(): string {
    // Generate a random 8-character alphanumeric code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  async createReferral(inviterId: string, inviteeId: string, referralCode: string): Promise<Referral> {
    const [referral] = await db
      .insert(referrals)
      .values({
        inviterId,
        inviteeId,
        referralCode,
        status: 'registered',
        inviterRewardAmount: 10, // Default reward
        inviteeRewardAmount: 5,  // Default reward
      })
      .returning();
    
    return referral;
  }

  async getReferralByCode(code: string): Promise<ReferralCode | undefined> {
    const [referralCode] = await db
      .select()
      .from(referralCodes)
      .where(eq(referralCodes.referralCode, code));
    
    return referralCode;
  }

  async getUserReferralStats(userId: string): Promise<{
    totalInvites: number;
    successfulReferrals: number;
    totalEarned: number;
    pendingRewards: number;
  }> {
    // Get all referrals by this user
    const userReferrals = await db
      .select()
      .from(referrals)
      .where(eq(referrals.inviterId, userId));

    const totalInvites = userReferrals.length;
    const successfulReferrals = userReferrals.filter(r => r.status === 'verified' || r.status === 'activated').length;
    const totalEarned = userReferrals
      .filter(r => r.inviterRewarded)
      .reduce((sum, r) => sum + r.inviterRewardAmount, 0);
    const pendingRewards = userReferrals
      .filter(r => !r.inviterRewarded && (r.status === 'verified' || r.status === 'activated'))
      .reduce((sum, r) => sum + r.inviterRewardAmount, 0);

    return {
      totalInvites,
      successfulReferrals,
      totalEarned,
      pendingRewards,
    };
  }

  async getReferralLeaderboard(limit: number = 10): Promise<Array<{
    userId: string;
    username: string;
    referralCount: number;
  }>> {
    const results = await db
      .select({
        userId: referrals.inviterId,
        referralCount: sql<number>`COUNT(*)`,
      })
      .from(referrals)
      .where(or(eq(referrals.status, 'verified'), eq(referrals.status, 'activated')))
      .groupBy(referrals.inviterId)
      .orderBy(desc(sql`COUNT(*)`))
      .limit(limit);

    // Get usernames for top referrers
    const leaderboard = await Promise.all(
      results.map(async (entry, index) => {
        const user = await this.getUser(entry.userId);
        return {
          userId: entry.userId,
          username: user?.username || `用户***${entry.userId.slice(-4)}`,
          referralCount: Number(entry.referralCount),
        };
      })
    );

    return leaderboard;
  }

  async hasBeenReferred(userId: string): Promise<boolean> {
    const [referral] = await db
      .select()
      .from(referrals)
      .where(eq(referrals.inviteeId, userId));
    
    return !!referral;
  }

  // Airdrop
  async checkAirdropEligibility(userIdOrAddress: string): Promise<{
    eligible: boolean;
    amount: number;
    claimed: boolean;
    claimDate?: string;
    vestingInfo?: string;
    index?: number;
    proof?: string[];
    roundId?: number;
  }> {
    // Try to find by userId or walletAddress
    const [result] = await db
      .select()
      .from(airdropEligibility)
      .where(
        or(
          eq(airdropEligibility.userId, userIdOrAddress),
          eq(airdropEligibility.walletAddress, userIdOrAddress.toLowerCase())
        )
      );

    if (!result) {
      return {
        eligible: false,
        amount: 0,
        claimed: false,
      };
    }

    return {
      eligible: result.eligible,
      amount: result.amount,
      claimed: result.claimed,
      claimDate: result.claimDate?.toISOString(),
      vestingInfo: result.vestingInfo || undefined,
      index: result.merkleIndex || undefined,
      proof: (result.merkleProof as string[]) || undefined,
      roundId: result.roundId || undefined,
    };
  }


  async createAirdropEligibility(data: InsertAirdropEligibility): Promise<AirdropEligibility> {
    const [created] = await db
      .insert(airdropEligibility)
      .values(data)
      .returning();
    
    return created;
  }

  // AgentKit actions
  async createAgentkitAction(action: InsertAgentkitAction): Promise<AgentkitAction> {
    const [record] = await db.insert(agentkitActions).values(action).returning();
    return record;
  }

  async updateAgentkitAction(id: string, updates: Partial<InsertAgentkitAction>): Promise<AgentkitAction> {
    const [record] = await db
      .update(agentkitActions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(agentkitActions.id, id))
      .returning();
    return record;
  }

  async getAgentkitAction(id: string): Promise<AgentkitAction | undefined> {
    const [record] = await db.select().from(agentkitActions).where(eq(agentkitActions.id, id));
    return record;
  }

  // Early-bird registration
  async createEarlyBirdRegistration(data: InsertEarlyBirdRegistration): Promise<EarlyBirdRegistration> {
    const [row] = await db
      .insert(earlyBirdRegistrations)
      .values({ ...data, createdAt: new Date(), updatedAt: new Date() })
      .onConflictDoUpdate({
        target: earlyBirdRegistrations.email,
        set: {
          wallet: data.wallet,
          referrerCode: data.referrerCode ?? null,
          verifyToken: data.verifyToken ?? null,
          updatedAt: new Date(),
        },
      })
      .returning();
    return row;
  }

  async setEarlyBirdVerifyToken(email: string, token: string): Promise<EarlyBirdRegistration | undefined> {
    const [row] = await db
      .update(earlyBirdRegistrations)
      .set({ verifyToken: token, updatedAt: new Date() })
      .where(eq(earlyBirdRegistrations.email, email.toLowerCase()))
      .returning();
    return row;
  }

  async getEarlyBirdRegistrationByEmail(email: string): Promise<EarlyBirdRegistration | undefined> {
    const [row] = await db.select().from(earlyBirdRegistrations).where(eq(earlyBirdRegistrations.email, email.toLowerCase()));
    return row;
  }

  async getEarlyBirdRegistrationByWallet(wallet: string): Promise<EarlyBirdRegistration | undefined> {
    const [row] = await db.select().from(earlyBirdRegistrations).where(eq(earlyBirdRegistrations.wallet, wallet.toLowerCase()));
    return row;
  }

  async verifyEarlyBirdRegistration(token: string): Promise<EarlyBirdRegistration | undefined> {
    const [row] = await db
      .update(earlyBirdRegistrations)
      .set({ status: 'verified', verifiedAt: new Date(), updatedAt: new Date() })
      .where(eq(earlyBirdRegistrations.verifyToken, token))
      .returning();
    return row;
  }

  // Identity bindings
  async getUserIdentities(userId: string): Promise<UserIdentity[]> {
    return await db.select().from(userIdentities).where(eq(userIdentities.userId, userId));
  }

  async findIdentity(provider: string, providerUserId?: string, walletAddress?: string): Promise<UserIdentity | undefined> {
    if (walletAddress) {
      const [row] = await db.select().from(userIdentities).where(eq(userIdentities.walletAddress, walletAddress.toLowerCase()));
      if (row) return row;
    }
    if (providerUserId) {
      const [row] = await db
        .select()
        .from(userIdentities)
        .where(and(eq(userIdentities.provider, provider), eq(userIdentities.providerUserId, providerUserId)));
      return row;
    }
    return undefined;
  }

  async upsertIdentity(identity: InsertUserIdentity): Promise<UserIdentity> {
    const normalized: InsertUserIdentity = {
      ...identity,
      email: identity.email?.toLowerCase(),
      walletAddress: identity.walletAddress?.toLowerCase(),
    };
    const [row] = await db
      .insert(userIdentities)
      .values({ ...normalized, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: userIdentities.id,
        set: {
          email: normalized.email ?? null,
          emailVerified: normalized.emailVerified ?? false,
          walletAddress: normalized.walletAddress ?? null,
          updatedAt: new Date(),
        },
      })
      .returning();
    return row;
  }

  async mergeUsers(primaryUserId: string, secondaryUserId: string): Promise<void> {
    await db
      .update(userIdentities)
      .set({ userId: primaryUserId, updatedAt: new Date() })
      .where(eq(userIdentities.userId, secondaryUserId));

    await db.update(userPersonalityProfiles).set({ userId: primaryUserId }).where(eq(userPersonalityProfiles.userId, secondaryUserId));
    await db.update(userBalances).set({ userId: primaryUserId }).where(eq(userBalances.userId, secondaryUserId));
    await db.update(userMemories).set({ userId: primaryUserId }).where(eq(userMemories.userId, secondaryUserId));

    await db.delete(users).where(eq(users.id, secondaryUserId));
  }

  // Badge operations
  async createBadge(data: InsertBadge): Promise<Badge> {
    const [badge] = await db.insert(badges).values(data).returning();
    return badge;
  }

  async getBadgesByOwner(owner: string): Promise<Badge[]> {
    return await db
      .select()
      .from(badges)
      .where(eq(badges.owner, owner.toLowerCase()))
      .orderBy(desc(badges.mintedAt));
  }

  async getBadgeByTokenId(tokenId: string): Promise<Badge | undefined> {
    const [badge] = await db.select().from(badges).where(eq(badges.tokenId, tokenId));
    return badge;
  }

  // Event sync state operations
  async getOrCreateSyncState(contractName: string): Promise<EventSyncState> {
    const [existing] = await db
      .select()
      .from(eventSyncState)
      .where(eq(eventSyncState.contractName, contractName));

    if (existing) {
      return existing;
    }

    const [newState] = await db
      .insert(eventSyncState)
      .values({ contractName, lastBlockNumber: null })
      .returning();
    return newState;
  }

  async updateLastIndexedBlock(contractName: string, lastBlockNumber: string): Promise<EventSyncState> {
    const [updated] = await db
      .update(eventSyncState)
      .set({ lastBlockNumber, updatedAt: new Date() })
      .where(eq(eventSyncState.contractName, contractName))
      .returning();
    return updated;
  }

  async getLastIndexedBlock(contractName: string): Promise<string | null> {
    const [state] = await db
      .select()
      .from(eventSyncState)
      .where(eq(eventSyncState.contractName, contractName));
    return state?.lastBlockNumber || null;
  }
}

export const storage = new DatabaseStorage();
