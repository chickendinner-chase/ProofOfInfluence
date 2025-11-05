# POI Token 快速开始指南

## 🎯 目标

快速部署 POI 代币并在 Uniswap V2 上添加流动性。

## ⚡ 5 分钟快速部署

### 1️⃣ 安装依赖 (1分钟)

在 Replit Shell 运行：

```bash
npm install
```

### 2️⃣ 配置环境变量 (1分钟)

在 Replit Secrets 中添加：

| Key | Value | 说明 |
|-----|-------|------|
| `PRIVATE_KEY` | `0x...` | 你的钱包私钥 |
| `NETWORK` | `sepolia` | 网络名称 |

### 3️⃣ 获取测试币 (2分钟)

访问水龙头获取测试 ETH：
- **Sepolia**: https://sepoliafaucet.com/
- **Base Sepolia**: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet

最少需要 **0.2 ETH** (gas + 流动性)

### 4️⃣ 部署！(1分钟)

```bash
npx hardhat run scripts/deploy-and-add-liquidity.ts --network sepolia
```

搞定！🎉

## 📋 部署后你会得到

```
✅ POI Token 已部署: 0xAbC...123
✅ 流动性池: 0xDeF...456
```

保存这些地址！

## 🔍 验证部署

1. **查看代币**:
   ```
   https://sepolia.etherscan.io/address/YOUR_TOKEN_ADDRESS
   ```

2. **查看流动性池**:
   ```
   https://app.uniswap.org/pool/YOUR_PAIR_ADDRESS
   ```

3. **查看部署信息**:
   ```bash
   cat deployments/deployment-sepolia.json
   ```

## 🎨 自定义配置

### 修改流动性数量

在 Replit Secrets 添加：

| Key | Value | 说明 |
|-----|-------|------|
| `WETH_AMOUNT` | `0.1` | ETH 数量 |
| `POI_AMOUNT` | `100000` | POI 数量 |

### 修改代币供应量

编辑 `contracts/POIToken.sol`:

```solidity
// 修改这一行 (当前是10亿)
uint256 public constant INITIAL_SUPPLY = 1_000_000_000 * 10**18;
```

### 使用其他网络

支持的网络：

```bash
# Base (推荐 - 低 gas)
--network base

# Arbitrum (推荐 - 低 gas)
--network arbitrum

# Polygon
--network polygon

# 主网 (谨慎!)
--network mainnet
```

## ❓ 遇到问题？

### "insufficient funds"
→ 去水龙头获取更多测试 ETH

### "nonce too high"
→ 重启 Replit 或等待几分钟

### "network not supported"
→ 检查 `NETWORK` 拼写是否正确

### 其他问题？
→ 查看完整文档: [TOKEN_DEPLOYMENT.md](./TOKEN_DEPLOYMENT.md)

## 📚 下一步

- [集成 POI Token 到前端](./TOKEN_DEPLOYMENT.md#在前端集成-poi-token)
- [验证合约](./TOKEN_DEPLOYMENT.md#q-如何验证合约)
- [查看完整文档](./TOKEN_DEPLOYMENT.md)

---

**祝部署顺利！🚀**


