# POI Token

## Overview
- ERC20 token with 18 decimals named **Proof Of Influence (POI)**.
- Supports [EIP-2612](https://eips.ethereum.org/EIPS/eip-2612) permits for gasless approvals.
- Role based access control with `DEFAULT_ADMIN_ROLE`, `MINTER_ROLE`, `PAUSER_ROLE`, and `OFFCHAIN_DISTRIBUTOR_ROLE`.
- Transfers are pausable.
- Minting restricted to accounts with the appropriate roles and burning supported via `ERC20Burnable`.

## Key Functions
- `mint(address account, uint256 amount)` – only callable by minters.
- `mintForOffchainDistribution(address account, uint256 amount)` – callable by accounts with the off-chain distributor role to settle fiat purchases.
- `pause()` / `unpause()` – toggles transferability.
- Standard ERC20 interface plus `permit` from `ERC20Permit`.

## Deployment Notes
- Constructor arguments: `admin`, `initialRecipient`, `initialSupply`.
- Grant roles to additional operators with `grantRole` after deployment.
- Assign `OFFCHAIN_DISTRIBUTOR_ROLE` to Stripe/ledger services that should mint POI upon fiat settlement.
