# Immortality Staking – Operations Plan

## Overview
- Pool: Single-token staking using `StakingRewards` (staking=POI, rewards=POI).
- Period: 30 days per epoch (linear emission). Adjustable between epochs.
- Control: Treasury injects rewards each epoch via `notifyRewardAmount`.

## Targets
- APY bands by TVL (guidance, not hard-coded):
  - TVL ≤ 50M POI → target ~10% (cap 12%)
  - 50–150M POI → target ~7% (band 6–9%)
  - TVL ≥ 150M POI → target ~5% (floor 4%)
- Year-1 staking inflation cap ≤ 6% of 1B POI = 60M POI.

## Year-1 Monthly Budget (12 epochs, 30 days each)
- Q1: 7.5M, 7.5M, 6.0M
- Q2: 5.0M, 5.0M, 5.0M
- Q3: 4.5M, 4.5M, 4.5M
- Q4: 3.5M, 3.5M, 3.5M
- Total: 60M POI (upper bound; actual per-epoch adjusted by TVL and observed APY)

## Epoch Funding Formula
Recommended per-epoch reward:
```
reward = target_APY_segment × forecast_TVL × (epoch_days / 365)
```
Then clamp to:
- Lower bound: max(1,000,000 POI, 80% of scheduled month budget)
- Upper bound: min(120% of scheduled month budget, remaining annual budget)

Deviation handling:
- If last epoch APY > band high → next epoch reward ↓ by 50% of the overshoot ratio.
- If last epoch APY < band low  → next epoch reward ↑ by 50% of the shortfall ratio.

## Execution Runbook
1) Deployment
   - Deploy `StakingRewards(stakingToken=POI, rewardsToken=POI, owner=Treasury)`.
   - Record: `STAKING_REWARDS_ADDRESS` in `.env`.

2) Start Epoch (every ~30 days)
   - Compute recommended reward using the formula.
   - Ensure Treasury holds enough POI.
   - Call `notifyRewardAmount(reward)` from Treasury:
     - This transfers `reward` POI into the pool and sets the new `rewardRate` for 30 days.

3) Monitor
   - Record TVL (total staked), actual APY, unique stakers, top holders.
   - Check that emissions are within band; plan next epoch’s clamp.

4) End/Emergency
   - Wait until `periodFinish`. Adjust `rewardsDuration` if needed.
   - For emergencies (market/policy) skip next `notifyRewardAmount` or set a smaller figure.

## Notes
- Buyback & Burn: Use protocol revenue to repurchase & burn POI to offset emission if desired (outside staking contract).
- Multi-pool / Lock boosts: Future extension (separate pools or weighting layer).


