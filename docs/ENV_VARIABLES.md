# 环境变量配置

## 基础配置 (已有)

```env
# 数据库配置
DATABASE_URL=postgresql://user:password@host:5432/database

# Replit Auth
SESSION_SECRET=your-session-secret-here

# Stripe 支付
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx

# 应用配置
BASE_URL=https://your-app.repl.co
```

## Web3 部署配置 (新增)

### 必需配置

```env
# 部署者私钥 (⚠️ 不要提交到Git!)
PRIVATE_KEY=your_private_key_here

# 网络选择
# 支持: mainnet, sepolia, base, base-sepolia, arbitrum, polygon
NETWORK=sepolia
```

### 可选配置

```env
# RPC 节点 URL (如果使用自定义节点)
# 主网
MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY
# Sepolia 测试网
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
# Base
BASE_RPC_URL=https://mainnet.base.org
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
# Arbitrum
ARBITRUM_RPC_URL=https://arb1.arbitrum.io/rpc
# Polygon
POLYGON_RPC_URL=https://polygon-rpc.com

# POI 代币地址 (部署后填写)
POI_TOKEN_ADDRESS=0x...

# 流动性配置
WETH_AMOUNT=0.1        # 添加的 ETH 数量
POI_AMOUNT=100000      # 添加的 POI 代币数量

# 区块浏览器 API Key (用于合约验证)
ETHERSCAN_API_KEY=your_etherscan_api_key
BASESCAN_API_KEY=your_basescan_api_key
ARBISCAN_API_KEY=your_arbiscan_api_key
POLYGONSCAN_API_KEY=your_polygonscan_api_key
```

## 在 Replit 中配置

1. 点击左侧栏的 **Secrets** (🔒 图标)
2. 添加以下 secrets:
   - `PRIVATE_KEY` - 你的钱包私钥
   - `NETWORK` - 部署网络 (例: `sepolia`)
   - `WETH_AMOUNT` - 可选，默认 0.1
   - `POI_AMOUNT` - 可选，默认 100000

3. 其他 RPC URL 和 API Keys 根据需要添加

⚠️ **安全提醒**: 
- 永远不要在代码中硬编码私钥
- 不要将 `.env` 文件提交到 Git
- 使用 Replit Secrets 管理敏感信息


