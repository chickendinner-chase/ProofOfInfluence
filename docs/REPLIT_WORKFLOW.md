# Replit AI Workflow Guide

Deployment and testing workflow for Replit AI.

## Role: Deployment & Operations Specialist

### Core Responsibilities

- ✅ **Secrets Management**: Securely store all private keys and API keys
- ✅ **Application Deployment**: Deploy frontend and backend to production
- ✅ **Contract Deployment**: Deploy smart contracts to blockchain networks
- ✅ **Testing & Verification**: Run integration tests and verify deployments
- ✅ **Environment Management**: Configure environments for different networks
- ❌ **Code Development**: Do NOT write business logic or application code

---

## Git Workflow

### Branch to Deploy

| Branch | Environment | Purpose |
|--------|-------------|---------|
| `main` | **Production** | Stable, tested, ready for users |
| `dev` | **Testing/Staging** | Active development, integration testing |

### Deployment Trigger

**When to deploy:**
1. New code pushed to `main` → Deploy to production
2. Code pushed to `dev` → Deploy to staging for testing
3. Manual request from development team

**How to deploy:**

```bash
# 1. Replit automatically detects push
# 2. Or manually trigger in Replit:
#    - Click "Run" button
#    - Or use Shell: npm run build && npm start
```

---

## Secrets Configuration

### Required Secrets in Replit

All sensitive data must be stored in **Replit Secrets** (🔒 icon):

#### Database
```
DATABASE_URL=postgresql://user:pass@host/dbname
```

#### Authentication
```
SESSION_SECRET=random_session_secret_here
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

#### Payment (Stripe)
```
STRIPE_SECRET_KEY=sk_test_xxx  # or sk_live_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx  # or pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx  # optional but recommended
```

#### Application
```
BASE_URL=https://your-repl-name.replit.app
```

#### Blockchain (for contract deployment)
```
PRIVATE_KEY=0x...your_deployment_wallet_private_key
NETWORK=sepolia  # or base-sepolia, mainnet, base, etc
POI_TOKEN_ADDRESS=0x...  # filled after deployment
UNISWAP_PAIR_ADDRESS=0x...  # filled after liquidity added
```

#### Optional RPC URLs
```
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
```

### Never Commit Secrets

- ❌ Never put secrets in code files
- ❌ Never commit `.env` files
- ✅ Always use Replit Secrets
- ✅ Reference via `process.env.SECRET_NAME`

---

## Deployment Procedures

### Web2 Application Deployment

When new code is pushed to `main` or `dev`:

```bash
# Automatic (Replit watches repo)
# - Replit detects push
# - Runs: npm install
# - Runs: npm run build
# - Runs: npm start
# - Application live

# Manual deployment
# 1. Pull latest code
git pull origin main  # or dev

# 2. Install dependencies
npm install

# 3. Build application
npm run build

# 4. Start server
npm start

# 5. Verify deployment
# - Check https://your-repl.replit.app
# - Test key features
# - Monitor logs for errors
```

### Web3 Contract Deployment

When Codex pushes new contracts or deployment scripts:

```bash
# 1. Pull latest code
git pull origin dev

# 2. Compile contracts
npm run compile

# 3. Run tests locally
npx hardhat test

# 4. Deploy to testnet first
npx hardhat run scripts/deploy-token.ts --network base-sepolia

# 5. Verify deployment
# - Check contract on block explorer
# - Test contract functions
# - Record contract address

# 6. Update Replit Secrets
# Add POI_TOKEN_ADDRESS=0x... to Secrets

# 7. Deploy frontend/backend to use new contract
npm run build
npm start

# 8. Integration testing
# - Test frontend contract interaction
# - Verify wallet connections
# - Test transactions

# 9. If stable, deploy to mainnet
npx hardhat run scripts/deploy-token.ts --network base
```

### Database Migrations

When schema changes are pushed:

```bash
# 1. Pull latest code with schema changes
git pull origin dev

# 2. Push schema to database
npm run db:push

# 3. Verify migration
# - Check database tables
# - Test API endpoints
# - Verify data integrity

