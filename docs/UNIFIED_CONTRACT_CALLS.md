# Unified Contract Calls

## Overview

The unified contract call system provides a single, consistent interface for executing smart contract actions in both **user-wallet** mode (direct wallet signing) and **agentkit** mode (backend-controlled execution via Coinbase AgentKit).

## Architecture

```
┌─────────────────┐
│   Frontend      │
│  Component      │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│  useContractAction Hook     │
│  (client/src/hooks/)        │
└────────┬────────────────────┘
         │
         ├─► user-wallet mode ─────► MetaMask/WalletConnect
         │                           (User signs tx)
         │
         ├─► agentkit mode ──────────► Backend API
         │                             │
         ▼                             ▼
┌──────────────────────────────────────────────┐
│  POST /api/contracts/:contract/:action       │
│  (server/routes.ts)                          │
└────────┬─────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────┐
│  ContractService                             │
│  (server/services/contracts.ts)              │
└────────┬─────────────────────────────────────┘
         │
         ├─► prepareTransaction() ──► Return tx data
         │
         └─► executeViaAgentKit() ──► Dispatch to helpers
                      │
                      ├─► badge.ts (ImmortalityBadge)
                      ├─► tge.ts (TGESale)
                      └─► staking.ts (StakingRewards)
```

## Usage

### Frontend: Using the Unified Hook

#### Basic Usage

```typescript
import { useContractAction } from "@/hooks/useContractAction";

function MyComponent() {
  const mintBadge = useContractAction({
    contract: "ImmortalityBadge",
    action: "mintBadge",
    mode: "agentkit", // or "user-wallet"
  });

  const handleMint = () => {
    mintBadge.execute({
      args: {},
      mode: "agentkit", // Can override default mode
    });
  };

  return (
    <button onClick={handleMint} disabled={mintBadge.isPending}>
      {mintBadge.isPending ? "Minting..." : "Mint Badge"}
    </button>
  );
}
```

#### Specialized Hooks

```typescript
import { 
  useMintBadge, 
  useTgePurchase, 
  useStakePoi, 
  useUnstakePoi, 
  useClaimReward 
} from "@/hooks/useContractAction";

function ImmortalityPage() {
  const mintBadge = useMintBadge({
    onSuccess: (data) => {
      console.log("Badge minted:", data.txHash);
    },
  });

  const stakePoi = useStakePoi();
  const unstakePoi = useUnstakePoi();
  const claimReward = useClaimReward();

  return (
    <div>
      <button onClick={() => mintBadge.execute({ args: {} })}>
        Mint Badge
      </button>
      
      <button onClick={() => stakePoi.execute({ args: { amount: "1000000000000000000" } })}>
        Stake 1 POI
      </button>
      
      <button onClick={() => claimReward.execute({ args: {} })}>
        Claim Rewards
      </button>
    </div>
  );
}
```

### Backend: Direct Service Usage

```typescript
import { contractService } from "./services/contracts";

// Prepare transaction for user wallet
const txData = await contractService.prepareTransaction(
  "ImmortalityBadge",
  "mintBadge",
  [userAddress, 1]
);

// Execute via AgentKit
const result = await contractService.executeViaAgentKit(
  "StakingRewards",
  "stake",
  { amount: "1000000000000000000" },
  userWalletAddress
);
```

## API Endpoint

### `POST /api/contracts/:contract/:action`

Execute a smart contract action.

**Parameters:**
- `contract` (path): Contract name (`ImmortalityBadge`, `TGESale`, `StakingRewards`)
- `action` (path): Function name (`mintBadge`, `purchase`, `stake`, etc.)

**Request Body:**
```json
{
  "mode": "agentkit",  // or "user-wallet"
  "args": {
    "amount": "1000000000000000000",
    "proof": []
  }
}
```

**Response (agentkit mode):**
```json
{
  "actionId": "uuid-here",
  "status": "success",
  "mode": "agentkit",
  "txHash": "0x123...",
  "amount": "1000000000000000000"
}
```

**Response (user-wallet mode):**
```json
{
  "status": "prepared",
  "mode": "user-wallet",
  "to": "0xContractAddress",
  "data": "0xEncodedData",
  "value": "0"
}
```

## Modes

### AgentKit Mode

**When to use:**
- AI-driven interactions (chatbot commands)
- Automated operations
- Backend-controlled transactions
- Gasless transactions for users

**How it works:**
1. Backend receives request
2. Creates `agentkit_actions` record (status: `pending`)
3. Executes transaction via CDP wallet
4. Updates record with `txHash` or `errorMessage`
5. Returns result to frontend

**Benefits:**
- No user wallet required
- No gas fees for users
- Automated execution
- Full audit trail

### User-Wallet Mode

**When to use:**
- User wants direct control
- Maximum decentralization
- User pays own gas
- User wallet signature required

**How it works:**
1. Frontend requests transaction data from backend
2. Backend encodes function call and returns tx data
3. Frontend signs and broadcasts via user's wallet (MetaMask)
4. Frontend waits for confirmation

**Benefits:**
- User controls private keys
- No backend wallet risk
- True decentralization
- User verifies tx before signing

## Supported Contracts

### ImmortalityBadge

```typescript
// Mint badge (agentkit mode only)
const mintBadge = useMintBadge();
mintBadge.execute({ args: {} });
```

**Backend Helper:** `server/agentkit/badge.ts`
- `mintTestBadge(to: string)` → Mints badge type 1

### TGESale

```typescript
// Purchase POI tokens
const purchase = useTgePurchase();
purchase.execute({ 
  args: { 
    usdcAmount: "1000000", // 1 USDC (6 decimals)
    proof: [] 
  } 
});
```

