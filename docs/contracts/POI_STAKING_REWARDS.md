# POI StakingRewards

The `StakingRewards` contract is a single-token staking module inspired by Synthetix. Users stake POI to earn additional POI rewards over time.

## Network & Address
- **Target network:** Base Sepolia (`84532`)
- **Artifact:** `shared/contracts/staking_rewards.json`
- **Deployment script:** `scripts/deploy-staking.ts`

## Core Actions
- `stake(uint256 amount)` – transfer POI (the staking token) into the contract and start accruing rewards. Referenced by `AGENT_ACTION_STAKE_POI`.
- `withdraw(uint256 amount)` – remove staked POI. Reverts if withdrawing more than the staked balance. Referenced by `AGENT_ACTION_UNSTAKE_POI`.
- `getReward()` – harvest pending POI rewards that accrue in the same ERC-20 token. Referenced by `AGENT_ACTION_CLAIM_POI_REWARD`.
- `exit()` – convenience helper that withdraws the full stake and harvests rewards.

## Views
- `balanceOf(address account)` – current staked amount.
- `earned(address account)` – accrued but unpaid rewards.
- `totalSupply()` – aggregate staked POI.

## Events
- `Staked(address user, uint256 amount)`
- `Withdrawn(address user, uint256 amount)`
- `RewardPaid(address user, uint256 reward)`
- `RewardAdded(uint256 reward)` – emitted when admins call `notifyRewardAmount`.

## Reward Funding
Admins call `notifyRewardAmount(uint256 reward)` to push POI rewards into the contract and set the emission schedule (`rewardsDuration`, default 30 days).

## AgentKit Usage
Agent-facing actions should map to the following contract calls:
- `STAKE_POI` → `stake(amount)`
- `UNSTAKE_POI` → `withdraw(amount)`
- `CLAIM_POI_REWARD` → `getReward()`
Ensure every call logs to `agentkit_actions` and that the backend enforces per-user limits (min stake, cooldowns, etc.).
