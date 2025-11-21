# 阶段 0：ImmortalityBadgeV2 技术收尾

## 目标

确认 V2 在当前架构下真的可用，不再有 v1 残留。

完成标准：**现在所有叫 ImmortalityBadge 的调用，都是 V2，而且能成功 mint。**

---

## 步骤 1：链上角色确认（MINTER_ROLE → AgentKit 钱包）

### 1.1 获取 AgentKit 钱包地址

```bash
npm run get:agentkit-address
```

这将输出 AgentKit 钱包地址，将其添加到 `.env` 文件：

```env
CDP_WALLET_ADDRESS=0x...
```

### 1.2 配置角色

运行角色配置脚本：

```bash
npm run configure:badge-v2-roles
```

这个脚本会：
1. ✅ 检查当前角色配置
2. ✅ 确认部署者是否有 DEFAULT_ADMIN_ROLE
3. ✅ 授予 MINTER_ROLE 给 AgentKit 钱包（如果还没有）
4. ✅ 验证角色配置正确

**预期输出：**
```
🔧 ImmortalityBadgeV2 Role Configuration

📋 Configuration:
   Badge Contract: 0x05c317ACEeC1CBad5a8523D63170F18bb123ab32
   Deployer: 0x...
   AgentKit Wallet: 0x...

🔐 Role Status:
   Deployer has DEFAULT_ADMIN_ROLE: ✅ Yes
   MINTER_ROLE: 0x...
   AgentKit has MINTER_ROLE: ❌ No

🔨 Granting MINTER_ROLE to AgentKit wallet...
   Transaction: 0x...
✅ MINTER_ROLE granted successfully!

✅ Verification:
   AgentKit has MINTER_ROLE: ✅ Yes
   Contract paused: ✅ No
   Badge type 1 enabled: ✅ Yes

🎉 Role configuration complete!
```

### 1.3 手动检查（可选）

如果脚本失败，可以手动检查：

```bash
# 使用 Hardhat console
npx hardhat console --network base-sepolia

# 在 console 中
const badge = await ethers.getContractAt("ImmortalityBadgeV2", "0x05c317ACEeC1CBad5a8523D63170F18bb123ab32");
const MINTER_ROLE = await badge.MINTER_ROLE();
const agentKitAddress = "0x..."; // 你的 AgentKit 地址
const hasRole = await badge.hasRole(MINTER_ROLE, agentKitAddress);
console.log("Has MINTER_ROLE:", hasRole);

// 如果需要授予角色
const [deployer] = await ethers.getSigners();
const tx = await badge.connect(deployer).grantRole(MINTER_ROLE, agentKitAddress);
await tx.wait();
```

---

## 步骤 2：用 Playground 做一次 V2 铸造回归测试

### 2.1 通过脚本测试（推荐）

使用测试脚本进行完整回归测试：

```bash
npm run test:badge-v2-mint <测试地址>
```

**示例：**
```bash
npm run test:badge-v2-mint 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
```

**预期输出：**
```
🧪 Testing ImmortalityBadgeV2 Mint Functionality

📋 Test Configuration:
   Badge Contract: 0x05c317ACEeC1CBad5a8523D63170F18bb123ab32
   Test Recipient: 0x...

📊 Initial State:
   Balance: 0
   Has Minted: false
   Contract Paused: false
   Badge Type 1 Enabled: true
   Signer has MINTER_ROLE: ✅ Yes

🧪 Test 1: First Mint
   Calling mintBadge(0x..., 1)...
   Transaction: 0x...
   Waiting for confirmation...
   ✅ Mint successful! Block: 33925000
   Token ID: 1
   Explorer: https://sepolia.basescan.org/token/0x05c317ACEeC1CBad5a8523D63170F18bb123ab32?a=1
   New Balance: 1

🧪 Test 2: Second Mint (should fail)
   Calling mintBadge(0x..., 1) again...
   ✅ Expected error received: execution reverted: BadgeAlreadyClaimed(1, 0x...)

✅ Test complete!
```

### 2.2 通过前端 Playground 测试

1. **启动开发服务器**
   ```bash
   npm run dev
   ```

2. **访问 Playground 页面**
   - 打开 `http://localhost:5000/app/dev-contracts`
   - 连接钱包（MetaMask）

