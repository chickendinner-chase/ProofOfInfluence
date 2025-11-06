# 本地开发环境设置指南

本指南帮助你在本地设置 ProofOfInfluence 的 Web3 开发环境。

## 📋 职责划分

| 环境 | 负责内容 |
|------|---------|
| **Replit** | Web2: 前端、后端、数据库、API |
| **本地** | Web3: 智能合约、部署、合约管理 |

---

## 🛠️ 本地环境要求

### 必需软件

- **Node.js**: v18+ (推荐 v18.17.0+)
- **npm**: v9+ (或 yarn/pnpm)
- **Git**: 最新版本
- **代码编辑器**: VS Code 或 Cursor (推荐)

### 可选但推荐

- **MetaMask**: 浏览器钱包扩展
- **Hardhat**: 智能合约开发框架 (npm 安装)

---

## 🚀 快速开始

### 步骤 1: 克隆仓库

```bash
# 克隆项目
git clone https://github.com/chickendinner-chase/ProofOfInfluence.git
cd ProofOfInfluence
```

### 步骤 2: 安装依赖

```bash
# 安装所有依赖
npm install --legacy-peer-deps
```

**注意**: 使用 `--legacy-peer-deps` 是因为某些包的依赖版本兼容性问题。

### 步骤 3: 配置环境变量

创建 `.env` 文件（**不要提交到 Git**）：

```bash
# 复制示例文件
cp .env.example .env

# 编辑 .env 文件
# Windows: notepad .env
# Mac/Linux: nano .env 或 vim .env
```

**`.env` 文件内容**：

```env
# ============================================
# Web3 开发配置（本地 Only）
# ============================================

# 钱包私钥（不要 0x 前缀）
PRIVATE_KEY=your_wallet_private_key_here

# 部署网络
# 选项: sepolia, base-sepolia, mainnet, base, arbitrum, polygon
NETWORK=sepolia

# 流动性配置
WETH_AMOUNT=0.1
POI_AMOUNT=100000

# RPC URLs（可选）
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
BASE_RPC_URL=https://mainnet.base.org
ARBITRUM_RPC_URL=https://arb1.arbitrum.io/rpc

# Etherscan API Keys（用于合约验证）
ETHERSCAN_API_KEY=your_etherscan_api_key
BASESCAN_API_KEY=your_basescan_api_key
ARBISCAN_API_KEY=your_arbiscan_api_key
```

**⚠️ 安全提醒**：
- `.env` 文件已在 `.gitignore` 中，不会被提交
- 测试网和主网使用不同的私钥
- 主网建议使用硬件钱包或多签钱包

---

## 💻 本地开发工作流

### Web3 / 智能合约开发

#### 1. 编译合约

```bash
npm run compile
```

**输出示例**：
```
Compiled 8 Solidity files successfully
```

#### 2. 测试合约（可选）

```bash
npx hardhat test
```

#### 3. 部署到测试网

```bash
# Sepolia 测试网
npm run deploy:all -- --network sepolia

# Base Sepolia
npm run deploy:all -- --network base-sepolia
```

#### 4. 部署到主网

```bash
# Base 主网（推荐 - 低 gas）
npm run deploy:all -- --network base

# Arbitrum 主网
npm run deploy:all -- --network arbitrum

# 以太坊主网
npm run deploy:all -- --network mainnet
```

#### 5. 验证合约

```bash
# 部署后验证（需要 API Key）
npx hardhat verify --network base YOUR_TOKEN_ADDRESS
```

---

## 📁 本地项目结构

```
ProofOfInfluence/
├── contracts/              # 智能合约 ⭐ 本地开发
│   └── POIToken.sol        # POI ERC20 代币
│
├── scripts/                # 部署脚本 ⭐ 本地执行
│   ├── deploy-token.ts
│   ├── add-liquidity-v2.ts
│   └── deploy-and-add-liquidity.ts
│
├── deployments/            # 部署记录 ⭐ 本地保存
│   ├── .gitkeep
│   └── deployment-*.json   # 自动生成
│
├── internal/               # 内部文档（不提交）
│   ├── docs/
│   └── deployments/
│
├── hardhat.config.cjs      # Hardhat 配置
├── .env                    # 环境变量（不提交）
└── .gitignore              # Git 忽略规则
```

---

## 🔧 可用命令

### 编译和测试

```bash
# 编译所有合约
npm run compile

# 运行测试
npx hardhat test

# 类型检查
npm run check

# 清理编译文件
npx hardhat clean
```

### 部署

```bash
# 部署代币 + 添加流动性（推荐）
npm run deploy:all -- --network <network>

# 仅部署代币
npm run deploy:token

# 仅添加流动性（需先设置 POI_TOKEN_ADDRESS）
npm run deploy:liquidity
```

### Hardhat 控制台

