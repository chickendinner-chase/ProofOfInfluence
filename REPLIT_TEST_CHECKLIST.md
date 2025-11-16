# Replit 测试检查清单

## 🚀 快速开始

### 1. 拉取最新代码

```bash
git checkout dev
git pull origin dev
```

### 2. 安装依赖

```bash
npm ci
```

### 3. 配置环境变量

在 Replit Secrets 中配置：
- `DATABASE_URL`
- `PRIVATE_KEY` 或 `DEPLOYER_PRIVATE_KEY`
- `BASE_SEPOLIA_RPC_URL`
- `POI_TOKEN_ADDRESS`
- 其他合约地址（见 `docs/ENV_VARIABLES.md`）

### 4. 运行数据库迁移

```bash
npm run db:push
```

### 5. 编译合约

```bash
npm run compile
```

### 6. 启动服务器

```bash
npm run dev
```

## ✅ 测试检查项

### API 测试
- [ ] `GET /api/airdrop/check?address=0x...` - 返回正确格式
- [ ] `POST /api/admin/airdrop/batch` - 批量创建成功
- [ ] 数据库记录正确插入

### 前端测试
- [ ] 访问 `http://localhost:5173/dashboard`
- [ ] VestingCard 显示正常
- [ ] AirdropCard 显示正常
- [ ] AllowlistCard 显示正常
- [ ] ReferralCard 显示正常

### 合约交互
- [ ] 连接钱包成功
- [ ] 可以读取合约数据
- [ ] 可以调用合约方法（需要钱包）

## 📝 测试命令

```bash
# 测试 Airdrop API
node scripts/test-airdrop-api-simple.js

# 测试合约（需要部署后）
node scripts/test-vesting.cjs
node scripts/test-airdrop.cjs
node scripts/test-early-bird.cjs
```

## 📚 详细文档

查看 `docs/REPLIT_TESTING.md` 获取完整测试指南。

