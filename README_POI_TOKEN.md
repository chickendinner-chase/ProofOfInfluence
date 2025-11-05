# 🪙 POI Token 部署系统

为 ProofOfInfluence 项目添加的 ERC20 代币部署和 Uniswap V2 流动性管理功能。

## 📁 新增文件结构

```
ProofOfInfluence/
├── contracts/
│   └── POIToken.sol                    # POI ERC20 代币合约
├── scripts/
│   ├── deploy-token.ts                 # 代币部署脚本
│   ├── add-liquidity-v2.ts            # Uniswap V2 流动性脚本
│   └── deploy-and-add-liquidity.ts    # 一键部署脚本 (推荐)
├── docs/
│   ├── TOKEN_DEPLOYMENT.md            # 完整部署文档
│   ├── QUICK_START_POI.md            # 快速开始指南
│   └── ENV_VARIABLES.md              # 环境变量说明
├── deployments/                       # 部署记录 (自动生成)
│   ├── deployment-sepolia.json
│   └── liquidity-sepolia.json
├── hardhat.config.ts                  # Hardhat 配置
└── .gitignore                         # Git 忽略规则
```

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

新增依赖包：
- `hardhat` - 智能合约开发框架
- `@nomicfoundation/hardhat-toolbox` - Hardhat 工具集
- `@openzeppelin/contracts` - OpenZeppelin 合约库
- `dotenv` - 环境变量管理

### 2. 配置环境

在 Replit Secrets 添加：

```
PRIVATE_KEY=your_wallet_private_key
NETWORK=sepolia
```

完整配置说明: [docs/ENV_VARIABLES.md](docs/ENV_VARIABLES.md)

### 3. 部署

```bash
# 一键部署 (推荐)
npx hardhat run scripts/deploy-and-add-liquidity.ts --network sepolia

# 或分步部署
npm run compile                 # 编译合约
npm run deploy:token           # 部署代币
npm run deploy:liquidity       # 添加流动性
```

## 📖 文档

- **[快速开始指南](docs/QUICK_START_POI.md)** - 5分钟快速部署
- **[完整部署文档](docs/TOKEN_DEPLOYMENT.md)** - 详细说明和问题排查
- **[环境变量配置](docs/ENV_VARIABLES.md)** - 所有配置项说明

## 🪙 POI Token 详情

```
名称: Proof of Influence
符号: POI
小数位: 18
初始供应: 1,000,000,000 POI (10亿)
标准: ERC20
```

### 特性

- ✅ 标准 ERC20 功能
- ✅ 可销毁 (Burnable)
- ✅ 可铸造 (仅所有者)
- ✅ 批量转账 (节省 gas)
- ✅ 基于 OpenZeppelin 合约

## 🌐 支持的网络

| 网络 | Network ID | 状态 |
|------|-----------|------|
| Mainnet | `mainnet` | ✅ 支持 |
| Sepolia | `sepolia` | ✅ 支持 (推荐测试) |
| Base | `base` | ✅ 支持 |
| Base Sepolia | `base-sepolia` | ✅ 支持 |
| Arbitrum | `arbitrum` | ✅ 支持 |
| Polygon | `polygon` | ✅ 支持 |

## 📝 可用命令

```bash
# 编译合约
npm run compile

# 部署代币
npm run deploy:token

# 添加流动性
npm run deploy:liquidity

# 一键部署 (推荐)
npm run deploy:all -- --network sepolia

# 类型检查
npm run check
```

## 🔍 部署验证

部署后检查：

1. **部署记录**:
   ```bash
   cat deployments/deployment-sepolia.json
   ```

2. **区块浏览器**:
   ```
   https://sepolia.etherscan.io/address/YOUR_TOKEN_ADDRESS
   ```

3. **Uniswap 流动性**:
   ```
   https://app.uniswap.org/pool/YOUR_PAIR_ADDRESS
   ```

## 💡 在前端使用

```typescript
import { ethers } from "ethers";

const POI_TOKEN_ADDRESS = "0x..."; // 你的代币地址
const POI_TOKEN_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
];

const provider = new ethers.providers.Web3Provider(window.ethereum);
const poiToken = new ethers.Contract(
  POI_TOKEN_ADDRESS,
  POI_TOKEN_ABI,
  provider.getSigner()
);

// 查询余额
const balance = await poiToken.balanceOf(userAddress);
console.log("POI:", ethers.utils.formatEther(balance));

// 转账
await poiToken.transfer(recipient, ethers.utils.parseEther("100"));
```

## 🔒 安全提醒

- ⚠️ **永远不要**将私钥提交到 Git
- ⚠️ **永远不要**在代码中硬编码私钥
- ✅ 使用 Replit Secrets 管理敏感信息
- ✅ `.env` 文件已添加到 `.gitignore`
- ✅ 主网部署前请充分测试

## 📊 Gas 估算

以 Sepolia 测试网为例：

| 操作 | Gas 估算 | ETH (估算) |
|------|---------|-----------|
| 部署合约 | ~1,500,000 | ~0.003 ETH |
| 添加流动性 | ~200,000 | ~0.0004 ETH |
| **总计** | ~1,700,000 | ~0.0034 ETH |

💡 建议准备 **0.2 ETH** 作为 gas + 流动性资金

## ❓ 常见问题

### Q: 如何获取测试网 ETH？

**A:** 访问以下水龙头：
- Sepolia: https://sepoliafaucet.com/
- Base Sepolia: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet

### Q: 部署失败怎么办？

**A:** 常见原因和解决方法：
1. `insufficient funds` - 获取更多测试 ETH
2. `nonce too high` - 等待几分钟或重启 Replit
3. `network not supported` - 检查 `NETWORK` 配置

更多问题: [TOKEN_DEPLOYMENT.md](docs/TOKEN_DEPLOYMENT.md#常见问题)

### Q: 可以在主网部署吗？

**A:** 可以！但请注意：
1. 设置 `NETWORK=mainnet`
2. 确保钱包有足够 ETH (主网 gas 更贵)
3. **充分测试后再部署** - 主网部署不可逆
4. 考虑先在 Base 或 Arbitrum (L2) 部署 - gas 更低

### Q: 如何修改代币参数？

**A:** 编辑 `contracts/POIToken.sol`:
```solidity
// 修改供应量
uint256 public constant INITIAL_SUPPLY = 1_000_000_000 * 10**18;

// 修改名称/符号 (在构造函数中)
constructor() ERC20("Proof of Influence", "POI") { ... }
```

## 🛠️ 技术栈

- **Solidity 0.8.20** - 智能合约语言
- **Hardhat** - 开发框架
- **OpenZeppelin** - 安全合约库
- **Ethers.js v5** - 以太坊交互库
- **TypeScript** - 类型安全

## 📚 相关资源

- [Hardhat 文档](https://hardhat.org/docs)
- [OpenZeppelin 文档](https://docs.openzeppelin.com/)
- [Uniswap V2 文档](https://docs.uniswap.org/contracts/v2/overview)
- [Ethers.js 文档](https://docs.ethers.org/v5/)

## 🤝 贡献

如果你有改进建议：
1. Fork 项目
2. 创建 feature 分支
3. 提交 Pull Request

## 📄 许可证

MIT License - 详见 LICENSE 文件

---

**祝部署顺利！🚀**

如有问题，请查看 [完整文档](docs/TOKEN_DEPLOYMENT.md) 或提交 Issue。


