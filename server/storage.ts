// Storage implementation - includes Replit Auth required methods from blueprint:javascript_log_in_with_replit
import {
  users,
  profiles,
  links,
  transactions,
  type User,
  type UpsertUser,
  type InsertUser,
  type Profile,
  type InsertProfile,
  type Link,
  type InsertLink,
  type Transaction,
  type InsertTransaction,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // User management
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByWallet(walletAddress: string): Promise<User | undefined>;
  updateUserWallet(userId: string, walletAddress: string): Promise<User>;
  updateUserUsername(userId: string, username: string): Promise<User>;
  
  // Profile operations
  getProfile(userId: string): Promise<Profile | undefined>;
  getProfileByUsername(username: string): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(userId: string, updates: Partial<InsertProfile>): Promise<Profile>;
  incrementProfileViews(userId: string): Promise<void>;
  
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
}

export const storage = new DatabaseStorage();
