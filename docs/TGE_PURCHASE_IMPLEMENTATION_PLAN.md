# TGE 购买功能实现计划

**创建日期**: 2025-11-14  
**负责人**: Cursor AI  
**预估时间**: 前端 1-2 天，后端 0.5 天，测试 0.5 天

---

## 📋 目标

实现用户通过加密钱包使用 USDC 购买 POI 代币的完整流程，基于 `TGESale.sol` 智能合约。

---

## 🎯 核心功能

### 用户流程

```
用户访问 /market 页面
    ↓
连接钱包（MetaMask/Coinbase Wallet 等）
    ↓
切换到 Base 网络（如果不在）
    ↓
选择购买金额（查看当前价格和层级）
    ↓
检查 USDC 余额和白名单资格
    ↓
授权 USDC（Approve）
    ↓
调用合约购买（Purchase）
    ↓
等待交易确认（显示进度）
    ↓
购买成功！查看 POI 余额 ✅
```

### 技术流程

```
Frontend (React)
    ↓
1. 连接钱包 (wagmi/useAccount)
    ↓
2. 获取白名单证明 ← Backend API: /api/tge/whitelist/:address
    ↓
3. 读取合约状态 ← TGESale: currentTier, tiers[]
    ↓
4. 用户输入金额
    ↓
5. 估算 Gas 费用
    ↓
6. Approve USDC (USDC.approve)
    ↓
7. Purchase POI (TGESale.purchase)
    ↓
8. 监听交易 ← Blockchain: waitForTransaction
    ↓
9. 更新 UI（余额、历史记录）
```

---

## 🛠 实现任务

### Phase 1: 前端核心组件（1天）

#### 1.1 创建 TGESaleCard 组件

**文件**: `client/src/components/TGESaleCard.tsx`

**功能**:
- 显示当前 TGE 进度（层级、价格、剩余数量）
- 输入购买金额（USDC）
- 实时计算将获得的 POI 数量
- 显示手续费和 Gas 估算
- 一键购买按钮

**关键状态**:
```typescript
const [purchaseAmount, setPurchaseAmount] = useState("");
const [loading, setLoading] = useState(false);
const [step, setStep] = useState<"idle" | "approving" | "purchasing" | "confirming">("idle");
const [txHash, setTxHash] = useState("");
```

**核心 Hooks**:
```typescript
// 钱包连接
const { address, isConnected } = useAccount();

// 合约读取
const { data: currentTier } = useReadContract({
  address: TGE_SALE_ADDRESS,
  abi: TGESaleABI,
  functionName: "currentTier",
});

const { data: tierInfo } = useReadContract({
  address: TGE_SALE_ADDRESS,
  abi: TGESaleABI,
  functionName: "tiers",
  args: [currentTier],
});

// USDC 余额
const { data: usdcBalance } = useReadContract({
  address: USDC_ADDRESS,
  abi: ERC20_ABI,
  functionName: "balanceOf",
  args: [address],
});

// POI 余额
const { data: poiBalance } = useReadContract({
  address: POI_ADDRESS,
  abi: ERC20_ABI,
  functionName: "balanceOf",
  args: [address],
});
```

#### 1.2 实现购买逻辑

**文件**: `client/src/lib/tgePurchase.ts`

```typescript
import { ethers } from "ethers";
import { useWriteContract, useWaitForTransaction } from "wagmi";

export async function purchasePOI({
  usdcAmount: string,
  merkleProof: string[],
  walletClient: any,
  onStep: (step: string) => void,
}) {
  // Step 1: Approve USDC
  onStep("approving");
  const usdcContract = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, signer);
  const approveTx = await usdcContract.approve(
    TGE_SALE_ADDRESS,
    ethers.utils.parseUnits(usdcAmount, 6)
  );
  await approveTx.wait();

  // Step 2: Purchase POI
  onStep("purchasing");
  const saleContract = new ethers.Contract(TGE_SALE_ADDRESS, TGESaleABI, signer);
  const purchaseTx = await saleContract.purchase(
    ethers.utils.parseUnits(usdcAmount, 6),
    merkleProof
  );
  
  onStep("confirming");
  const receipt = await purchaseTx.wait();
  
  return {
    txHash: receipt.transactionHash,
    poiAmount: extractPOIAmountFromLogs(receipt),
  };
}
```

#### 1.3 UI 组件集成

**文件**: `client/src/pages/Market.tsx`

**修改**:
- 删除或替换现有的占位符内容
- 集成 `TGESaleCard` 组件
- 添加购买历史记录列表
- 显示当前钱包的 POI 余额

