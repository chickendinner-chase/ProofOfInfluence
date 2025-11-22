# API 集成指南 - 混合模式配置

## 🎯 当前状态（2025-11-10）

| 模块 | 后端状态 | 前端集成 | 推荐配置 |
|------|---------|---------|---------|
| **Market** | ✅ Codex 完成 | ✅ 已对接 | 使用真实 API |
| **Reserve Pool** | ⏳ Codex 开发中 | ✅ Mock 就绪 | 使用 Mock API |
| **Merchant** | ⏳ Codex 开发中 | ✅ Mock 就绪 | 使用 Mock API |

---

## 🔧 环境变量配置

### **方式 1: 分模块控制（推荐）**

创建 `.env.local` 文件：

```bash
# Market - 使用真实 API（Codex 已完成）
VITE_USE_MOCK_MARKET=false

# Reserve Pool - 使用 Mock API（等待 Codex）
VITE_USE_MOCK_RESERVE=true

# Merchant - 使用 Mock API（等待 Codex）
VITE_USE_MOCK_MERCHANT=true
```

**优点**:
- ✅ 灵活控制每个模块
- ✅ 已完成的模块用真实 API，未完成的用 Mock
- ✅ 逐步集成，降低风险

### **方式 2: 全局控制（简单）**

```bash
# 全部使用 Mock（开发/测试）
VITE_USE_MOCK_MARKET=true
VITE_USE_MOCK_RESERVE=true
VITE_USE_MOCK_MERCHANT=true

# 或全部使用真实 API（生产，等所有后端完成后）
VITE_USE_MOCK_MARKET=false
VITE_USE_MOCK_RESERVE=false
VITE_USE_MOCK_MERCHANT=false
```

### **方式 3: 不配置（使用默认值）**

如果不设置环境变量：
- **默认**: 全部使用 **Mock API**
- 适合快速开发和测试

---

## 🚀 使用场景

### **场景 A: 本地开发（当前推荐）**

`.env.local`:
```bash
VITE_USE_MOCK_MARKET=false   # Market 用真实API测试
VITE_USE_MOCK_RESERVE=true   # Reserve 等待Codex
VITE_USE_MOCK_MERCHANT=true  # Merchant 等待Codex
```

**效果**:
- ✅ Market 页面连接真实数据库
- ✅ Reserve Pool 显示 Mock 数据
- ✅ Merchant 显示 Mock 数据

### **场景 B: 纯前端开发（无需后端）**

`.env.local`:
```bash
VITE_USE_MOCK_MARKET=true
VITE_USE_MOCK_RESERVE=true
VITE_USE_MOCK_MERCHANT=true
```

**效果**:
- ✅ 所有模块用 Mock，无需启动后端
- ✅ 快速迭代 UI/UX
- ✅ 适合前端开发者独立工作

### **场景 C: 生产环境（所有后端完成后）**

`.env.production`:
```bash
VITE_USE_MOCK_MARKET=false
VITE_USE_MOCK_RESERVE=false
VITE_USE_MOCK_MERCHANT=false
```

**效果**:
- ✅ 所有模块连接真实 Codex 后端
- ✅ 真实数据库操作
- ✅ 生产级性能

---

## 🔄 Codex 后端完成进度追踪

### **Market API** ✅ 完成
- **分支**: `codex/develop-acee-projectex-backend-api`
- **文件**: `server/routes/market.ts` (502 行)
- **数据表**: `market_orders`, `market_trades`
- **端点**: 8/8 全部实现
- **状态**: ✅ 可用
- **配置**: `VITE_USE_MOCK_MARKET=false`

### **Reserve Pool API** ⏳ 开发中
- **分支**: 待Codex创建
- **预期文件**: `server/routes/reserve.ts`
- **预期表**: `fees_ledger`, `reserve_balances`, `reserve_actions`
- **端点**: 0/6 待实现
- **状态**: ⏳ 等待Codex
- **配置**: `VITE_USE_MOCK_RESERVE=true`

### **Merchant API** ⏳ 开发中
- **分支**: 待Codex创建
- **预期文件**: `server/routes/merchant.ts`
- **预期表**: `products`, `merchant_orders`, `tax_reports`
- **端点**: 0/11 待实现
- **状态**: ⏳ 等待Codex
- **配置**: `VITE_USE_MOCK_MERCHANT=true`

