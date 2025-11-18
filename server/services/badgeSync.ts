/**
 * Background Badge Sync Worker
 * Continuously polls for new BadgeMinted events
 */

import { ethers } from "ethers";
import { indexBadgeEvents } from "./eventIndexer";

const SYNC_INTERVAL_MS = parseInt(process.env.BADGE_SYNC_INTERVAL || "300000", 10); // Default: 5 minutes

let syncInterval: NodeJS.Timeout | null = null;
let isRunning = false;

/**
 * Start background badge sync worker
 */
export function startBadgeSync(provider: ethers.providers.Provider) {
  if (isRunning) {
    console.log("[BadgeSync] Sync worker already running");
    return;
  }

  console.log(`[BadgeSync] Starting badge sync worker (interval: ${SYNC_INTERVAL_MS / 1000}s)`);

  // Initial sync
  performSync(provider).catch((error) => {
    console.error("[BadgeSync] Initial sync failed:", error);
  });

  // Set up interval
  syncInterval = setInterval(() => {
    performSync(provider).catch((error) => {
      console.error("[BadgeSync] Periodic sync failed:", error);
    });
  }, SYNC_INTERVAL_MS);

  isRunning = true;
}

/**
 * Stop background badge sync worker
 */
export function stopBadgeSync() {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
    isRunning = false;
    console.log("[BadgeSync] Stopped badge sync worker");
  }
}

/**
 * Perform a single sync operation
 */
async function performSync(provider: ethers.providers.Provider) {
  try {
    console.log("[BadgeSync] Starting sync...");
    const result = await indexBadgeEvents(provider);
    console.log(`[BadgeSync] Sync completed: indexed ${result.indexed} badges, lastBlock: ${result.lastBlock}`);
  } catch (error: any) {
    console.error("[BadgeSync] Sync error:", error.message);
    // Don't throw - allow sync to continue on next interval
  }
}

/**
 * Manually trigger a sync (for API endpoints)
 */
export async function triggerSync(provider: ethers.providers.Provider): Promise<{ indexed: number; lastBlock: string }> {
  console.log("[BadgeSync] Manual sync triggered");
  return await indexBadgeEvents(provider);
}

