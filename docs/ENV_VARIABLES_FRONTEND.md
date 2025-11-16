# 前端环境变量配置

## 客户端环境变量 (client/.env.local)

### Base Sepolia 测试网配置

```env
# 链 ID
VITE_CHAIN_ID=84532

# RPC URL
VITE_BASE_RPC_URL=https://sepolia.base.org
VITE_BASE_EXPLORER=https://sepolia.basescan.org

# 合约地址
VITE_POI_ADDRESS=0x737869142C93078Dae4d78D4E8c5dbD45160565a
VITE_TGESALE_ADDRESS=<从部署日志获取>
VITE_STAKING_REWARDS_ADDRESS=0xe23f7688303768BB1CE2e2a98540A0C1ba63ec2d

# USDC 地址 (Base Sepolia)
VITE_USDC_ADDRESS=<Base Sepolia USDC 地址>

# WalletConnect (可选)
VITE_WALLETCONNECT_PROJECT_ID=<你的 WalletConnect Project ID>
```

### Base 主网配置

```env
# 链 ID
VITE_CHAIN_ID=8453

# RPC URL
VITE_BASE_RPC_URL=https://mainnet.base.org
VITE_BASE_EXPLORER=https://basescan.org

# 合约地址 (主网部署后填写)
VITE_POI_ADDRESS=<主网 POI 地址>
VITE_TGESALE_ADDRESS=<主网 TGE 地址>
VITE_STAKING_REWARDS_ADDRESS=<主网 Staking 地址>

# USDC 地址 (Base 主网)
VITE_USDC_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913

# WalletConnect
VITE_WALLETCONNECT_PROJECT_ID=<你的 WalletConnect Project ID>
```

## 环境变量说明

### VITE_CHAIN_ID
- Base Sepolia: `84532`
- Base Mainnet: `8453`

### VITE_BASE_RPC_URL
- Base Sepolia: `https://sepolia.base.org`
- Base Mainnet: `https://mainnet.base.org`

### 合约地址
所有合约地址都是必需的，如果未配置，相关功能将无法使用：
- `VITE_POI_ADDRESS`: POI Token 合约地址
- `VITE_TGESALE_ADDRESS`: TGE 销售合约地址
- `VITE_STAKING_REWARDS_ADDRESS`: 质押奖励合约地址
- `VITE_USDC_ADDRESS`: USDC 代币地址（用于 TGE 购买）

### WalletConnect
如果需要使用 WalletConnect 连接钱包，需要配置 `VITE_WALLETCONNECT_PROJECT_ID`。

## 如何设置

1. 在 `client/` 目录下创建 `.env.local` 文件
2. 复制上面的配置模板
3. 填写实际的合约地址和配置
4. 重启开发服务器 (`npm run dev:frontend`)

## 注意事项

- `.env.local` 文件不会被提交到 Git（已在 `.gitignore` 中）
- 环境变量必须以 `VITE_` 开头才能在前端代码中使用
- 修改环境变量后需要重启开发服务器
- 生产环境需要在部署平台（如 Replit）配置环境变量

