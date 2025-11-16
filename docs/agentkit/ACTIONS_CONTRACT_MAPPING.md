# AgentKit Action → Contract Mapping

| Agent Action Key | Contract | Function Signature | Parameter Source |
| ---------------- | -------- | ------------------ | ---------------- |
| `AGENT_ACTION_MINT_TEST_BADGE` | `ImmortalityBadge` | `mintBadge(address to, uint256 badgeType)` with `badgeType = 1` | Backend loads the user's linked wallet and enforces that badge type 1 is enabled before calling. |
| `AGENT_ACTION_TGE_BUY_MINIMAL` | `TGESale` | `buyWithBaseToken(uint256 usdcAmount, bytes32[] proof)` | Backend selects the USDC amount, constructs whitelist proofs (if required), and validates `isSaleActive()` plus `maxContribution(user)` before execution. |
| `AGENT_ACTION_STAKE_POI` | `StakingRewards` | `stake(uint256 amount)` | Backend ensures the user-specified amount is within limits, obtains approvals, and records the resulting tx hash. |
| `AGENT_ACTION_UNSTAKE_POI` | `StakingRewards` | `withdraw(uint256 amount)` | Backend validates available stake and executes the withdrawal. |
| `AGENT_ACTION_CLAIM_POI_REWARD` | `StakingRewards` | `getReward()` | Backend checks `earned(user)` to avoid spam and records the payout in `agentkit_actions` / ledger. |

## API Routes
The backend exposes authenticated endpoints that map 1:1 to the actions above:

| Endpoint | Description | Payload |
| -------- | ----------- | ------- |
| `POST /api/immortality/actions/mint-test-badge` | Triggers `mintBadge` on `ImmortalityBadge`. | _None_ |
| `POST /api/immortality/actions/tge-buy-minimal` | Executes the minimal allowed `buyWithBaseToken` contribution. | _None_ |
| `POST /api/immortality/actions/stake-poi` | Calls `stake(amount)` with the provided POI amount. | `{ "amountPoi": "123.45" }` |
| `POST /api/immortality/actions/unstake-poi` | Calls `withdraw(amount)` after verifying available stake. | `{ "amountPoi": "10" }` |
| `POST /api/immortality/actions/claim-poi-reward` | Requests `getReward()` if `earned(user) > 0`. | _None_ |

## Notes
- All calls must be executed via the Coinbase AgentKit wallet after Risk Guard approval.
- Each action writes a `pending` record to `agentkit_actions` and updates it to `success`/`failed` when the transaction settles.
- ABI + address metadata for the contracts above live under `shared/contracts/*.json` and should be used instead of hardcoding addresses.
