# Replit 快速设置指南

## 🎯 在 Replit 上开始测试

### 第一步：拉取代码

```bash
# 在 Replit Shell 中执行
git checkout dev
git pull origin dev
```

### 第二步：安装依赖

```bash
npm ci
```

### 第三步：配置 Secrets

在 Replit Secrets 中设置：

**必需的环境变量**:
```
DATABASE_URL=postgres://...
PRIVATE_KEY=0x...
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
POI_TOKEN_ADDRESS=0x...
VESTING_VAULT_ADDRESS=0xe4E695722C598CBa27723ab98049818b4b827924
MERKLE_AIRDROP_ADDRESS=0xa3ae789eA6409ab5F92a69EC41dbA1E6f3C57A2e
EARLY_BIRD_ALLOWLIST_ADDRESS=0x75D75a4870762422D85D275b22F5A87Df78b4852
```

**前端环境变量** (在 `.env` 文件中):
```
VITE_CHAIN_ID=84532
VITE_BASE_RPC_URL=https://sepolia.base.org
VITE_POI_ADDRESS=0x...
VITE_VESTING_VAULT_ADDRESS=0xe4E695722C598CBa27723ab98049818b4b827924
VITE_MERKLE_AIRDROP_ADDRESS=0xa3ae789eA6409ab5F92a69EC41dbA1E6f3C57A2e
VITE_EARLY_BIRD_ALLOWLIST_ADDRESS=0x75D75a4870762422D85D275b22F5A87Df78b4852
```

### 第四步：运行数据库迁移

```bash
npm run db:push
```

### 第五步：编译合约

```bash
npm run compile
```

### 第六步：启动服务器

```bash
npm run dev
```

## ✅ 验证步骤

1. **检查 API 是否运行**
   ```bash
   curl http://localhost:5000/api/airdrop/check?address=0x1234567890123456789012345678901234567890
   ```

2. **访问 Dashboard**
   - 打开 Replit Webview
   - 访问 `/dashboard` 路径
   - 检查所有 Card 组件是否显示

## 📋 测试清单

查看 `REPLIT_TEST_CHECKLIST.md` 获取完整测试清单。

## 📚 详细文档

- **完整测试指南**: `docs/REPLIT_TESTING.md`
- **环境变量配置**: `docs/ENV_VARIABLES.md`
- **前端环境变量**: `docs/ENV_VARIABLES_FRONTEND.md`
- **开发总结**: `docs/DEVELOPMENT_SUMMARY.md`

## 🐛 遇到问题？

1. 检查环境变量是否正确配置
2. 确保数据库连接正常
3. 查看服务器日志
4. 参考 `docs/REPLIT_TESTING.md` 中的"常见问题"部分

---

**准备好测试了！** 🚀

