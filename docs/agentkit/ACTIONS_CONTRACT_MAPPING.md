# AgentKit Action → Contract Mapping

## Overview

This document maps AgentKit actions to their corresponding smart contract functions. All actions are executed via the **Unified Contract Call System** (`POST /api/contracts/:contract/:action`).

For detailed usage instructions, see [Unified Contract Calls](../UNIFIED_CONTRACT_CALLS.md).

## Action Mappings

| Agent Action Key | Contract | Function Signature | Unified API Path | Helper Function |
| ---------------- | -------- | ------------------ | ---------------- | --------------- |
| `IMMORTALITYBADGE_MINTBADGE` | `ImmortalityBadge` | `mintBadge(address to, uint256 badgeType)` | `POST /api/contracts/ImmortalityBadge/mintBadge` | `server/agentkit/badge.ts::mintTestBadge()` |
| `TGESALE_PURCHASE` | `TGESale` | `buyWithBaseToken(uint256 usdcAmount, bytes32[] proof)` | `POST /api/contracts/TGESale/purchase` | `server/agentkit/tge.ts::buyWithBaseToken()` |
| `STAKINGREWARDS_STAKE` | `StakingRewards` | `stake(uint256 amount)` | `POST /api/contracts/StakingRewards/stake` | `server/agentkit/staking.ts::stakePoi()` |
| `STAKINGREWARDS_UNSTAKE` | `StakingRewards` | `withdraw(uint256 amount)` | `POST /api/contracts/StakingRewards/unstake` | `server/agentkit/staking.ts::unstakePoi()` |
| `STAKINGREWARDS_CLAIMREWARD` | `StakingRewards` | `getReward()` | `POST /api/contracts/StakingRewards/claimReward` | `server/agentkit/staking.ts::claimReward()` |

## Execution Flow

```
User Request (Frontend/Chatbot)
    ↓
POST /api/contracts/:contract/:action
    ↓
ContractService.call(contract, action, args, { mode: "agentkit" })
    ↓
ContractService.executeViaAgentKit()
    ↓
Route to specific helper (badge/tge/staking)
    ↓
Helper encodes function call using ethers.js
    ↓
CdpWalletProvider.sendTransaction()
    ↓
Wait for transaction receipt
    ↓
Update agentkit_actions record
    ↓
Return txHash to client
```

## Action Details

### ImmortalityBadge: Mint Badge

**Action Type:** `IMMORTALITYBADGE_MINTBADGE`

**Contract Function:**
```solidity
function mintBadge(address to, uint256 badgeType) external onlyRole(MINTER_ROLE) returns (uint256 tokenId)
```

**Parameters:**
- `to`: User's wallet address (from linked profile)
- `badgeType`: Fixed to `1` (Test Badge)

**Backend Logic:**
1. Verify user has linked wallet
2. Check badge type 1 is enabled in contract
3. Call `mintBadge(userWallet, 1)` via AgentKit
4. Record transaction in `agentkit_actions`

**Frontend Hook:**
```typescript
import { useMintBadge } from "@/hooks/useContractAction";

const mintBadge = useMintBadge();
mintBadge.execute({ args: {} });
```

**API Request:**
```json
POST /api/contracts/ImmortalityBadge/mintBadge
{
  "mode": "agentkit",
  "args": {}
}
```

---

### TGESale: Purchase POI

**Action Type:** `TGESALE_PURCHASE`

**Contract Function:**
```solidity
function buyWithBaseToken(uint256 usdcAmount, bytes32[] calldata proof) external
```

**Parameters:**
- `usdcAmount`: Amount of USDC to spend (in wei, 6 decimals)
- `proof`: Merkle proof for whitelist (empty array for public sale)

**Backend Logic:**
1. Verify user has linked wallet
2. Validate `isSaleActive()` returns true
3. Check user hasn't exceeded `maxContribution(user)`
4. Approve USDC spending (if needed)
5. Call `buyWithBaseToken(amount, proof)` via AgentKit
6. Record transaction and purchased amount

**Frontend Hook:**
```typescript
import { useTgePurchase } from "@/hooks/useContractAction";

const purchase = useTgePurchase();
purchase.execute({ 
  args: { 
    usdcAmount: "1000000", // 1 USDC
    proof: [] 
  } 
});
```

**API Request:**
```json
POST /api/contracts/TGESale/purchase
{
  "mode": "agentkit",
  "args": {
    "usdcAmount": "1000000",
    "proof": []
  }
}
```

---

### StakingRewards: Stake POI

**Action Type:** `STAKINGREWARDS_STAKE`

**Contract Function:**
```solidity
function stake(uint256 amount) external
```

**Parameters:**
- `amount`: Amount of POI to stake (in wei, 18 decimals)

**Backend Logic:**
1. Verify user has linked wallet
2. Check user's POI balance
3. Approve POI spending for staking contract
4. Call `stake(amount)` via AgentKit
5. Record transaction and staked amount

**Frontend Hook:**
```typescript
import { useStakePoi } from "@/hooks/useContractAction";

const stake = useStakePoi();
stake.execute({ 
  args: { 
    amount: "1000000000000000000" // 1 POI
  } 
});
```