---

### Phase 2: 后端 API 支持（0.5天）

#### 2.1 白名单 API

**文件**: `server/routes/tge.ts`

```typescript
// GET /api/tge/whitelist/:address
app.get("/api/tge/whitelist/:address", async (req, res) => {
  const { address } = req.params;
  
  // 1. 查询数据库：该用户是否在白名单中
  const whitelisted = await storage.isWhitelisted(address);
  
  if (!whitelisted) {
    return res.json({
      eligible: false,
      proof: [],
    });
  }
  
  // 2. 获取用户的分配额度
  const allocation = await storage.getWhitelistAllocation(address);
  
  // 3. 生成 Merkle proof
  const proof = generateMerkleProof(address, allocation);
  
  res.json({
    eligible: true,
    allocation: allocation.toString(),
    proof: proof,
  });
});
```

#### 2.2 TGE 状态 API

```typescript
// GET /api/tge/status
app.get("/api/tge/status", async (req, res) => {
  // 从链上读取 TGE 当前状态
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const saleContract = new ethers.Contract(TGE_SALE_ADDRESS, TGESaleABI, provider);
  
  const currentTier = await saleContract.currentTier();
  const tierInfo = await saleContract.tiers(currentTier);
  const totalRaised = await saleContract.totalRaised();
  
  res.json({
    currentTier,
    pricePerToken: tierInfo.pricePerToken.toString(),
    remainingTokens: tierInfo.remainingTokens.toString(),
    totalRaised: totalRaised.toString(),
  });
});
```

#### 2.3 购买历史记录

```typescript
// GET /api/tge/purchases/:address
app.get("/api/tge/purchases/:address", async (req, res) => {
  const { address } = req.params;
  
  // 从数据库或链上事件查询购买历史
  const purchases = await storage.getPurchaseHistory(address);
  
  res.json({
    purchases: purchases.map(p => ({
      timestamp: p.timestamp,
      usdcAmount: p.usdcAmount,
      poiAmount: p.poiAmount,
      txHash: p.txHash,
      tier: p.tier,
    })),
  });
});
```

#### 2.4 数据库 Schema

**文件**: `shared/schema.ts`

```typescript
// 白名单表
export const tgeWhitelist = pgTable("tge_whitelist", {
  address: varchar("address").primaryKey(),
  allocation: varchar("allocation").notNull(), // USDC allocation (6 decimals)
  merkleIndex: integer("merkle_index").notNull(),
  claimed: boolean("claimed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// 购买记录表
export const tgePurchases = pgTable("tge_purchases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  buyerAddress: varchar("buyer_address").notNull(),
  usdcAmount: varchar("usdc_amount").notNull(),
  poiAmount: varchar("poi_amount").notNull(),
  tier: integer("tier").notNull(),
  txHash: varchar("tx_hash").notNull().unique(),
  blockNumber: integer("block_number").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
```

---

### Phase 3: 智能合约配置（Replit）

#### 3.1 部署配置

**环境变量** (Replit Secrets):
```
TGE_SALE_ADDRESS=0x...        # 已部署的 TGESale 合约地址
POI_TOKEN_ADDRESS=0x...       # POI 代币地址
USDC_ADDRESS=0x...            # Base 网络 USDC 地址
TGE_TREASURY_ADDRESS=0x...    # 接收 USDC 的财库地址
TGE_MERKLE_ROOT=0x...         # 白名单 Merkle 根
```

#### 3.2 配置 TGE 参数

**脚本**: `scripts/configure-tge.ts`

```typescript
async function configureTGE() {
  const saleContract = await ethers.getContractAt("TGESale", TGE_SALE_ADDRESS);
  
  // 配置层级（3层）
  const prices = [
    ethers.utils.parseUnits("0.10", 6),  // Tier 0: $0.10 per POI
    ethers.utils.parseUnits("0.15", 6),  // Tier 1: $0.15 per POI
    ethers.utils.parseUnits("0.20", 6),  // Tier 2: $0.20 per POI
  ];
  
  const supplies = [
    ethers.utils.parseEther("1000000"),   // Tier 0: 1M POI
    ethers.utils.parseEther("2000000"),   // Tier 1: 2M POI
    ethers.utils.parseEther("3000000"),   // Tier 2: 3M POI
  ];
  
  await saleContract.configureTiers(prices, supplies);
  
  // 设置贡献限额
  await saleContract.setContributionBounds(
    ethers.utils.parseUnits("10", 6),    // Min: $10
    ethers.utils.parseUnits("10000", 6)  // Max: $10,000
  );
  
  // 设置 Merkle 根
  await saleContract.setMerkleRoot(MERKLE_ROOT);
  
  console.log("TGE configured successfully!");
}
```