# 4. Restart application
npm start
```

---

## Testing Checklist

### After Web2 Deployment

- [ ] Homepage loads correctly
- [ ] User authentication works (Replit Auth + MetaMask)
- [ ] Dashboard displays user data
- [ ] API endpoints respond correctly
- [ ] Database queries work
- [ ] Stripe payment flow functional
- [ ] No console errors

### After Web3 Deployment

- [ ] Contract deployed to correct network
- [ ] Contract address recorded in Secrets
- [ ] Contract verified on block explorer
- [ ] Frontend can read from contract
- [ ] Wallet can interact with contract
- [ ] Transactions execute successfully
- [ ] Gas estimates reasonable

### Integration Testing

- [ ] Frontend connects to correct contract address
- [ ] User can connect wallet
- [ ] Trading functions work (DEX + CEX)
- [ ] Payment processing completes
- [ ] Data persists to database
- [ ] All features accessible

---

## Monitoring & Logging

### Application Logs

Monitor Replit console for:
- Server startup messages
- API request logs
- Error messages
- Database connection status

### Blockchain Logs

Check block explorers:
- **Sepolia**: https://sepolia.etherscan.io/
- **Base**: https://basescan.org/
- **Base Sepolia**: https://sepolia.basescan.org/

Monitor for:
- Transaction success/failure
- Contract event emissions
- Gas usage
- Token transfers

### Error Response

When errors occur:

1. **Capture error details**:
   - Error message
   - Stack trace
   - Timestamp
   - Affected feature

2. **Identify owner**:
   - Contract error → Report to Codex
   - Application error → Report to Cursor
   - Infrastructure error → Handle in Replit

3. **Report via Issue**:
   ```
   Title: [Deployment] Error deploying to Base testnet
   
   Error: Contract initialization failed
   Network: Base Sepolia
   Timestamp: 2025-11-11 10:30 UTC
   
   @Codex please investigate contract initialization
   ```

4. **Wait for fix**:
   - Codex/Cursor pushes fix
   - Pull and redeploy
   - Verify issue resolved

---

## Environment Management

### Development Environment (dev branch)

- Deploy to: Staging URL or test subdomain
- Database: Development database instance
- Networks: Testnets only (Sepolia, Base Sepolia)
- Secrets: Test API keys, test private keys

### Production Environment (main branch)

- Deploy to: Primary Replit URL
- Database: Production database
- Networks: Mainnets (Ethereum, Base)
- Secrets: Production API keys, secure private keys

### Switching Environments

When deploying different branches, verify:

```bash
# Check current branch
git branch --show-current

# Ensure correct Secrets loaded
echo $DATABASE_URL  # Should match environment
echo $NETWORK  # Should be correct network
```

---

## Deployment Rollback

If deployment causes issues:

```bash
# 1. Revert to previous version
git checkout main
git revert HEAD  # or specific commit
git push origin main

# 2. Or roll back to previous tag
git checkout v2.0  # previous stable version
# Deploy this version

# 3. Or restore from backup
# Use Neon database backup if needed
```

---

## Communication Protocol

### Receive Development Handoff

When Cursor/Codex notifies "code ready for deployment":

```
1. Pull latest code: git pull origin dev
2. Check commit messages for changes
3. Identify deployment type:
   - Contract changes? → Deploy contracts first
   - Frontend changes? → Build and deploy app
   - Backend changes? → Restart server
   - Database changes? → Run migrations
4. Execute deployment procedure
5. Run testing checklist
6. Report results back
```

### Report Deployment Results

**Success:**
```
Deployment successful ✅

Branch: dev
Environment: Staging
URL: https://staging.replit.app
Contract (if deployed): 0x...
Timestamp: 2025-11-11 10:30 UTC

All tests passing.
```

**Failure:**
```
Deployment failed ❌

Branch: dev
Error: [error message]
Component: [frontend/backend/contract]

@Cursor / @Codex please investigate.
```

---

## Maintenance Tasks

### Regular Maintenance

**Daily:**
- Monitor application logs for errors
- Check database performance
- Verify API endpoints responsive

**Weekly:**
- Review and clean deployment logs
- Check storage usage
- Update dependencies if needed (coordinate with Cursor)

**Monthly:**
- Database backup verification
- Security audit
- Performance optimization review

### Cleanup

**After PR Merge:**
- Delete merged feature branches
- Clean up temporary deployment files
- Remove debug configurations

---

## Security Guidelines

### Secrets Handling

- ✅ Store ALL secrets in Replit Secrets
- ✅ Use environment variables to access
- ✅ Never log secret values
- ✅ Rotate keys periodically
- ❌ Never commit secrets to Git
- ❌ Never share secrets in chat/email

### Deployment Security

- ✅ Always test on testnet first
- ✅ Verify contract addresses before deployment
- ✅ Use minimal permissions for deployment keys
- ✅ Enable 2FA on Replit account
- ❌ Never deploy unreviewed code to mainnet
- ❌ Never use production keys for testing

---

## Quick Reference

### Common Commands

```bash
# Pull latest code
git pull origin dev

# Deploy application
npm run build && npm start

# Deploy contract (testnet)
npx hardhat run scripts/deploy-token.ts --network sepolia

# Run migrations
npm run db:push

# Check logs
# Use Replit console or: npm run logs

# Restart server
# Click Stop → Run in Replit UI
```

### Important URLs

- **Replit Project**: https://replit.com/@youruser/ProofOfInfluence
- **GitHub Repo**: https://github.com/acee-chase/ProofOfInfluence
- **Production App**: https://your-repl.replit.app
- **Staging/Dev**: https://dev.your-repl.replit.app (if configured)

---

## Support

For deployment issues:
1. Check deployment logs
2. Review error messages
3. Consult docs/SETUP.md
4. Report to appropriate AI (Codex/Cursor)
5. Create GitHub Issue if needed

---

**Replit AI: Deploy, Test, Monitor, Report**

Focus on: Reliable Deployments  
Don't modify: Business Logic Code  
Communicate: Through Issues and Commit Comments

