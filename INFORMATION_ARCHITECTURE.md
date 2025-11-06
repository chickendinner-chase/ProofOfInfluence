# ACEE Ventures 网站信息架构实施文档

## 概述

本文档记录了 ACEE Ventures 网站信息架构的完整实施，包括所有页面、组件和访问控制逻辑。

## 实施日期

2025-11-06

## 页面结构

### 1. 首页 (Home) - `/`
**文件**: `client/src/pages/Landing.tsx`

**功能**:
- 展示公司定位和核心亮点
- 平台优势介绍（一站式服务、多角色支持、安全合规、生态增长）
- 快速导航到其他主要页面
- CTA（Call To Action）引导用户进入控制面板

**访问权限**: 公开访问

---

### 2. 产品 (Products) - `/products`
**文件**: `client/src/pages/Products.tsx`

**功能**:
- 产品模块概览（代币发行、质押挖矿、NFT 服务、治理平台、钱包管理、数据分析）
- 每个产品的详细功能介绍
- 集成与服务说明（安全审计、API 接入）

**访问权限**: 公开访问

---

### 3. 创作者专区 (For Creators) - `/for-creators`
**文件**: `client/src/pages/ForCreators.tsx`

**功能**:
- 针对创作者的服务介绍
- 创作者专属功能（发币、社区激励、专属福利、收益变现）
- 如何开始的步骤指南
- 成功案例展示

**访问权限**: 公开访问

---

### 4. 品牌专区 (For Brands) - `/for-brands`
**文件**: `client/src/pages/ForBrands.tsx`

**功能**:
- 针对品牌方的功能说明
- 行业解决方案（会员积分通证化、品牌 NFT 发行、去中心化营销）
- 合作流程介绍
- 成功案例展示

**访问权限**: 公开访问

---

### 5. 应用案例 (Use Cases) - `/use-cases`
**文件**: `client/src/pages/UseCases.tsx`

**功能**:
- 展示代币化和 RWA 的典型案例
- 分行业说明（房地产、艺术品、音乐版权、奢侈品、体育、股权融资、会员权益、碳信用）
- 每个案例包含实施场景和核心收益

**访问权限**: 公开访问

---

### 6. Token & 文档 (Token & Docs) - `/token-docs`
**文件**: `client/src/pages/TokenDocs.tsx`

**功能**:
- $POI 白皮书链接
- Tokenomics 说明链接
- GitBook 文档入口
- API 文档入口
- 资料下载
- 智能合约地址和官方渠道

**访问权限**: 公开访问

---

### 7. 合规 (Compliance) - `/compliance`
**文件**: `client/src/pages/Compliance.tsx`

**功能**:
- KYC/AML 流程说明
- 资金安全机制
- 费用与销毁规则
- 地域限制说明
- 风险提示
- 监管合规进展

**访问权限**: 公开访问

---

### 8. 更新日志 (Changelog) - `/changelog`
**文件**: `client/src/pages/Changelog.tsx`

**功能**:
- 功能更新记录
- 版本进展时间线
- GitHub 仓库链接
- 订阅更新通知

**访问权限**: 公开访问

---

### 9. 公司 (Company) - `/company`
**文件**: `client/src/pages/Company.tsx`

**功能**:
- 关于我们
- 使命与愿景
- 核心团队介绍
- 顾问团队
- 招聘信息
- 媒体报道
- 联系方式

**访问权限**: 公开访问

---

### 10. App Dashboard - `/dashboard`
**文件**: `client/src/pages/Dashboard.tsx`

**功能**:
- 统一的控制面板
- 根据用户身份动态显示功能模块
- 钱包管理、代币转账、质押收益等

**访问权限**: 
- ❌ 未登录用户: 需要连接钱包
- ✅ 已连接钱包: 可查看基础功能
- ✅ 已通过 KYC: 可查看全部功能（包括提现）

---

## 核心组件

### Header 组件
**文件**: `client/src/components/Header.tsx`

**功能**:
- 统一的顶部导航栏
- 响应式移动菜单
- 钱包连接按钮
- 多语言支持（中文/英文）
- 动态显示登录/控制面板按钮

---

### Footer 组件
**文件**: `client/src/components/Footer.tsx`

**功能**:
- 统一的页脚
- 链接到主要页面
- 公司信息
- 社交媒体链接
- 法律条款链接

---

## 访问控制系统

### useAccessControl Hook
**文件**: `client/src/hooks/useAccessControl.ts`

**功能**:
- 判断用户访问级别（guest, web3_connected, kyc_verified）
- 提供权限检查方法
- 返回用户能力标志（canAccessDashboard, canWithdraw, canTrade, canStake）

