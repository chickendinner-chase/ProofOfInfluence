# Event Indexer Documentation

## Overview

The Event Indexer is a background polling service that indexes `BadgeMinted` events from the `AchievementBadges` contract and stores them in the database. This allows the frontend to efficiently query user badges without needing to scan blockchain events on-demand.

## Architecture

### Components

1. **Event Indexer Service** (`server/services/eventIndexer.ts`)
   - Queries `BadgeMinted` events from the blockchain
   - Stores badge data in the database
   - Tracks sync state (last processed block)

2. **Background Sync Worker** (`server/services/badgeSync.ts`)
   - Continuous polling service using `setInterval`
   - Periodically calls `indexBadgeEvents()`
   - Starts automatically on server initialization

3. **Database Schema** (`shared/schema.ts`)
   - `badges` table: Stores indexed badge data
   - `event_sync_state` table: Tracks sync progress per contract

4. **Storage Methods** (`server/storage.ts`)
   - `createBadge()`: Insert badge record
   - `getBadgesByOwner()`: Query badges by wallet address
   - `getBadgeByTokenId()`: Get badge by token ID
   - `getOrCreateSyncState()`: Get or create sync state
   - `updateLastIndexedBlock()`: Update sync state

5. **API Endpoints** (`server/routes/badge.ts`)
   - `GET /api/badges/tokens`: Get user's badge token IDs from database
   - `GET /api/badges/:tokenId`: Get badge details by token ID
   - `POST /api/admin/badges/sync`: Manually trigger sync

## Setup

### Environment Variables

- `BADGE_SYNC_INTERVAL`: Polling interval in milliseconds (default: 300000 = 5 minutes)
- `BASE_RPC_URL` or `BASE_SEPOLIA_RPC_URL`: RPC URL for event queries
- `ACHIEVEMENT_BADGES_ADDRESS`: Contract address (already configured)

### Database Migration

Run database migration to create `badges` and `event_sync_state` tables:

```bash
npm run db:push
```

## How It Works

### Initial Sync

On first run (when `lastBlockNumber` is null):
1. Starts from `currentBlock - 10000` (safety lookback)
2. Queries all `BadgeMinted` events from that block to current
3. Stores badges in database
4. Updates `lastBlockNumber` to current block

### Incremental Sync

On subsequent runs:
1. Starts from `lastBlockNumber + 1`
2. Queries events up to current block
3. Skips duplicate badges (checks by `tokenId`)
4. Updates `lastBlockNumber` to last processed block

### Event Processing

For each `BadgeMinted` event:
1. Extracts `to`, `badgeType`, `tokenId` from event args
2. Gets block timestamp for `mintedAt`
3. Checks if badge already exists (avoid duplicates)
4. Stores in database with:
   - `tokenId`: Token ID (bigint as string)
   - `owner`: Wallet address (lowercase)
   - `badgeType`: Badge type ID
   - `tokenURI`: null (fetched on demand from contract)
   - `mintedAt`: Block timestamp
   - `blockNumber`: Block number
   - `transactionHash`: Transaction hash

## API Usage

### Get User's Badges

```typescript
// GET /api/badges/tokens?address=0x...
const response = await fetch("/api/badges/tokens?address=0x...", {
  credentials: "include",
});
const data = await response.json();
// Returns: { tokenIds: ["1", "2"], badges: [...] }
```

### Get Badge Details

```typescript
// GET /api/badges/:tokenId
const response = await fetch("/api/badges/1");
const badge = await response.json();
// Returns: { tokenId, badgeType, tokenURI, owner, mintedAt, ... }
```

### Manual Sync

```typescript
// POST /api/admin/badges/sync (requires authentication)
const response = await fetch("/api/admin/badges/sync", {
  method: "POST",
  credentials: "include",
});
const result = await response.json();
// Returns: { message, indexed, lastBlock }
```

## Frontend Integration

The frontend `useBadge` hook:
1. Fetches `tokenIds` from `/api/badges/tokens`
2. Uses `useQueries` to fetch badge details from contract (`tokenURI`, `badgeType`)
3. Combines data for display

See `client/src/hooks/useBadge.ts` for implementation.

## Troubleshooting

### Sync Not Running

- Check if `BASE_RPC_URL` or `BASE_SEPOLIA_RPC_URL` is set
- Check server logs for sync worker startup messages
- Verify `ACHIEVEMENT_BADGES_ADDRESS` is configured

### Missing Badges

- Trigger manual sync: `POST /api/admin/badges/sync`
- Check sync state: Query `event_sync_state` table
- Verify contract address is correct
- Check RPC provider is accessible

### Duplicate Badges

- Indexer automatically skips duplicates (checks by `tokenId`)
- If duplicates exist, clean database and re-sync

### Sync State

Query sync state:
```sql
SELECT * FROM event_sync_state WHERE contract_name = 'AchievementBadges';
```

Reset sync state (to re-sync from beginning):
```sql
UPDATE event_sync_state SET last_block_number = NULL WHERE contract_name = 'AchievementBadges';
```

## Configuration

### Sync Interval

Default: 5 minutes (300000 ms)

Change via environment variable:
```bash
BADGE_SYNC_INTERVAL=600000  # 10 minutes
```

### Error Handling

- Errors are logged but don't crash the server
- Sync continues on next interval even if previous sync failed
- Individual event processing errors are logged but don't stop batch

## Future Enhancements

1. **Batch Processing**: Process events in batches for better performance
2. **WebSocket Support**: Real-time event indexing instead of polling
3. **Multiple Contracts**: Support indexing events from multiple contracts
4. **Event Filtering**: Filter events by criteria (badgeType, owner, etc.)
5. **Retry Logic**: Exponential backoff for failed RPC calls

## Related Documentation

- `docs/BADGE_INTEGRATION.md`: Badge contract integration
- `server/services/eventIndexer.ts`: Event indexer implementation
- `server/services/badgeSync.ts`: Background sync worker

