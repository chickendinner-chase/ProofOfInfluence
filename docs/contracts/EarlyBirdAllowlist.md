# EarlyBirdAllowlist

## Overview
- Standalone Merkle-based allowlist usable by external contracts.
- Simple membership check returning a boolean.

## Key Functions
- `isEligible(address account, bytes32[] proof)` – verifies membership.
- `setMerkleRoot(bytes32 root)` – owner updates the Merkle root.

## Deployment Notes
- Constructor argument: `owner`.
- Merkle leaves hash the account address (double-hash pattern to match solidity implementation).
