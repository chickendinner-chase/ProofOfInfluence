# POI Token 部署指南

本指南将帮助你部署 POI (Proof of Influence) 代币并在 Uniswap V2 上添加流动性。

## 📋 目录

- [前置准备](#前置准备)
- [快速开始](#快速开始)
- [分步部署](#分步部署)
- [网络支持](#网络支持)
- [常见问题](#常见问题)

## 🎯 前置准备

### 1. 安装依赖

```bash
npm install
```

这会安装所有必需的依赖，包括：
- `hardhat` - 智能合约开发框架
- `@openzeppelin/contracts` - OpenZeppelin 合约库
- `ethers` - 以太坊库

### 2. 配置环境变量

复制 `.env.example` 创建 `.env` 文件：

```bash
cp .env.example .env
```

然后编辑 `.env` 文件，填写必要的配置：

```env
# 必需配置
PRIVATE_KEY=your_private_key_here
NETWORK=sepolia

# 流动性配置 (可选)
WETH_AMOUNT=0.1
POI_AMOUNT=100000

# RPC 节点 (可选)
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
```

⚠️ **安全提醒**: 
- **永远不要**将私钥提交到 Git
- `.env` 文件已被添加到 `.gitignore`
- 建议在 Replit Secrets 中配置敏感信息

### 3. 准备钱包

确保你的钱包：
- ✅ 有足够的测试网 ETH（用于 gas 费用）
- ✅ 有足够的 POI 代币（部署后用于添加流动性）

**获取测试网 ETH:**
- Sepolia: https://sepoliafaucet.com/
- Base Sepolia: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet

## 🚀 快速开始

### 一键部署（推荐）

使用一个命令完成代币部署和流动性添加：

```bash
# 在 Sepolia 测试网部署
npx hardhat run scripts/deploy-and-add-liquidity.ts --network sepolia

# 或在其他网络
npx hardhat run scripts/deploy-and-add-liquidity.ts --network base-sepolia
```

这个脚本会：
1. ✅ 部署 POI Token 合约
2. ✅ 铸造 1,000,000,000 POI 代币
3. ✅ 授权 Uniswap Router
4. ✅ 添加流动性到 Uniswap V2

## 📝 分步部署

如果你想分步骤进行，可以使用以下命令：

### 步骤 1: 编译合约

```bash
npm run compile
```

这会编译 `contracts/POIToken.sol` 合约。

### 步骤 2: 部署代币

```bash
# 方法 1: 使用 Hardhat
npx hardhat run scripts/deploy-and-add-liquidity.ts --network sepolia

# 方法 2: 使用 tsx (仅部署，不添加流动性)
npm run deploy:token
```

部署成功后，你会看到：
```
✅ POI Token 已部署: 0x...
   总供应量: 1000000000.0 POI
```

**保存代币地址**，你需要它来添加流动性。

### 步骤 3: 添加流动性

```bash
# 设置代币地址
export POI_TOKEN_ADDRESS=0x...  # 你的代币地址

# 配置流动性数量
export WETH_AMOUNT=0.1          # 0.1 ETH
export POI_AMOUNT=100000        # 100,000 POI

# 执行添加流动性
npm run deploy:liquidity
```

## 🌐 网络支持

本项目支持以下网络：

| 网络 | Network ID | Uniswap Router | 推荐用途 |
|------|-----------|----------------|----------|
| **Mainnet** | `mainnet` | 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D | 生产环境 |
| **Sepolia** | `sepolia` | 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D | 测试环境 |
| **Base** | `base` | 0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24 | L2 生产 |
| **Base Sepolia** | `base-sepolia` | - | L2 测试 |
| **Arbitrum** | `arbitrum` | 0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506 | L2 生产 |
| **Polygon** | `polygon` | 0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff | 侧链 |

### 切换网络

```bash
# 在 .env 中设置
NETWORK=sepolia

# 或使用命令行参数
npx hardhat run scripts/deploy-and-add-liquidity.ts --network base
```

## 📊 合约信息

### POI Token 详情

```solidity
名称: Proof of Influence
符号: POI
小数位: 18
初始供应量: 1,000,000,000 POI (10亿)
```

### 合约功能

- ✅ **标准 ERC20**: `transfer`, `approve`, `transferFrom`
- ✅ **可销毁**: `burn` (持有者可销毁自己的代币)
- ✅ **可铸造**: `mint` (仅所有者)
- ✅ **批量转账**: `batchTransfer` (节省 gas)

### 合约安全

- ✅ 基于 OpenZeppelin 合约
- ✅ 使用 Solidity 0.8.20 (内置溢出保护)
- ✅ 通过 Hardhat 测试

## 🔍 部署验证

部署完成后，检查以下内容：

### 1. 查看部署信息

部署信息会自动保存在 `deployments/` 目录：

```bash
cat deployments/deployment-sepolia.json
```

内容示例：
```json
{
  "network": "sepolia",
  "timestamp": "2025-11-05T10:30:00.000Z",
  "contracts": {
    "poiToken": "0x...",
    "liquidityPair": "0x..."
  },
  "transactionHash": "0x..."
}
```

### 2. 在区块浏览器查看

访问相应的区块浏览器：

- **Sepolia**: https://sepolia.etherscan.io/address/YOUR_TOKEN_ADDRESS
- **Base**: https://basescan.org/address/YOUR_TOKEN_ADDRESS
- **Arbitrum**: https://arbiscan.io/address/YOUR_TOKEN_ADDRESS

### 3. 在 Uniswap 查看流动性池

访问 Uniswap 界面：

```
https://app.uniswap.org/pool/YOUR_PAIR_ADDRESS
```

## 💡 使用示例

### 在前端集成 POI Token

```typescript
import { ethers } from "ethers";

// POI Token ABI (简化版)
const POI_TOKEN_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
];

// 连接到合约
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
const poiToken = new ethers.Contract(
  "YOUR_POI_TOKEN_ADDRESS",
  POI_TOKEN_ABI,
  signer
);

// 查询余额
const balance = await poiToken.balanceOf(address);
console.log("POI Balance:", ethers.utils.formatEther(balance));

// 转账
const tx = await poiToken.transfer(recipientAddress, ethers.utils.parseEther("100"));
await tx.wait();
```

### 在 Uniswap 交易

用户可以直接在 Uniswap 上购买/出售 POI 代币：

1. 访问 https://app.uniswap.org
2. 在 "Select token" 中粘贴 POI 代币地址
3. 选择交易数量
4. 确认交易

## ❓ 常见问题

### Q: 部署失败，提示 "insufficient funds"

**A:** 确保你的钱包有足够的 ETH 支付 gas 费用。在测试网上，你可以从水龙头获取免费的测试 ETH。

### Q: 添加流动性失败

**A:** 检查以下几点：
1. 钱包是否有足够的 ETH 和 POI 代币
2. 是否已授权 Router 使用你的代币
3. 网络是否正确（主网 vs 测试网）

### Q: 如何在主网部署？

**A:** 
1. 将 `NETWORK` 设置为 `mainnet`
2. 确保使用的是主网私钥
3. 准备足够的 ETH（gas 费用较高）
4. **谨慎操作** - 主网部署是不可逆的

### Q: 如何验证合约？

**A:** 在部署后，使用 Hardhat 验证：

```bash
npx hardhat verify --network sepolia YOUR_TOKEN_ADDRESS
```

需要在 `.env` 中设置 `ETHERSCAN_API_KEY`。

### Q: 流动性池的初始价格如何确定？

**A:** 初始价格由你添加的代币比例决定：

```
价格 = POI_AMOUNT / ETH_AMOUNT
```

例如，添加 100,000 POI 和 0.1 ETH：
```
1 POI = 0.000001 ETH
1 ETH = 1,000,000 POI
```

### Q: 可以修改代币供应量吗？

**A:** 可以！在部署前编辑 `contracts/POIToken.sol`：

```solidity
// 修改这一行
uint256 public constant INITIAL_SUPPLY = 1_000_000_000 * 10**18;
```

### Q: 如何在 Replit 上部署？

**A:** 
1. 在 Replit Secrets 中添加 `PRIVATE_KEY` 和 `NETWORK`
2. 在 Shell 中运行部署命令：
   ```bash
   npm run deploy:all -- --network sepolia
   ```
3. 部署信息会保存在 `deployments/` 目录

## 📚 更多资源

- [Hardhat 文档](https://hardhat.org/docs)
- [OpenZeppelin 文档](https://docs.openzeppelin.com/)
- [Uniswap V2 文档](https://docs.uniswap.org/contracts/v2/overview)
- [Ethers.js 文档](https://docs.ethers.org/)

## 🆘 需要帮助？

如果遇到问题：
1. 检查 [常见问题](#常见问题) 部分
2. 查看部署日志中的错误信息
3. 在 GitHub Issues 提问
4. 加入我们的 Discord 社区

---

**Happy Deploying! 🚀**


