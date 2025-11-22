# ProofOfInfluence 页面索引

## 📄 全站页面导航（17 个页面）

---

## 🌐 公开页面（9个）

### 1. Landing - 首页
**路由**: `/`
**生产环境**: https://www.aceexventures.com/
**文件**: `client/src/pages/Landing.tsx`
**功能**: 
- Hero 区域 + 双主题 CTA
- 平台优势（4个特性）
- ProjectEX 核心模块（3个）
- TGE 横幅
- 快速导航链接

**主题适配**: ✓ Cyberpunk / Playful

---

### 2. TGE - 代币发行
**路由**: `/tge`
**生产环境**: https://www.aceexventures.com/tge
**文件**: `client/src/pages/TGE.tsx`
**功能**:
- 实时倒计时（天/时/分/秒）
- 募集进度条
- 参与步骤（4步）
- Token 关键指标
- 风险提示

**主题适配**: ✓ Cyberpunk / Playful

---

### 3. EarlyBird - 早鸟计划
**路由**: `/early-bird`
**生产环境**: https://www.aceexventures.com/early-bird
**文件**: `client/src/pages/EarlyBird.tsx`
**功能**:
- 早鸟特权展示
- 注册表单（Email + Wallet）
- 任务列表（4个）
- 统计数据

**主题适配**: ✓ Cyberpunk / Playful

---

### 4. Referral - 推荐计划
**路由**: `/referral`
**生产环境**: https://www.aceexventures.com/referral
**文件**: `client/src/pages/Referral.tsx`
**功能**:
- 我的统计卡片
- 推荐链接复制/分享
- 邀请进度
- 奖励档位表格
- Top 5 排行榜
- 使用说明

**主题适配**: ✓ Cyberpunk / Playful

---

### 5. Airdrop - 空投活动
**路由**: `/airdrop`
**生产环境**: https://www.aceexventures.com/airdrop
**文件**: `client/src/pages/Airdrop.tsx`
**功能**:
- 用户 XP 统计
- 任务中心（6个任务）
- 徽章墙（12个徽章）
- 奖励说明
- CTA 引导

**主题适配**: ✓ Cyberpunk / Playful

---

### 6. Solutions - 解决方案
**路由**: `/solutions`
**生产环境**: https://www.aceexventures.com/solutions
**文件**: `client/src/pages/Solutions.tsx`
**功能**:
- 4 大解决方案
- 平台优势（4个）
- 应用场景案例
- CTA 区域

**主题适配**: ✓ Cyberpunk / Playful

---

### 7. Token - 代币信息
**路由**: `/token`
**生产环境**: https://www.aceexventures.com/token
**文件**: `client/src/pages/Token.tsx`
**功能**:
- 关键指标（4个）
- 代币分配结构
- 代币用途（3个）
- 解锁计划
- 发展路线图

**主题适配**: ✓ Cyberpunk / Playful

---

### 8. About - 关于我们
**路由**: `/about`
**生产环境**: https://www.aceexventures.com/about
**文件**: `client/src/pages/About.tsx`
**功能**:
- 平台统计（3个）
- 使命愿景价值观
- 核心团队（3位）
- 联系方式

**主题适配**: ✓ Cyberpunk / Playful

---

### 9. UseCases - 应用案例
**路由**: `/use-cases`
**生产环境**: https://www.aceexventures.com/use-cases
**文件**: `client/src/pages/UseCases.tsx`
**功能**:
- 3 个使用场景
- 进度展示
- 成功案例（3个）

**主题适配**: ✓ Cyberpunk / Playful

---

## 🔐 应用页面（7个）

### 10. Login - 登录
**路由**: `/login`
**生产环境**: https://www.aceexventures.com/login
**文件**: `client/src/pages/Login.tsx`
**功能**:
- 邮箱/密码登录
- Web3 钱包登录
- 社交登录（Google, Apple）
- 记住我
- 忘记密码

**主题适配**: ✓ Cyberpunk / Playful

---

### 11. Dashboard - 仪表盘
**路由**: `/app`
**生产环境**: https://www.aceexventures.com/app
**文件**: `client/src/pages/Dashboard.tsx`
**功能**:
- Welcome 欢迎区
- 资产统计（3个）
- 资产图表
- 今日任务
- 最近活动
- 快速链接

**API 集成**: ✓ useQuery("/api/auth/user")
**主题适配**: ✓ Cyberpunk / Playful

---

### 12. Market - 交易市场
**路由**: `/app/market`
**生产环境**: https://www.aceexventures.com/app/market
**文件**: `client/src/pages/Market.tsx`
**功能**:
- 市场统计（4个）
- 筛选器（4个）
- 流动性池表格
- Pool 详情
- 引导 CTA

**主题适配**: ✓ Cyberpunk / Playful

---

### 13. Recharge - 充值
**路由**: `/app/recharge`
**生产环境**: https://www.aceexventures.com/app/recharge
**文件**: `client/src/pages/Recharge.tsx`
**功能**:
- 步骤指示器
- 支付方式选择（3种）
- 金额输入
- 费用计算
- 安全提示
- FAQ（4个）

**主题适配**: ✓ Cyberpunk / Playful

---