**使用示例**:
```typescript
import { useAccessControl } from "@/hooks/useAccessControl";

function MyComponent() {
  const access = useAccessControl();
  
  if (access.canWithdraw) {
    // 显示提现功能
  }
  
  return <div>...</div>;
}
```

---

### AccessGuard 组件
**文件**: `client/src/components/AccessGuard.tsx`

**功能**:
- 页面级别的访问保护
- 根据用户权限显示或隐藏内容
- 提供友好的访问拒绝提示

**使用示例**:
```typescript
import AccessGuard from "@/components/AccessGuard";

function ProtectedPage() {
  return (
    <AccessGuard requiredRole="web3_connected">
      <div>需要连接钱包才能看到的内容</div>
    </AccessGuard>
  );
}
```

---

### FeatureFlag 组件
**文件**: `client/src/components/FeatureFlag.tsx`

**功能**:
- 组件级别的功能开关
- 根据用户权限条件渲染功能
- 支持自定义 fallback 内容

**使用示例**:
```typescript
import FeatureFlag from "@/components/FeatureFlag";

function MyPage() {
  return (
    <div>
      <FeatureFlag 
        requiredRole="kyc_verified"
        fallback={<p>完成 KYC 后可使用此功能</p>}
      >
        <button>提现</button>
      </FeatureFlag>
    </div>
  );
}
```

---

## 访问权限矩阵

| 页面/功能 | 未登录访客 | 已连接钱包 | 已通过 KYC |
|----------|-----------|-----------|-----------|
| 首页、产品、创作者/品牌专区、应用案例、公司等 | ✅ | ✅ | ✅ |
| Token & Docs | ✅ | ✅ | ✅ |
| 合规 & 风险提示 | ✅ | ✅ | ✅ |
| App Dashboard | ❌ | ✅ (基础) | ✅ (全部) |
| KYC 申请 | ❌ | ✅ | ✅ |
| 交易、质押、合约交互 | ❌ | ✅ | ✅ |
| 充值 | ❌ | ✅ | ✅ |
| 提现（法币/USDC） | ❌ | ❌ | ✅ |

---

## 路由配置

所有路由在 `client/src/App.tsx` 中配置：

```typescript
{/* 信息架构路由 */}
<Route path="/" component={Landing} />
<Route path="/products" component={Products} />
<Route path="/for-creators" component={ForCreators} />
<Route path="/for-brands" component={ForBrands} />
<Route path="/use-cases" component={UseCases} />
<Route path="/token-docs" component={TokenDocs} />
<Route path="/compliance" component={Compliance} />
<Route path="/changelog" component={Changelog} />
<Route path="/company" component={Company} />

{/* 应用与仪表盘 */}
<Route path="/app" component={TradingApp} />
<Route path="/dashboard" component={Dashboard} />
<Route path="/profile" component={Profile} />

{/* 遗留路由（向后兼容） */}
<Route path="/whitepaper" component={Whitepaper} />
<Route path="/services" component={Services} />
<Route path="/tokenomics" component={Tokenomics} />
<Route path="/roadmap" component={Roadmap} />
```

---

## 技术栈

- **框架**: React 18 + TypeScript
- **路由**: Wouter
- **状态管理**: TanStack Query (React Query)
- **样式**: TailwindCSS + Shadcn UI
- **认证**: Replit Auth + MetaMask
- **图标**: Lucide React

---

## 设计原则

1. **移动优先**: 所有页面都采用响应式设计，从移动端开始适配
2. **一致性**: 使用统一的 Header、Footer 和设计语言
3. **渐进式增强**: 根据用户权限逐步解锁功能
4. **清晰的信息架构**: 明确区分"公司业务介绍"和"用户产品与体验"
5. **安全合规**: 关键功能需要 KYC 认证

---

## 下一步计划

1. **国际化 (i18n)**: 完整的英文版本支持
2. **深色/浅色主题**: 主题切换功能
3. **SEO 优化**: 添加元标签和结构化数据
4. **性能优化**: 代码分割和懒加载
5. **测试**: 添加单元测试和集成测试

---

## 维护说明

### 添加新页面
1. 在 `client/src/pages/` 创建新页面组件
2. 在 `client/src/App.tsx` 添加路由
3. 在 `client/src/components/Header.tsx` 添加导航链接
4. 在 `client/src/components/Footer.tsx` 添加页脚链接（如需要）

### 更新访问控制
1. 修改 `client/src/hooks/useAccessControl.ts` 添加新权限
2. 使用 `AccessGuard` 保护整个页面
3. 使用 `FeatureFlag` 保护页面内的特定功能

---

## 联系方式

如有技术问题或建议，请联系开发团队：
- 技术支持: support@acee.ventures
- GitHub: https://github.com/acee-ventures/platform

---

**文档版本**: 1.0
**最后更新**: 2025-11-06