3. **使用 ImmortalityBadge Card**
   - 找到 "Immortality Badge" 卡片
   - 确认合约地址显示为：`0x05c317ACEeC1CBad5a8523D63170F18bb123ab32`（V2 地址）
   - 检查合约状态：
     - Contract paused: `false` ✅
     - Badge type 1 enabled: `true` ✅
     - AgentKit has MINTER_ROLE: `true` ✅

4. **执行第一次 Mint**
   - 点击 "Mint Badge" 按钮
   - 确认交易成功
   - 在区块浏览器查看交易：`https://sepolia.basescan.org/tx/0x...`
   - 确认 Token 已铸造

5. **执行第二次 Mint（验证错误处理）**
   - 再次点击 "Mint Badge" 按钮
   - 应该收到错误：`BadgeAlreadyClaimed` 或类似错误
   - ✅ 确认错误正确处理

### 2.3 验证区块浏览器

在 Base Sepolia 区块浏览器验证：

1. **查看合约地址**
   - https://sepolia.basescan.org/address/0x05c317ACEeC1CBad5a8523D63170F18bb123ab32

2. **查看 Token**
   - https://sepolia.basescan.org/token/0x05c317ACEeC1CBad5a8523D63170F18bb123ab32
   - 确认 Token ID 已创建
   - 确认 Owner 地址正确

---

## 步骤 3：验证后端集成

### 3.1 测试 useMintBadge Hook

通过前端测试：

1. 访问 `/app/immortality` 页面
2. 点击 "铸造徽章" 按钮
3. 确认交易成功（通过后端 AgentKit 执行）

### 3.2 验证 API 路由

```bash
# 测试 mintBadge API
curl -X POST http://localhost:5000/api/contracts/ImmortalityBadge/mintBadge \
  -H 'Content-Type: application/json' \
  -H 'Cookie: connect.sid=...' \
  -d '{
    "mode": "agentkit",
    "args": {}
  }'
```

**预期响应：**
```json
{
  "txHash": "0x...",
  "status": "success"
}
```

---

## 验收清单

完成以下所有项后，阶段 0 完成：

- [ ] ✅ AgentKit 钱包地址已获取并配置（`CDP_WALLET_ADDRESS`）
- [ ] ✅ AgentKit 钱包已获得 MINTER_ROLE
- [ ] ✅ 通过脚本测试：第一次 mint 成功
- [ ] ✅ 通过脚本测试：第二次 mint 失败（BadgeAlreadyClaimed）
- [ ] ✅ 区块浏览器上可以看到 mint 的 token
- [ ] ✅ 前端 Playground 显示正确的 V2 合约地址
- [ ] ✅ 前端 Playground mint 功能正常工作
- [ ] ✅ 后端 API `/api/contracts/ImmortalityBadge/mintBadge` 正常工作
- [ ] ✅ 前端 `/app/immortality` 页面的 "铸造徽章" 按钮正常工作

---

## 常见问题

### Q: 脚本提示 "CDP_WALLET_ADDRESS not configured"

**A:** 先运行 `npm run get:agentkit-address` 获取地址，然后添加到 `.env` 文件。

### Q: 提示 "Deployer does not have DEFAULT_ADMIN_ROLE"

**A:** 检查部署时的 admin 地址。如果 admin 不是当前部署者，需要从 admin 地址授予角色，或者转移 admin 权限。

### Q: Mint 失败，提示 "Contract is paused"

**A:** 需要 unpause 合约：
```bash
npx hardhat console --network base-sepolia
const badge = await ethers.getContractAt("ImmortalityBadgeV2", "0x05c317ACEeC1CBad5a8523D63170F18bb123ab32");
const [admin] = await ethers.getSigners();
await badge.connect(admin).unpause();
```

### Q: Mint 失败，提示 "Badge type 1 is not enabled"

**A:** 需要配置 badge type 1：
```bash
npx hardhat console --network base-sepolia
const badge = await ethers.getContractAt("ImmortalityBadgeV2", "0x05c317ACEeC1CBad5a8523D63170F18bb123ab32");
const [admin] = await ethers.getSigners();
await badge.connect(admin).configureBadgeType(1, {
  enabled: true,
  transferable: true,
  uri: ""
});
```

---

## 完成后确认

当所有验收清单项目完成后，你可以自信地说：

**✅ "现在所有叫 ImmortalityBadge 的调用，都是 V2，而且能成功 mint。"**

