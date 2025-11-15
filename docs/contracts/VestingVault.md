# VestingVault

## Overview
- Holds POI allocations for multiple beneficiaries.
- Supports cliff and linear vesting periods per beneficiary.
- Beneficiaries withdraw vested tokens on demand.

## Key Functions
- `addBeneficiary(address beneficiary, uint256 amount, uint256 cliff, uint256 duration)` – owner configures schedule.
- `vestedAmount(address beneficiary)` – total vested (including already withdrawn amounts).
- `withdraw()` – beneficiary pulls available tokens.

## Deployment Notes
- Constructor arguments: `tokenAddress`, `owner`.
- Vault must be funded with sufficient POI tokens prior to withdrawals.
