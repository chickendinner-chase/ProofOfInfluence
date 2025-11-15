# TGESale

## Overview
- Handles primary sale of POI tokens in exchange for USDC.
- Supports tiered pricing with automatic advancement when a tier sells out.
- Whitelist can be toggled on/off; when enabled it enforces allocations via Merkle proofs.
- Owner-managed contribution bounds, sale window, blacklist, and pause controls.
- Raised USDC is withdrawable to a treasury account.
- `getSaleView` helper aggregates state for front-end integrations.

## Key Functions
- `configureTiers(uint256[] prices, uint256[] supplies)` – owner sets tier prices and allocations.
- `updateTier(uint256 tierId, uint256 price, uint256 remaining)` – adjust a configured tier in-place.
- `purchase(uint256 usdcAmount, bytes32[] proof)` – buyers acquire POI by providing USDC. When whitelist is enabled, the proof's final element encodes the USDC allocation cap.
- `setContributionBounds(uint256 min, uint256 max)` – min/max purchase amounts (0 disables bound).
- `setWhitelistConfig(bool enabled, bytes32 root)` – toggles whitelist mode and sets the Merkle root.
- `setSaleWindow(uint256 start, uint256 end)` – optional start/end timestamps (0 disables bound).
- `setPaused(bool status)` / `setBlacklist(address,bool)` – emergency controls.
- `withdraw()` / `withdrawPOI(uint256 amount)` – treasury withdrawals.
- `getSaleView(address user)` – returns `SaleView` struct with tier, pricing, bounds, and user contribution summary.

## Deployment Notes
- Constructor arguments: `poiToken`, `usdcToken`, `owner`, `treasury`.
- Tier price is denominated in 6-decimal USDC per 1 POI (18 decimals).
- Merkle proof array must append the user allocation as the last element when whitelist is active.
- Sale emits `Purchased(address buyer, uint8 tier, uint256 usdcAmount, uint256 poiAmount)` for analytics.