**Backend Helper:** `server/agentkit/tge.ts`
- `buyWithBaseToken(usdcAmount, proof)` → Purchase POI
- `isSaleActive()` → Check if sale is active
- `getMaxContribution(user)` → Get user's max contribution

### StakingRewards

```typescript
// Stake POI
const stake = useStakePoi();
stake.execute({ args: { amount: "1000000000000000000" } }); // 1 POI

// Unstake POI
const unstake = useUnstakePoi();
unstake.execute({ args: { amount: "500000000000000000" } }); // 0.5 POI

// Claim rewards
const claim = useClaimReward();
claim.execute({ args: {} });
```

**Backend Helper:** `server/agentkit/staking.ts`
- `stakePoi(amount, userAddress)` → Stake tokens
- `unstakePoi(amount, userAddress)` → Withdraw tokens
- `claimReward(userAddress)` → Claim staking rewards
- `getStakedBalance(userAddress)` → Query staked amount
- `getEarnedRewards(userAddress)` → Query pending rewards

## Telemetry & Audit

All AgentKit actions are logged in the `agentkit_actions` table:

```typescript
{
  id: "uuid",
  userId: "user-id",
  actionType: "STAKINGEREWARDS_STAKE",
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

## Error Handling

### Frontend

```typescript
const action = useContractAction({
  contract: "StakingRewards",
  action: "stake",
  onError: (error) => {
    console.error("Action failed:", error.message);
  },
});

// Check status
if (action.isError) {
  console.log("Error:", action.error);
}
```

### Backend

Errors are automatically caught and:
1. Update `agentkit_actions` record with `errorMessage`
2. Return HTTP 500 with error details
3. Log to console

## Migration Guide

### From Direct Wagmi to Unified Hook

**Before:**
```typescript
const { writeContractAsync } = useWriteContract();

const handleStake = async () => {
  const hash = await writeContractAsync({
    address: STAKING_ADDRESS,
    abi: STAKING_ABI,
    functionName: "stake",
    args: [amount],
  });
};
```

**After:**
```typescript
const stake = useStakePoi();

const handleStake = () => {
  stake.execute({ 
    args: { amount },
    mode: "user-wallet" // Use user's wallet
  });
};
```

### From Direct API Call to Unified Hook

**Before:**
```typescript
const handleMint = async () => {
  const res = await fetch("/api/immortality/actions/mint-test-badge", {
    method: "POST",
  });
  const data = await res.json();
};
```

**After:**
```typescript
const mintBadge = useMintBadge();

const handleMint = () => {
  mintBadge.execute({ args: {} });
};
```

## Adding New Contracts

1. **Add contract config** to `server/services/contracts.ts`:
   ```typescript
   CONTRACT_CONFIGS["NewContract"] = {
     address: newContractConfig.address,
     abi: newContractConfig.abi,
     name: "NewContract",
   };
   ```

2. **Create helper** in `server/agentkit/newContract.ts`:
   ```typescript
   export async function executeNewAction(args: any): Promise<{ txHash: string }> {
     const { walletProvider } = await getAgentKitContext();
     // Encode and execute transaction
     return { txHash };
   }
   ```

3. **Add case** to `ContractService.executeViaAgentKit()`:
   ```typescript
   case "NewContract":
     return await this.executeNewContractAction(action, args, userWallet);
   ```

4. **Create specialized hook** in `client/src/hooks/useContractAction.ts`:
   ```typescript
   export function useNewContractAction(options?: { onSuccess?: (data: any) => void }) {
     return useContractAction({
       contract: "NewContract",
       action: "actionName",
       mode: "agentkit",
       ...options,
     });
   }
   ```

## Security Considerations

### AgentKit Mode
- ✅ Backend controls CDP wallet keys (stored securely)
- ✅ User must be authenticated
- ✅ User must have linked wallet address
- ✅ All actions logged for audit
- ⚠️ Backend executes on behalf of user

### User-Wallet Mode
- ✅ User controls private keys
- ✅ User reviews tx before signing
- ✅ No backend wallet risk
- ⚠️ User pays gas fees
- ⚠️ Requires wallet connection

## Testing

### Functional Validation (no coverage target)

- Provide minimal runnable scripts to exercise key flows against Base Sepolia:
  - TGESale: purchase with/without whitelist proof (expect success/failure)
  - StakingRewards: stake → getReward → withdraw
  - Badges: mint by MINTER and check tokenURI/SBT rule if enabled
  - Airdrop: claim once only, invalid proof rejected
  - Allowlist: verify/consume
  - POI: mint/burn/pause (if provided)

Example (pseudo):
```ts
// scripts/verify-flows.ts
// 1) Call /api/contracts/TGESale/purchase (agentkit) with usdcAmount, expect txHash
// 2) Call /api/contracts/StakingRewards/stake with amount
// 3) Call /api/contracts/ImmortalityBadge/mintBadge (agentkit)
```

## Troubleshooting

### "Contract not deployed"
- Check `shared/contracts/*.json` has valid address
- Ensure contract is deployed to current network

### "User wallet required"
- User must link wallet in profile settings
- Check `/api/auth/user` returns `walletAddress`

### "AgentKit execution failed"
- Check CDP API keys in environment
- Verify contract function signature matches ABI
- Check Replit Secrets for `CDP_API_KEY_NAME` and `CDP_API_KEY_PRIVATE_KEY`

## See Also

- [AgentKit Actions Contract Mapping](./agentkit/ACTIONS_CONTRACT_MAPPING.md)
- [Replit Workflow](./REPLIT_WORKFLOW.md)
- [Local Development](./LOCAL_DEVELOPMENT.md)

