# MerkleAirdropDistributor

## Overview
- Distributes POI tokens using Merkle proofs.
- Supports multiple rounds with configurable time windows and optional single-claim enforcement.
- Claiming can be paused in emergencies.

## Key Functions
- `configureRound(uint256 roundId, bytes32 root, uint64 start, uint64 end, bool allowMultiple)` – owner defines rounds.
- `activateRound(uint256 roundId)` – selects the active round.
- `claim(uint256 index, address account, uint256 amount, bytes32[] proof)` – validates and transfers tokens.
- `withdrawRemaining(address to, uint256 amount)` – recover unused allocations.
- `pause()` / `unpause()` – emergency controls.

## Deployment Notes
- Constructor arguments: `tokenAddress`, `owner`.
- Merkle leaves use double hashing of `(index, account, amount)` consistent with OpenZeppelin examples.
