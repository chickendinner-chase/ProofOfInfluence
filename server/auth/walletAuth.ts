// Wallet-based authentication module
// Provides wallet signature verification and session management
// Uses PostgreSQL session store (same as Replit Auth)
import type { Request } from "express";

export interface WalletAuthUser {
  id: string; // userId from database
  walletAddress: string;
  email?: string | null;
  role?: string | null;
}

/**
 * Get wallet-authenticated user from session
 * Returns null if no wallet session exists
 */
export function getWalletAuthUser(req: Request): WalletAuthUser | null {
  const session: any = (req as any).session;
  if (!session || !session.walletUser) {
    return null;
  }
  return session.walletUser as WalletAuthUser;
}

/**
 * Set wallet-authenticated user in session
 * Called after successful wallet login
 */
export function setWalletAuthUser(req: Request, user: WalletAuthUser): void {
  const session: any = (req as any).session;
  if (!session) {
    console.error("[WalletAuth] Cannot set wallet user: session not available");
    return;
  }
  session.walletUser = user;
}

/**
 * Clear wallet-authenticated user from session
 * Called on wallet logout
 */
export function clearWalletAuthUser(req: Request): void {
  const session: any = (req as any).session;
  if (session && session.walletUser) {
    delete session.walletUser;
  }
}