---

## 📝 快速检查清单

### 切换到 Market 真实 API

- [ ] Codex 已完成 `server/routes/market.ts`
- [ ] 数据库已迁移（`npm run db:push` in Replit）
- [ ] 后端服务正常运行
- [ ] `.env.local` 设置 `VITE_USE_MOCK_MARKET=false`
- [ ] 重启前端开发服务器（`npm run dev`）
- [ ] 测试订单创建、查询、取消功能
- [ ] 检查 DevTools Network 面板确认调用真实端点

### 验证 Reserve/Merchant 仍用 Mock

- [ ] `.env.local` 设置 `VITE_USE_MOCK_RESERVE=true`
- [ ] `.env.local` 设置 `VITE_USE_MOCK_MERCHANT=true`
- [ ] Reserve Pool 面板显示模拟数据
- [ ] Merchant Dashboard 显示模拟数据
- [ ] 控制台显示 "Reserve Pool: MOCK" 和 "Merchant: MOCK"

---

## 🐛 故障排查

### Market API 调用失败？

**检查**:
1. 后端服务是否运行？（Replit 或本地）
2. 环境变量是否正确？（`VITE_USE_MOCK_MARKET=false`）
3. 浏览器 DevTools Network 面板错误信息
4. Replit Console 后端日志

**临时方案**: 切换回 Mock
```bash
VITE_USE_MOCK_MARKET=true
```

### Reserve/Merchant 意外使用真实 API？

**检查**:
1. 环境变量拼写是否正确？
2. `.env.local` 文件是否在项目根目录？
3. 是否重启了开发服务器？

---

## 🔄 Codex 完成后的集成步骤

当 Codex 完成 Reserve Pool 或 Merchant 后：

### 步骤 1: 确认后端就绪
```bash
# 在 Replit 或本地
git pull origin [codex-branch-name]
npm run db:push
```

### 步骤 2: 更新环境变量
```bash
# .env.local
VITE_USE_MOCK_RESERVE=false  # 切换到真实API
```

### 步骤 3: 测试
```bash
npm run dev
```

### 步骤 4: 如有问题，快速回滚
```bash
VITE_USE_MOCK_RESERVE=true  # 切回Mock
```

---

## 📊 开发建议

### 前端开发者（Cursor）
- ✅ 继续用 Mock 开发UI/UX
- ✅ Market 可用真实 API 测试端到端
- ✅ Reserve/Merchant 等 Codex 完成

### 后端开发者（Codex）
- ✅ Market 已完成，可参考代码风格
- ⏳ 继续开发 Reserve Pool (优先级 3)
- ⏳ 然后开发 Merchant (优先级 5)

### 测试/QA
- 🧪 单元测试永远用 Mock
- 🔗 集成测试用混合模式
- 🚀 E2E 测试等所有真实 API 就绪

---

## 📞 联系与协调

### Cursor ↔ Codex
- **Cursor**: "Market UI 已对接真实API，测试正常 ✅"
- **Codex**: "Reserve Pool 开发中，预计[日期]完成"

### Codex 完成时通知 Cursor
```
"Reserve Pool API 已完成，请更新前端集成：
- 分支: feat/reserve-pool-backend
- 文件: server/routes/reserve.ts
- 测试: curl http://localhost:5000/api/reserve-pool"
```

### Cursor 集成完成后通知团队
```
"Reserve Pool 前端已集成真实API:
- 分支: feat/integrate-reserve-api
- 配置: VITE_USE_MOCK_RESERVE=false
- 测试: 访问 /app/dashboard → Reserve Pool 标签"
```

---

## ✨ 当前配置示例

**推荐配置（2025-11-10）**:

```bash
# .env.local
VITE_USE_MOCK_MARKET=false    # ✅ Market 真实API
VITE_USE_MOCK_RESERVE=true    # ⏳ 等待Codex  
VITE_USE_MOCK_MERCHANT=true   # ⏳ 等待Codex
```

**启动开发服务器**:
```bash
npm run dev
```

**控制台输出**:
```
[API] Market: REAL
[API] Reserve Pool: MOCK
[API] Merchant: MOCK
```

---

**逐步集成，稳步前进！🚀**