```bash
# 打开 Hardhat 控制台
npx hardhat console --network sepolia

# 在控制台中测试合约
const [signer] = await ethers.getSigners();
console.log(signer.address);

const POI = await ethers.getContractAt("POIToken", "0xYourTokenAddress");
const balance = await POI.balanceOf(signer.address);
console.log(ethers.utils.formatEther(balance));
```

---

## 🌐 获取测试币

### Sepolia (Ethereum 测试网)
- **水龙头**: https://sepoliafaucet.com/
- **需要**: Alchemy 账号
- **数量**: 0.5 ETH / 天

### Base Sepolia
- **水龙头**: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
- **需要**: Coinbase 账号
- **数量**: 0.05 ETH / 天

### Arbitrum Goerli
- **桥接**: https://bridge.arbitrum.io/
- **从**: Goerli ETH 桥接到 Arbitrum

---

## 🔐 安全最佳实践

### 本地开发

1. **私钥管理**
   - ✅ 使用 `.env` 文件（已在 .gitignore）
   - ✅ 测试网和主网分开
   - ❌ 不要在代码中硬编码
   - ❌ 不要截图包含私钥的内容

2. **测试网先行**
   - ✅ 在 Sepolia 或 Base Sepolia 充分测试
   - ✅ 验证所有功能正常
   - ✅ 检查 gas 消耗
   - ✅ 然后再部署主网

3. **主网部署**
   - ✅ 使用硬件钱包（Ledger/Trezor）
   - ✅ 或使用多签钱包（Gnosis Safe）
   - ✅ 进行代码审计
   - ✅ 准备应急方案

4. **版本控制**
   - ✅ 定期提交代码
   - ✅ 使用有意义的提交信息
   - ❌ 不要提交 `.env` 文件
   - ❌ 不要提交主网部署记录

---

## 📊 网络配置

### 测试网

| 网络 | Chain ID | RPC | 浏览器 |
|------|----------|-----|--------|
| Sepolia | 11155111 | https://eth-sepolia.g.alchemy.com/v2/... | https://sepolia.etherscan.io/ |
| Base Sepolia | 84532 | https://sepolia.base.org | https://sepolia.basescan.org/ |

### 主网

| 网络 | Chain ID | RPC | 浏览器 | Gas 费用 |
|------|----------|-----|--------|---------|
| Ethereum | 1 | https://eth-mainnet.g.alchemy.com/v2/... | https://etherscan.io/ | 高 (~$100) |
| Base | 8453 | https://mainnet.base.org | https://basescan.org/ | 极低 (~$3) |
| Arbitrum | 42161 | https://arb1.arbitrum.io/rpc | https://arbiscan.io/ | 极低 (~$3) |
| Polygon | 137 | https://polygon-rpc.com | https://polygonscan.com/ | 低 (~$10) |

---

## 🐛 常见问题

### Q: npm install 失败？

**A:** 使用 `--legacy-peer-deps`：
```bash
npm install --legacy-peer-deps
```

### Q: 编译失败提示 Solidity 版本错误？

**A:** 检查 `hardhat.config.cjs` 中的 Solidity 版本配置。

### Q: 部署失败提示 "insufficient funds"？

**A:** 确保钱包有足够的 ETH：
- 测试网：去水龙头获取
- 主网：确保有足够余额

### Q: 如何查看部署记录？

**A:** 查看 `deployments/` 文件夹：
```bash
cat deployments/deployment-sepolia.json
```

### Q: 想在不同网络部署同一合约？

**A:** 修改 `.env` 中的 `NETWORK` 变量：
```env
NETWORK=base  # 改为目标网络
```

然后重新运行部署命令。

### Q: 如何在主网和测试网之间切换？

**A:** 使用不同的 `.env` 文件：
```bash
# 测试网配置
.env.testnet

# 主网配置
.env.mainnet

# 使用时
cp .env.testnet .env  # 切换到测试网
cp .env.mainnet .env  # 切换到主网
```

---

## 📚 相关资源

### 官方文档
- [Hardhat 文档](https://hardhat.org/docs)
- [OpenZeppelin 文档](https://docs.openzeppelin.com/)
- [Ethers.js 文档](https://docs.ethers.org/v5/)

### 工具
- [Remix IDE](https://remix.ethereum.org/) - 在线 Solidity IDE
- [Tenderly](https://tenderly.co/) - 合约调试和监控
- [Etherscan](https://etherscan.io/) - 区块浏览器

### 学习资源
- [Solidity by Example](https://solidity-by-example.org/)
- [Smart Contract Security](https://github.com/ethereumbook/ethereumbook)

---

## 🆘 需要帮助？

1. 查看项目文档：`docs/` 文件夹
2. 查看 Hardhat 日志：添加 `--verbose` 标志
3. 检查区块浏览器上的交易
4. 联系团队技术支持

---

**记住：所有 Web3 操作在本地进行，Replit 只负责 Web2 应用！**

**祝开发顺利！🚀**

