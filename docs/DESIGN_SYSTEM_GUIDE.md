# ProofOfInfluence 设计系统指南

**架构完成者:** Cursor AI  
**视觉设计待完成者:** 其他 AI  
**日期:** 2025-11-13

---

## 📊 新架构概览

### 页面整合结果

**从 26 个页面 → 17 个页面**

| 旧页面 (已删除) | 新页面 (已整合) |
|----------------|---------------|
| Products, ForCreators, ForBrands | `/solutions` |
| TokenDocs, Whitepaper, Tokenomics, Services, Roadmap | `/token` |
| Company, Compliance, Changelog | `/about` |

---

## 🎨 双设计系统

### ACEE 赛博朋克 2077 + 金融高冷风

**配置文件:** `client/src/styles/cyberpunk-theme.ts`

**视觉特征:**
- 深色背景 (#0a0a0f, #1a1a24)
- 霓虹色彩 (cyan, purple, pink)
- 网格线背景效果
- 扫描线动画
- 锐利边角 (rounded-sm)
- 玻璃态效果 (backdrop-blur)
- 发光效果 (neon glow)

**字体:**
- 标题: font-orbitron
- 正文: font-rajdhani, Inter
- 代码: font-mono

**动画:**
- animate-neon-pulse
- animate-matrix-scroll
- animate-scan-line
- animate-glitch

**应用到以下页面:**
1. `/` - Landing (除 ProjectEX 模块外)
2. `/solutions` - 解决方案 (已应用)
3. `/token` - Token 文档 (已应用)
4. `/about` - 关于我们 (已应用)
5. `/use-cases` - 应用案例
6. `/tge` - TGE 启动
7. `/early-bird` - 早鸟空投
8. `/referral` - 推荐计划
9. `/airdrop` - 空投领取
10. `/login` - 登录
11. `/:username` - 公开个人主页

---

### ProjectEX Roblox 风格

**配置文件:** `client/src/styles/roblox-theme.ts`

**视觉特征:**
- 明亮背景 (white, #f5f5f8)
- 鲜艳色块 (蓝、绿、黄、紫)
- 圆角卡片 (rounded-2xl, rounded-3xl)
- 3D 按钮效果 (shadow-[0_4px_0_...])
- 游戏化元素 (徽章、进度条、奖杯)
- 积木感布局

**字体:**
- 标题: font-fredoka, font-poppins
- 正文: font-poppins, Inter
- 数据: font-mono

**动画:**
- animate-bounce-click
- animate-pop-in
- animate-wiggle
- animate-float
- animate-shimmer

**应用到以下页面:**
1. `/app` - Dashboard
2. `/app/market` - 交易市场
3. `/app/settings` - 个人设置
4. `/app/recharge` - 充值
5. `/payment-success` - 支付成功
6. `/` - Landing 的 ProjectEX 模块部分

---

## 📁 当前页面清单

### 核心页面 (17个)

#### 公开营销页面 (11个) - **ACEE 赛博朋克风格**
1. `/` - Landing
2. `/solutions` - 解决方案 ✅ (已应用赛博朋克)
3. `/use-cases` - 应用案例 (待重新设计)
4. `/token` - Token 文档 ✅ (已应用赛博朋克)
5. `/about` - 关于我们 ✅ (已应用赛博朋克)
6. `/tge` - TGE 启动 (待重新设计)
7. `/early-bird` - 早鸟空投 (待重新设计)
8. `/referral` - 推荐计划 (待重新设计)
9. `/airdrop` - 空投领取 (待重新设计)
10. `/login` - 登录 (待重新设计)
11. `/:username` - 公开个人主页 (待重新设计)

#### 应用内页面 (5个) - **ProjectEX Roblox 风格**
12. `/app` - Dashboard (待重新设计)
13. `/app/market` - 交易市场 (待重新设计)
14. `/app/settings` - 个人设置 (待重新设计)
15. `/app/recharge` - 充值 (待重新设计)
16. `/payment-success` - 支付成功 (待重新设计)

#### 系统页面
17. `/not-found` - 404

---

## 🔗 路由重定向

所有旧路由都已配置重定向到新页面：

```typescript
/products → /solutions
/for-creators → /solutions
/for-brands → /solutions
/token-docs → /token
/whitepaper → /token
/tokenomics → /token
/services → /token
/roadmap → /token
/company → /about
/compliance → /about
/changelog → /about
```

---

## 🎯 设计任务分配

### 需要重新设计的页面（视觉设计）

#### ACEE 赛博朋克风格 (8个待设计)
1. **Landing** - 主页（保留 ProjectEX 模块为 Roblox 风格）
   - Hero 部分：赛博朋克
   - TGE 横幅：赛博朋克
   - 统计条：赛博朋克
   - 快速开始：赛博朋克
   - **ProjectEX 模块：Roblox 风格**（保留）
   
2. **TGE** - TGE 启动页
   - 倒计时：霓虹数字显示
   - 网格背景
   - 扫描线效果
   
3. **EarlyBird** - 早鸟空投
   - 任务列表：赛博朋克卡片
   - 进度条：霓虹效果
   
4. **Referral** - 推荐计划
   - 推荐链接：发光输入框
   - 排行榜：矩阵风格
   
5. **Airdrop** - 空投领取
   - 资格检查：霓虹状态指示
   - 安全警告：红色霓虹边框
   
6. **UseCases** - 应用案例
   - 案例卡片：玻璃态效果
   
7. **Login** - 登录
   - 钱包连接：霓虹按钮
   
8. **PublicProfile** - 公开主页
   - 个人卡片：赛博朋克风格

#### ProjectEX Roblox 风格 (4个待设计)
1. **Dashboard** - 仪表板
   - 任务卡片：圆角+3D阴影
   - 奖励显示：彩色积分徽章
   - 游戏化进度条
   
2. **Market** - 交易市场
   - 图表：明亮色彩
   - 订单卡片：圆角积木风
   - 按钮：3D 弹跳效果
   
3. **Profile Settings** - 设置
   - 表单：友好的圆角
   - 头像：可爱的圆形
   
4. **Recharge** - 充值
   - 套餐卡片：彩色渐变
   - 支付按钮：游戏风格

---

## 🛠️ Tailwind 配置

**已添加的自定义配置:**

### 颜色
```typescript
neon: { cyan, purple, pink, green, yellow, red }
roblox: { blue, green, yellow, red, purple, orange, pink, cyan }
```

### 字体
```typescript
font-orbitron, font-rajdhani  // Cyberpunk
font-fredoka, font-poppins    // Roblox
```

### 动画
```typescript
// Cyberpunk
animate-matrix-scroll, animate-neon-pulse, animate-scan-line, animate-glitch

// Roblox
animate-bounce-click, animate-pop-in, animate-wiggle, animate-shimmer, animate-float
```

---

## 📝 设计实施清单

### 待其他 AI 完成的视觉设计任务

#### ACEE 赛博朋克页面 (优先级排序)

- [ ] **P1: Landing 页面重新设计**
  - 文件: `client/src/pages/Landing.tsx`
  - 任务: 应用赛博朋克风格，但保留 ProjectEX 模块的 Roblox 风格
  
- [ ] **P1: TGE 冷启动页面重新设计 (4个)**
  - `client/src/pages/TGE.tsx`
  - `client/src/pages/EarlyBird.tsx`
  - `client/src/pages/Referral.tsx`
  - `client/src/pages/Airdrop.tsx`
  - 任务: 统一应用赛博朋克风格（霓虹、网格、扫描线）
  
- [ ] **P2: UseCases 页面重新设计**
  - 文件: `client/src/pages/UseCases.tsx`
  - 任务: 赛博朋克案例展示
  
- [ ] **P3: Login 和 PublicProfile**
  - `client/src/pages/Login.tsx`
  - `client/src/pages/PublicProfile.tsx`

#### ProjectEX Roblox 页面

- [ ] **P1: Dashboard 重新设计**
  - 文件: `client/src/pages/Dashboard.tsx`
  - 组件: `client/src/components/TaskCenterWidget.tsx`, `RewardsSummaryWidget.tsx`
  - 任务: 应用 Roblox 风格（明亮、圆角、3D 效果）
  
- [ ] **P1: Market 重新设计**
  - 文件: `client/src/pages/Market.tsx`
  - 组件: `client/src/components/TradingChart.tsx`
  - 任务: Roblox 风格交易界面
  
- [ ] **P2: Profile Settings**
  - 文件: `client/src/pages/Profile.tsx`
  
- [ ] **P2: Recharge**
  - 文件: `client/src/pages/Recharge.tsx`

---

## 🎨 设计参考

### Cyberpunk 元素示例

```tsx
// 网格背景
<div className="absolute inset-0 bg-[length:40px_40px] opacity-20"
  style={{
    backgroundImage: 'linear-gradient(rgba(0, 240, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 0.1) 1px, transparent 1px)'
  }}
/>

// 霓虹文字
<h1 className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink animate-neon-pulse">
  标题文字
</h1>

// 赛博朋克卡片
<Card className="bg-[#1a1a24]/80 border border-neon-cyan/20 rounded-sm hover:border-neon-cyan/50 backdrop-blur-sm">
  内容
</Card>

// 霓虹按钮
<Button className="bg-neon-cyan text-black hover:bg-neon-cyan/90 shadow-[0_0_20px_rgba(0,240,255,0.3)]">
  按钮文字
</Button>
```

### Roblox 元素示例

```tsx
// 游戏卡片
<Card className="bg-white rounded-2xl p-6 shadow-[0_8px_0_rgba(0,0,0,0.1)] hover:shadow-[0_4px_0_rgba(0,0,0,0.1)] hover:translate-y-[4px]">
  内容
</Card>

// 3D 按钮
<Button className="bg-roblox-blue text-white rounded-xl px-6 py-3 font-bold shadow-[0_4px_0_#0052cc] hover:shadow-[0_2px_0_#0052cc] hover:translate-y-[2px] active:translate-y-[4px]">
  按钮
</Button>

// 彩色徽章
<Badge className="bg-roblox-yellow/20 text-yellow-700 border-2 border-yellow-300 rounded-full px-3 py-1 font-bold">
  +10 POI
</Badge>

// 进度条
<div className="bg-gray-200 rounded-full h-4 border-2 border-gray-300">
  <div className="bg-gradient-to-r from-roblox-blue to-roblox-purple h-full rounded-full w-[60%]" />
</div>
```

---

## 📋 导航菜单更新

### Header 新菜单结构

**主导航:**
- 首页 (/)
- 现货交易 (/app/market)
- RWA市场 (/app)
- ProjectEX (/solutions)

**资源下拉菜单:**
- 解决方案 (/solutions)
- 应用案例 (/use-cases)
- Token 文档 (/token)
- 关于我们 (/about)
- TGE 启动 (/tge)
- 早鸟空投 (/early-bird)

---

## 🔄 重定向配置

所有旧路由已配置自动重定向：

```typescript
/products → /solutions
/for-creators → /solutions
/for-brands → /solutions
/token-docs → /token
/whitepaper → /token
/tokenomics → /token
/services → /token
/roadmap → /token
/company → /about
/compliance → /about
/changelog → /about
```

**实现方式:** 在 App.tsx 中使用 `window.location.href` 重定向

---

## 🎯 视觉设计待办清单

### 高优先级 (P1)

#### ACEE 赛博朋克风格
- [ ] Landing 页面
  - Hero 部分改为赛博朋克
  - TGE 横幅改为霓虹风格
  - 统计条改为赛博朋克
  - **保留 ProjectEX 模块的 Roblox 风格**
  
- [ ] TGE 页面
  - 倒计时改为霓虹数字
  - 添加网格背景
  - 添加扫描线效果
  - 霓虹色卡片
  
- [ ] EarlyBird 页面
  - 任务卡片改为玻璃态
  - 进度条改为霓虹效果
  - 统计卡片改为赛博朋克
  
- [ ] Referral 页面
  - 推荐链接输入框改为霓虹边框
  - 排行榜改为矩阵风格
  - 奖励规则改为赛博朋克卡片
  
- [ ] Airdrop 页面
  - 资格状态改为霓虹指示器
  - 安全警告改为红色霓虹
  - 领取按钮改为发光效果

#### ProjectEX Roblox 风格
- [ ] Dashboard
  - TaskCenterWidget 改为彩色圆角卡片
  - RewardsSummaryWidget 改为游戏风格
  - 整体布局改为明亮主题
  
- [ ] Market
  - 图表改为明亮配色
  - 订单卡片改为 3D 积木风
  - 按钮改为弹跳效果

### 中优先级 (P2)
- [ ] UseCases - 赛博朋克案例展示
- [ ] Profile Settings - Roblox 表单风格
- [ ] Recharge - Roblox 套餐卡片
- [ ] Login - 赛博朋克登录界面
- [ ] PublicProfile - 赛博朋克个人卡片

---

## 💡 设计建议

### 对于 ACEE 页面
1. 使用深色背景 `bg-[#0a0a0f]`
2. 所有卡片使用 `bg-[#1a1a24]/80 border-neon-cyan/20 rounded-sm`
3. 标题使用 `font-orbitron`
4. 添加网格背景到每个 section
5. 按钮使用霓虹色和发光效果
6. 使用 `backdrop-blur-sm` 创建玻璃态

### 对于 ProjectEX 页面
1. 使用明亮背景 `bg-white` 或 `bg-gray-50`
2. 卡片使用 `rounded-2xl` 和 3D 阴影
3. 标题使用 `font-fredoka` 或 `font-poppins`
4. 按钮使用 3D 按压效果
5. 多用彩色渐变
6. 添加游戏化元素（徽章、奖杯、进度条）

---

## 🚀 下一步

### 架构部分 (Cursor AI 已完成)
- ✅ 创建设计系统配置
- ✅ 整合页面到 3 个新页面
- ✅ 配置路由和重定向
- ✅ 更新导航菜单
- ✅ 删除旧文件
- ✅ Tailwind 配置更新

### 视觉设计部分 (待其他 AI 完成)
- ⏳ 应用赛博朋克风格到 ACEE 页面
- ⏳ 应用 Roblox 风格到 ProjectEX 页面
- ⏳ 添加自定义字体
- ⏳ 优化动画效果
- ⏳ 响应式测试

---

## 📚 参考资源

### Tailwind Classes 速查

**Cyberpunk:**
```
bg-[#0a0a0f], bg-[#1a1a24]
text-neon-cyan, text-neon-purple, text-neon-pink
border-neon-cyan/20, border-neon-cyan/50
font-orbitron, font-rajdhani
rounded-sm
backdrop-blur-sm, backdrop-blur-md
shadow-[0_0_20px_rgba(0,240,255,0.3)]
animate-neon-pulse, animate-scan-line
```

**Roblox:**
```
bg-white, bg-gray-50
text-roblox-blue, text-roblox-green
border-2, border-4, border-b-8
font-fredoka, font-poppins
rounded-2xl, rounded-3xl
shadow-[0_8px_0_rgba(0,0,0,0.1)]
animate-bounce-click, animate-float, animate-wiggle
```

---

## 📞 协作说明

**Cursor AI 负责:**
- ✅ 架构和路由
- ✅ 页面整合
- ✅ 设计系统配置
- ✅ 功能实现

**其他 AI 负责:**
- ⏳ 视觉设计实施
- ⏳ 颜色和图片优化
- ⏳ 动画效果调整
- ⏳ 字体导入和配置
- ⏳ 响应式优化

---

**架构已就绪，可以开始视觉设计了！** 🎨

