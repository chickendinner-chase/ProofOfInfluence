/**
 * Event Indexer Service
 * Indexes AchievementBadges BadgeMinted events from blockchain
 */

import { ethers } from "ethers";
import { storage } from "../storage";
import achievementBadgesConfig from "@shared/contracts/achievement_badges.json";

const ACHIEVEMENT_BADGES_ADDRESS = achievementBadgesConfig.address;

// AchievementBadges BadgeMinted event ABI
const BADGE_MINTED_ABI = [
  "event BadgeMinted(address indexed to, uint256 indexed badgeType, uint256 tokenId)",
];

// Contract name for sync state tracking
const CONTRACT_NAME = "AchievementBadges";

/**
 * Index BadgeMinted events from AchievementBadges contract
 * Queries events since last processed block (incremental sync)
 * First run: sync from deployment block or current block
 */
export async function indexBadgeEvents(
  provider: ethers.providers.Provider,
  fromBlock?: number,
  toBlock?: number
): Promise<{ indexed: number; lastBlock: string }> {
  if (!ACHIEVEMENT_BADGES_ADDRESS || ACHIEVEMENT_BADGES_ADDRESS === "0x0000000000000000000000000000000000000000") {
    throw new Error("ACHIEVEMENT_BADGES_ADDRESS not configured");
  }

  const contract = new ethers.Contract(ACHIEVEMENT_BADGES_ADDRESS as string, BADGE_MINTED_ABI, provider);

  // Get sync state
  const syncState = await storage.getOrCreateSyncState(CONTRACT_NAME);
  
  // Determine starting block
  let startBlock: number;
  if (fromBlock !== undefined) {
    startBlock = fromBlock;
  } else if (syncState.lastBlockNumber) {
    // Incremental sync: start from last processed block + 1
    startBlock = parseInt(syncState.lastBlockNumber, 10) + 1;
  } else {
    // First run: start from deployment block or current block - 10000 (safety)
    const currentBlock = await provider.getBlockNumber();
    startBlock = Math.max(0, currentBlock - 10000); // Look back 10k blocks on first run
    console.log(`[EventIndexer] First run: starting from block ${startBlock} (current: ${currentBlock})`);
  }

  // Determine ending block
  let endBlock: number;
  if (toBlock !== undefined) {
    endBlock = toBlock;
  } else {
    const currentBlock = await provider.getBlockNumber();
    endBlock = currentBlock;
  }

  if (startBlock > endBlock) {
    console.log(`[EventIndexer] No new blocks to process (${startBlock} > ${endBlock})`);
    return { indexed: 0, lastBlock: syncState.lastBlockNumber || "0" };
  }

  console.log(`[EventIndexer] Querying BadgeMinted events from block ${startBlock} to ${endBlock}`);

  try {
    // Query BadgeMinted events
    const filter = contract.filters.BadgeMinted();
    const events = await contract.queryFilter(filter, startBlock, endBlock);

    console.log(`[EventIndexer] Found ${events.length} BadgeMinted events`);

    let indexedCount = 0;
    let lastProcessedBlock = startBlock - 1;

    // Process each event
    for (const event of events) {
      try {
        const { to, badgeType, tokenId } = event.args || {};
        
        if (!to || badgeType === undefined || tokenId === undefined) {
          console.warn(`[EventIndexer] Invalid event args:`, event.args);
          continue;
        }

        // Get block timestamp
        const block = await provider.getBlock(event.blockNumber);
        const mintedAt = new Date(block.timestamp * 1000);

        // Check if badge already exists (avoid duplicates)
        const existing = await storage.getBadgeByTokenId(tokenId.toString());
        if (existing) {
          console.log(`[EventIndexer] Badge ${tokenId} already indexed, skipping`);
          continue;
        }

        // Store badge in database
        await storage.createBadge({
          tokenId: tokenId.toString(),
          owner: to.toLowerCase(),
          badgeType: badgeType.toNumber(),
          tokenURI: null, // Will be fetched on demand
          mintedAt,
          blockNumber: event.blockNumber.toString(),
          transactionHash: event.transactionHash,
        });

        indexedCount++;
        lastProcessedBlock = Math.max(lastProcessedBlock, event.blockNumber);

        console.log(`[EventIndexer] Indexed badge: tokenId=${tokenId}, owner=${to}, badgeType=${badgeType}`);
      } catch (error: any) {
        console.error(`[EventIndexer] Error processing event:`, error.message);
        // Continue processing other events
      }
    }

    // Update sync state with last processed block
    if (indexedCount > 0 || lastProcessedBlock >= startBlock) {
      await storage.updateLastIndexedBlock(CONTRACT_NAME, lastProcessedBlock.toString());
      console.log(`[EventIndexer] Updated sync state: lastBlock=${lastProcessedBlock}`);
    }

    return {
      indexed: indexedCount,
      lastBlock: lastProcessedBlock.toString(),
    };
  } catch (error: any) {
    console.error(`[EventIndexer] Error querying events:`, error.message);
    throw error;
  }
}