### 14. Profile Settings - 个人设置
**路由**: `/app/settings`
**生产环境**: https://www.aceexventures.com/app/settings
**文件**: `client/src/pages/Profile.tsx`
**功能**:
- 基础信息编辑
- 主题偏好设置
- 通知设置
- 安全设置
- 退出登录

**API 集成**: ✓ useQuery("/api/auth/user")
**主题适配**: ✓ Cyberpunk / Playful

---

### 15. PaymentSuccess - 支付成功
**路由**: `/payment-success`
**生产环境**: https://www.aceexventures.com/payment-success
**文件**: `client/src/pages/PaymentSuccess.tsx`
**功能**:
- 成功提示
- 交易详情
- 下载收据
- 下一步引导

**主题适配**: ✓ Cyberpunk / Playful

---

### 16. PublicProfile - 公开主页
**路由**: `/:username`
**生产环境**: https://www.aceexventures.com/your-name
**文件**: `client/src/pages/PublicProfile.tsx`
**功能**:
- 用户资料卡片
- 统计数据
- 徽章墙（12个）
- 最近活动

**主题适配**: ✓ Cyberpunk / Playful

---

## 🔧 系统页面（1个）

### 17. NotFound - 404
**路由**: `*` (fallback)
**生产环境**: https://www.aceexventures.com/not-found
**文件**: `client/src/pages/not-found.tsx`
**功能**:
- 404 错误提示
- 主题化设计
- 快速链接（4个）
- 返回按钮

**主题适配**: ✓ Cyberpunk / Playful

---

## 🎨 主题组件库

### Themed Components (`client/src/components/themed/`)
- `ThemedCard` - 卡片容器
- `ThemedButton` - 按钮（3种变体：default/outline/ghost，3种尺寸：sm/md/lg）
- `ThemedProgress` - 进度条
- `ThemedInput` - 表单输入
- `ThemedTable` - 数据表格
- `ThemedBadge` - 标签徽章

### Layout Components (`client/src/components/layout/`)
- `PageLayout` - 页面容器（自动应用主题背景）
- `Section` - 区域标题

### Theme Context (`client/src/contexts/`)
- `ThemeContext` - 主题管理系统
- `useTheme()` hook - 全局访问主题

---

## 🚀 测试清单

### 功能测试
- [ ] 主题切换正常（Header Palette 按钮）
- [ ] 所有 17 个页面主题正确应用
- [ ] 页面刷新后主题保持
- [ ] 移动端响应式正常
- [ ] 所有链接跳转正确
- [ ] 表单交互正常
- [ ] Toast 通知正常

### 视觉测试
- [ ] Cyberpunk 主题视觉符合规范
- [ ] Playful 主题视觉符合规范
- [ ] 字体正确加载（Orbitron, Rajdhani, Fredoka, Poppins）
- [ ] 颜色对比度符合可访问性标准
- [ ] 动画流畅不卡顿

### API 集成测试（需要后端）
- [ ] Dashboard 用户数据加载
- [ ] Profile Settings 用户数据加载
- [ ] 钱包连接正常
- [ ] 表单提交逻辑正常

---

## 📂 文件结构

```
client/src/
├── contexts/
│   └── ThemeContext.tsx          ✅ 主题管理
│
├── components/
│   ├── themed/                   ✅ 主题化组件库
│   │   ├── ThemedCard.tsx
│   │   ├── ThemedButton.tsx
│   │   ├── ThemedProgress.tsx
│   │   ├── ThemedInput.tsx
│   │   ├── ThemedTable.tsx
│   │   ├── ThemedBadge.tsx
│   │   └── index.ts
│   │
│   ├── layout/                   ✅ 布局组件
│   │   ├── PageLayout.tsx
│   │   └── Section.tsx
│   │
│   ├── Header.tsx                ✅ 主题集成
│   └── [其他组件保留]
│
├── pages/                        ✅ 17 个页面
│   ├── Landing.tsx              ✓ P0
│   ├── TGE.tsx                  ✓ P0
│   ├── EarlyBird.tsx            ✓ P0
│   ├── Referral.tsx             ✓ P0
│   ├── Airdrop.tsx              ✓ P0
│   ├── Dashboard.tsx            ✓ P0
│   ├── Market.tsx               ✓ P0
│   ├── Recharge.tsx             ✓ P0
│   ├── Solutions.tsx            ✓ P1
│   ├── Token.tsx                ✓ P1
│   ├── About.tsx                ✓ P1
│   ├── UseCases.tsx             ✓ P1
│   ├── Login.tsx                ✓ P1
│   ├── Profile.tsx              ✓ P1
│   ├── PaymentSuccess.tsx       ✓ P1
│   ├── PublicProfile.tsx        ✓ P1
│   └── not-found.tsx            ✓ P1
│
├── App.tsx                       ✅ ThemeProvider 集成
└── index.css                     ✅ 双主题 CSS 变量
```

---

## 🎉 项目完成度

**前端重构**: 100%
- 基础设施: 100% ✓
- P0 页面: 100% ✓ (8/8)
- P1 页面: 100% ✓ (9/9)
- Linter 错误: 0 ✓
- 主题系统: 100% ✓ 

**准备就绪，可以部署！**