**API Request:**
```json
POST /api/contracts/StakingRewards/stake
{
  "mode": "agentkit",
  "args": {
    "amount": "1000000000000000000"
  }
}
```

---

### StakingRewards: Unstake POI

**Action Type:** `STAKINGREWARDS_UNSTAKE`

**Contract Function:**
```solidity
function withdraw(uint256 amount) external
```

**Parameters:**
- `amount`: Amount of POI to withdraw (in wei, 18 decimals)

**Backend Logic:**
1. Verify user has linked wallet
2. Check user's staked balance
3. Validate withdrawal amount ≤ staked amount
4. Call `withdraw(amount)` via AgentKit
5. Record transaction and withdrawn amount

**Frontend Hook:**
```typescript
import { useUnstakePoi } from "@/hooks/useContractAction";

const unstake = useUnstakePoi();
unstake.execute({ 
  args: { 
    amount: "500000000000000000" // 0.5 POI
  } 
});
```

**API Request:**
```json
POST /api/contracts/StakingRewards/unstake
{
  "mode": "agentkit",
  "args": {
    "amount": "500000000000000000"
  }
}
```

---

### StakingRewards: Claim Rewards

**Action Type:** `STAKINGREWARDS_CLAIMREWARD`

**Contract Function:**
```solidity
function getReward() external
```

**Parameters:** None

**Backend Logic:**
1. Verify user has linked wallet
2. Check `earned(user)` to verify rewards available
3. Call `getReward()` via AgentKit
4. Record transaction and claimed reward amount

**Frontend Hook:**
```typescript
import { useClaimReward } from "@/hooks/useContractAction";

const claim = useClaimReward();
claim.execute({ args: {} });
```

**API Request:**
```json
POST /api/contracts/StakingRewards/claimReward
{
  "mode": "agentkit",
  "args": {}
}
```

---

## Telemetry

All AgentKit actions are logged in the `agentkit_actions` table with the following structure:

```typescript
{
  id: "uuid",
  userId: "user-id",
  actionType: "STAKINGREWARDS_STAKE", // Generated from contract + action
  status: "success" | "failed" | "pending",
  txHash: "0x123...",
  errorMessage: "Error details if failed",
  requestPayload: { amount: "1000000000000000000" },
  metadata: {
    contract: "StakingRewards",
    action: "stake",
    network: "base-sepolia"
  },
  createdAt: "2025-01-01T00:00:00Z",
  updatedAt: "2025-01-01T00:00:05Z"
}
```

## Implementation Files

### Backend
- **Service Layer:** `server/services/contracts.ts` - Main orchestration
- **Badge Helper:** `server/agentkit/badge.ts` - ImmortalityBadge actions
- **TGE Helper:** `server/agentkit/tge.ts` - TGESale actions
- **Staking Helper:** `server/agentkit/staking.ts` - StakingRewards actions
- **AgentKit Client:** `server/agentkit/agentkitClient.ts` - CDP wallet initialization
- **Routes:** `server/routes.ts` - Unified API endpoint

### Frontend
- **Unified Hook:** `client/src/hooks/useContractAction.ts` - Main hook and specialized exports
- **Usage:** `client/src/pages/Immortality.tsx` - Badge minting example

### Contracts & ABIs
- **Artifacts:** `shared/contracts/*.json` - ABI and address metadata
- **Contracts:** `contracts/*.sol` - Solidity source code

## Notes

- **All calls** are executed via the Coinbase AgentKit CDP wallet
- **Each action** writes a `pending` record to `agentkit_actions` and updates to `success`/`failed` when settled
- **ABI + address** metadata live in `shared/contracts/*.json`
- **Network:** Currently configured for Base Sepolia testnet (`AGENTKIT_DEFAULT_CHAIN`)
- **Mode:** Supports both `agentkit` (backend execution) and `user-wallet` (direct wallet signing)

## Delivery & Validation (for Codex)

- Deliverables:
  - Contracts in `contracts/*.sol` with OZ v5
  - Deployment scripts `scripts/deploy-*.ts`
  - ABI + address files under `shared/contracts/*.json`
  - Minimal runnable scripts to exercise key flows on Base Sepolia
- Functional validation (no coverage target):
  - TGESale: `buyWithBaseToken` succeeds with valid `proof` and respects caps/window
  - StakingRewards: `stake/withdraw/getReward` work with POI approvals
  - ImmortalityBadge/AchievementBadges: mint flow by MINTER emits events and resolves `tokenURI`
  - MerkleAirdropDistributor: `claim` once only; invalid proof rejected
  - EarlyBirdAllowlist: `verify/consume` behavior correct
  - ReferralRegistry: register once, anti-self, emits events
  - POI: `mint/burn/pause` (if provided) behave as designed

## See Also

- [Unified Contract Calls Documentation](../UNIFIED_CONTRACT_CALLS.md) - Detailed usage guide
- [Local Development](../LOCAL_DEVELOPMENT.md) - Testing contracts locally
- [Replit Workflow](../REPLIT_WORKFLOW.md) - Deployment process