---

### Phase 4: 用户体验优化（0.5天）

#### 4.1 错误处理

**常见错误**:
- 用户拒绝交易 → "您取消了交易"
- USDC 余额不足 → "USDC 余额不足，请先充值"
- 不在白名单 → "您不在白名单中，请参加社区活动获取资格"
- Gas 费不足 → "ETH 余额不足支付 Gas 费"
- 超出分配额度 → "您已达到购买上限"
- 层级售罄 → "当前层级已售罄，等待下一层级开启"

#### 4.2 交易状态 UI

```typescript
{step === "idle" && <Button>购买 POI</Button>}
{step === "approving" && (
  <Button disabled>
    <Loader2 className="animate-spin" />
    授权 USDC...
  </Button>
)}
{step === "purchasing" && (
  <Button disabled>
    <Loader2 className="animate-spin" />
    购买中...
  </Button>
)}
{step === "confirming" && (
  <div>
    <Loader2 className="animate-spin" />
    <span>等待区块确认...</span>
    <a href={`https://basescan.org/tx/${txHash}`}>查看交易</a>
  </div>
)}
```

#### 4.3 购买成功动画

- 使用 Confetti 动画庆祝
- 显示购买摘要（USDC 花费、POI 获得）
- 提示分享到社交媒体

---

## 📂 文件清单

### 新建文件

**前端**:
- `client/src/components/TGESaleCard.tsx` - 主购买组件
- `client/src/components/TGEProgress.tsx` - 进度条组件
- `client/src/components/PurchaseHistory.tsx` - 历史记录
- `client/src/lib/tgePurchase.ts` - 购买逻辑
- `client/src/lib/merkleProof.ts` - Merkle proof 工具
- `client/src/hooks/useTGESale.ts` - TGE 自定义 Hook

**后端**:
- `server/routes/tge.ts` - TGE API 路由
- `server/services/merkle.ts` - Merkle 树服务
- `server/services/blockchain.ts` - 链上数据服务

**脚本**:
- `scripts/configure-tge.ts` - 配置 TGE 参数
- `scripts/generate-merkle-tree.ts` - 生成白名单 Merkle 树
- `scripts/verify-purchase.ts` - 验证购买交易

### 修改文件

- `client/src/pages/Market.tsx` - 集成 TGESaleCard
- `shared/schema.ts` - 添加 TGE 相关表
- `server/storage.ts` - 添加 TGE 数据库方法
- `client/src/lib/baseConfig.ts` - 添加 TGE 合约地址

---

## 🧪 测试计划

### 前端测试

1. **钱包连接测试**
   - 连接/断开钱包
   - 切换账户
   - 切换网络

2. **购买流程测试**
   - 正常购买（小额、大额）
   - USDC 余额不足
   - 不在白名单
   - 超出分配额度
   - 层级售罄
   - 用户取消交易

3. **UI 响应测试**
   - 加载状态
   - 错误提示
   - 成功动画
   - 移动端适配

### 后端测试

1. **API 测试**
   - 白名单查询（存在/不存在）
   - Merkle proof 生成和验证
   - TGE 状态读取
   - 购买历史查询

2. **数据库测试**
   - 白名单数据插入和查询
   - 购买记录保存
   - 并发访问

### 集成测试

1. **端到端测试**（Base Sepolia 测试网）
   - 完整购买流程（小额测试）
   - 多用户并发购买
   - 层级转换验证
   - Gas 费估算准确性

---

## 📊 监控和分析

### 关键指标

1. **业务指标**
   - 总销售额（USDC）
   - 已售出 POI 数量
   - 当前层级和价格
   - 平均购买金额
   - 参与用户数

2. **技术指标**
   - 交易成功率
   - 平均确认时间
   - Gas 费消耗
   - API 响应时间
   - 错误率（按类型）

### 监控工具

- **前端**: Sentry（错误追踪）
- **后端**: Prometheus + Grafana（性能监控）
- **区块链**: Etherscan API（交易监听）

---

## 🚀 部署流程

### Step 1: 准备环境（Replit）

```bash
# 1. 配置环境变量
# 在 Replit Secrets 添加所有必需变量

# 2. 部署 TGESale 合约（如果还没部署）
npm run deploy:tge-sale

# 3. 配置 TGE 参数
npm run configure:tge

