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

## Claim Process

**Important**: Airdrop claims are executed via **direct user-wallet contract calls** using Merkle proofs. The backend's role is limited to eligibility checking and proof generation via `GET /api/airdrop/check`. 

The frontend `AirdropCard` component uses the `useAirdrop` hook to call the MerkleAirdropDistributor contract directly with the user's EOA (Externally Owned Account). This ensures:

- Users have full control over their claim transactions
- No backend intermediary is required for token transfers
- Claims are executed on-chain with proper Merkle proof verification
- The contract's `claimed` mapping prevents double-claiming

**Backend Responsibilities:**
- Eligibility checking: `GET /api/airdrop/check`
- Proof generation: Admin endpoints for creating eligibility records
- Read-only metadata: Any other read endpoints

**Frontend Responsibilities:**
- Fetch eligibility and proofs from backend
- Call `MerkleAirdropDistributor.claim()` or `claimFromRound()` directly
- Handle transaction signing and confirmation

## Merkle Proof Generation

The API now uses `merkletreejs` library for production-ready Merkle tree implementation.

### Merkle Tree Format

The MerkleAirdropDistributor contract uses double-hashed leaves:
```
leaf = keccak256(keccak256(abi.encode(index, account, amount)))
```

### Batch Creation Process

When using `POST /api/admin/airdrop/batch`:

1. **Build Tree**: Creates MerkleTree from all recipients using `merkletreejs`
2. **Generate Proofs**: Generates Merkle proof for each recipient
3. **Store Data**: Saves index and proof array to database for each eligibility
4. **Return Root**: Returns Merkle root for contract deployment

Example:
```typescript
// Backend automatically:
const { tree, root } = buildMerkleTreeFromEligibilities(recipients);
const proofs = generateProofsForBatch(tree, recipients);

// Stores in database:
{
  merkleIndex: 0,
  merkleProof: ["0x...", "0x..."], // Full proof path
  roundId: 0
}
```

### Proof Format

Each proof is an array of hex strings representing the Merkle proof path:
```json
{
  "proof": [
    "0x1234...",
    "0x5678...",
    "0x9abc..."
  ]
}
```

The proof is generated using `merkletreejs` which ensures compatibility with OpenZeppelin's `MerkleProof.verify()` used in the contract.

### Verification

The generated proofs are compatible with the contract's verification:
```solidity
bytes32 leaf = keccak256(bytes.concat(keccak256(abi.encode(index, account, amount))));
bool valid = MerkleProof.verify(merkleProof, root, leaf);
```

## Next Steps

For production:
1. ✅ Use `merkletreejs` library for proper Merkle proof generation (COMPLETED)
2. Add authentication/authorization for admin endpoints
3. Add rate limiting
4. Add caching for eligibility checks

