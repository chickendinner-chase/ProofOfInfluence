# Airdrop API Documentation

## Overview

The Airdrop API provides endpoints to check eligibility and manage airdrop distributions for the MerkleAirdropDistributor contract.

## Endpoints

### GET `/api/airdrop/check`

Check airdrop eligibility for a wallet address or user.

**Query Parameters:**
- `address` (optional): Wallet address to check (if not authenticated)

**Headers:**
- Authentication (optional): If authenticated, will use user's wallet address

**Response:**
```json
{
  "eligible": true,
  "amount": "1000000000000000000000", // Amount in wei (string)
  "index": 0, // Merkle tree index
  "proof": ["0x..."], // Array of Merkle proof hex strings
  "roundId": 0 // Airdrop round ID
}
```

**Example:**
```bash
curl "http://localhost:5000/api/airdrop/check?address=0x1234..."
```

### POST `/api/admin/airdrop/eligibility`

Create a single airdrop eligibility record (admin only).

**Request Body:**
```json
{
  "walletAddress": "0x1234...",
  "amount": 1000, // Amount in POI units (not wei)
  "userId": "optional-user-id",
  "merkleIndex": 0,
  "merkleProof": [],
  "roundId": 0
}
```

**Response:**
```json
{
  "id": 1,
  "walletAddress": "0x1234...",
  "amount": 1000,
  "eligible": true,
  "claimed": false,
  "merkleIndex": 0,
  "merkleProof": [],
  "roundId": 0
}
```

### POST `/api/admin/airdrop/batch`

Batch create airdrop eligibility records and generate Merkle root.

**Request Body:**
```json
{
  "recipients": [
    {
      "walletAddress": "0x1111...",
      "amount": 1000
    },
    {
      "walletAddress": "0x2222...",
      "amount": 2000
    }
  ],
  "roundId": 0
}
```

**Response:**
```json
{
  "created": 2,
  "root": "0x...", // Merkle root (use this for contract setRoot)
  "recipients": [
    {
      "walletAddress": "0x1111...",
      "amount": 1000,
      "index": 0
    }
  ]
}
```

## Database Schema

The `airdrop_eligibility` table includes:
- `walletAddress`: Wallet address (unique)
- `amount`: Amount in POI units (integer)
- `merkleIndex`: Index in Merkle tree
- `merkleProof`: JSONB array of proof hex strings
- `roundId`: Airdrop round ID
- `eligible`: Boolean eligibility flag
- `claimed`: Boolean claim status

## Testing

Run the test script:

```bash
node scripts/test-airdrop-api.js
```

Make sure the server is running first:

```bash
npm run dev
```

## Integration with Frontend

The frontend `AirdropCard` component uses `/api/airdrop/check` to:
1. Check if user is eligible
2. Get amount, index, and proof for claiming
3. Display eligibility status

The response format matches what the frontend expects:
- `amount` is returned as wei string for direct use with contracts
- `index` and `proof` are ready for MerkleAirdropDistributor.claim()

## Next Steps

For production:
1. Use `merkletreejs` library for proper Merkle proof generation
2. Add authentication/authorization for admin endpoints
3. Add rate limiting
4. Add caching for eligibility checks
5. Implement proper Merkle tree proof generation (currently simplified)