# 4. 生成白名单 Merkle 树
npm run generate:merkle-tree

# 5. 更新数据库 Schema
npm run db:push
```

### Step 2: 前端部署

```bash
# 1. 更新合约地址配置
# 编辑 client/src/lib/baseConfig.ts

# 2. 构建前端
npm run build

# 3. 测试
npm run dev

# 4. 部署（Replit 自动部署）
git push origin dev
```

### Step 3: 测试网验证

1. 访问 `https://your-app.replit.app/market`
2. 连接测试网钱包
3. 确保有测试 USDC 和 ETH
4. 完成一次小额购买
5. 验证：
   - 交易成功
   - POI 余额增加
   - USDC 余额减少
   - 历史记录显示

### Step 4: 主网部署

⚠️ **主网部署前检查清单**:
- [ ] 合约安全审计完成
- [ ] 测试网完整测试通过
- [ ] 白名单数据准备完毕
- [ ] 监控和告警配置完成
- [ ] 紧急暂停机制测试
- [ ] 团队多签钱包准备
- [ ] 客服支持文档准备

---

## 💡 优化建议

### 用户体验优化

1. **一键购买（Permit）**
   - 使用 EIP-2612 Permit 签名
   - 无需单独 Approve 交易
   - 节省一次 Gas 费

2. **法币入金集成**
   - 集成 Moonpay 或 Transak
   - 用户可用信用卡购买 USDC
   - 然后直接购买 POI

3. **批量购买**
   - 支持多个用户地址批量购买
   - 适用于团队/机构投资者

### 性能优化

1. **前端缓存**
   - 缓存 TGE 状态（1分钟）
   - 缓存白名单结果
   - 使用 React Query 自动刷新

2. **后端优化**
   - Merkle proof 预计算并缓存
   - 使用 Redis 缓存热数据
   - 批量读取链上数据

3. **Gas 优化**
   - 预估 Gas 并显示给用户
   - 动态调整 Gas Price
   - 失败时自动重试（更高 Gas）

---

## 🎓 用户教育

### 购买指南文档

创建 `docs/USER_GUIDE_TGE.md`:
- 如何获取 USDC
- 如何连接钱包
- 购买流程图解
- 常见问题解答
- 故障排除

### 视频教程

- 3分钟快速购买教程
- 完整购买流程演示
- 常见错误处理

---

## ⏱ 开发时间估算

| 任务 | 负责人 | 预估时间 | 依赖 |
|------|--------|---------|------|
| **Phase 1: 前端组件** | Cursor | 8小时 | - |
| - TGESaleCard 组件 | | 3小时 | - |
| - 购买逻辑实现 | | 3小时 | - |
| - Market 页面集成 | | 2小时 | TGESaleCard |
| **Phase 2: 后端 API** | Cursor | 4小时 | - |
| - 白名单 API | | 2小时 | - |
| - TGE 状态 API | | 1小时 | - |
| - 数据库 Schema | | 1小时 | - |
| **Phase 3: 合约配置** | Replit | 2小时 | 合约已部署 |
| - 部署 TGESale | | 0.5小时 | - |
| - 配置参数 | | 1小时 | 部署完成 |
| - 生成 Merkle 树 | | 0.5小时 | 白名单数据 |
| **Phase 4: 测试** | Cursor + Replit | 4小时 | 功能完成 |
| - 单元测试 | | 1小时 | - |
| - 集成测试 | | 2小时 | 测试网 |
| - UI/UX 优化 | | 1小时 | - |
| **总计** | | **18小时** | ≈ 2-3天 |

---

## 📞 支持和反馈

### 开发期间

- **Cursor**（本地开发）: 前端 + 后端 + 测试
- **Replit**（部署）: 合约部署 + 配置 + 密钥管理
- **协作**: 通过 GitHub Issues 和 Slack

### 上线后

- **用户反馈**: Discord/Telegram 社区
- **技术支持**: GitHub Issues
- **紧急问题**: Slack #emergencies

---

## ✅ 下一步行动

1. ✅ **审查本计划**（你正在做）
2. ⏳ **与 GPT 讨论细节**（加密支付最佳实践）
3. ⏳ **Cursor 开始开发**（Phase 1: 前端组件）
4. ⏳ **Replit 准备环境**（部署合约、配置参数）
5. ⏳ **集成测试**（Base Sepolia 测试网）
6. ⏳ **用户测试**（内部团队试用）
7. ⏳ **主网部署**（正式上线）

---

**计划创建完成**: 2025-11-14  
**准备开始开发**: 等待你的确认 🚀


