# API Documentation

**Technical Integration Guide for ProjectEX Platform**

---

## Introduction / 介绍

### English

This document provides an overview of the ProjectEX API architecture and integration capabilities. It outlines the structure for authentication, core endpoints, Web3 contract interfaces, SDK usage, and examples.

**Note**: This is a planning document. Detailed API specifications, endpoint documentation, and SDK references will be published as the platform evolves.

### 中文

本文档提供了 ProjectEX API 架构和集成功能的概览。它概述了身份验证、核心端点、Web3 合约接口、SDK 使用和示例的结构。

**注意**：这是一个规划文档。详细的 API 规范、端点文档和 SDK 参考将随着平台的发展而发布。

---

## Architecture Overview / 架构概览

### API Layers / API 层

```
┌─────────────────────────────────────┐
│  Client Applications                │
│  (Web, Mobile, Third-party)        │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│  REST API Layer                     │
│  - Authentication                   │
│  - Core Functions                   │
│  - Data Management                  │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│  Web3 Contract Layer                │
│  - Smart Contract Interfaces        │
│  - Blockchain Interactions          │
│  - Event Indexing                   │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│  Infrastructure Layer                │
│  - Database (PostgreSQL)            │
│  - Blockchain Networks              │
│  - Storage & Caching                │
└─────────────────────────────────────┘
```

---

## 1. Authentication & API Access / 身份验证与 API 访问

### Authentication Methods / 身份验证方法

#### English

**Supported Authentication:**

1. **Wallet Authentication** (Web3)
   - MetaMask, Coinbase Wallet, WalletConnect
   - Message signing for nonce verification
   - Session-based authentication

2. **OAuth Authentication** (Web2)
   - Replit Auth (Google OAuth)
   - Email-based accounts
   - Social login integration

3. **API Keys** (For Developers)
   - Developer API keys for programmatic access
   - Rate limiting and usage tracking
   - Scope-based permissions

**Authentication Flow:**

```
Client → Request Authentication
      → Receive Nonce/Challenge
      → Sign Message (Web3) or OAuth (Web2)
      → Submit Signed Message
      → Receive JWT Token
      → Use Token for API Requests
```

#### 中文

**支持的身份验证：**

1. **钱包身份验证**（Web3）
   - MetaMask、Coinbase Wallet、WalletConnect
   - 用于 nonce 验证的消息签名
   - 基于会话的身份验证

2. **OAuth 身份验证**（Web2）
   - Replit Auth（Google OAuth）
   - 基于邮箱的账户
   - 社交登录集成

3. **API 密钥**（面向开发者）
   - 用于程序化访问的开发者 API 密钥
   - 速率限制和使用追踪
   - 基于范围的权限

**身份验证流程：**

```
客户端 → 请求身份验证
      → 接收 Nonce/挑战
      → 签名消息（Web3）或 OAuth（Web2）
      → 提交签名消息
      → 接收 JWT 令牌
      → 使用令牌进行 API 请求
```

---

## 2. Endpoints for Core Functions / 核心功能端点

### API Categories / API 类别

#### English

**Planned Endpoint Categories:**

1. **User Management**
   - User registration and authentication
   - Profile management
   - Wallet linking
   - KYC/AML status

2. **Token Operations**
   - Token balance queries
   - Transfer operations
   - Token metadata
   - Transaction history

3. **Trading & Market**
   - Order placement and management
   - Market data and analytics
   - Liquidity information
   - Price feeds

4. **Incentives & Rewards**
   - Quest management
   - Reward distribution
   - Badge and achievement queries
   - Referral tracking

5. **Identity & Reputation**
   - Identity verification
   - Reputation scores
   - Badge queries
   - Achievement history

6. **Platform Data**
   - Analytics and statistics
   - Network information
   - Contract addresses
   - Event queries

#### 中文

**计划的端点类别：**

1. **用户管理**
   - 用户注册和身份验证
   - 档案管理
   - 钱包链接
   - KYC/AML 状态

2. **代币操作**
   - 代币余额查询
   - 转账操作
   - 代币元数据
   - 交易历史

3. **交易与市场**
   - 订单放置和管理
   - 市场数据和分析
   - 流动性信息
   - 价格源

4. **激励与奖励**
   - 任务管理
   - 奖励分配
   - 徽章和成就查询
   - 推荐追踪

5. **身份与声誉**
   - 身份验证
   - 声誉评分
   - 徽章查询
   - 成就历史

6. **平台数据**
   - 分析和统计
   - 网络信息
   - 合约地址
   - 事件查询

---

## 3. Web3 Contract Interfaces / Web3 合约接口

### Smart Contract Integration / 智能合约集成

#### English

**Contract Categories:**

1. **Token Contracts**
   - POI Token (ERC-20)
   - Custom token contracts
   - Token metadata and queries

2. **Trading Contracts**
   - DEX integration interfaces
   - Order matching contracts
   - Liquidity pool contracts

3. **Incentive Contracts**
   - Staking rewards
   - Vesting vaults
   - Airdrop distributors
   - Referral registries

4. **Identity Contracts**
   - Achievement badges (ERC-721)
   - Immortality badge
   - Reputation systems

**Integration Methods:**

- **Direct Contract Calls**: Using ethers.js or web3.js
- **SDK Wrappers**: Simplified SDK methods
- **Event Listening**: Real-time event subscriptions
- **Batch Operations**: Multi-contract interactions

#### 中文

**合约类别：**

1. **代币合约**
   - POI 代币（ERC-20）
   - 自定义代币合约
   - 代币元数据和查询

2. **交易合约**
   - DEX 集成接口
   - 订单匹配合约
   - 流动性池合约

3. **激励合约**
   - 质押奖励
   - 锁仓金库
   - 空投分发器
   - 推荐注册表

4. **身份合约**
   - 成就徽章（ERC-721）
   - 永生徽章
   - 声誉系统

**集成方法：**

- **直接合约调用**：使用 ethers.js 或 web3.js
- **SDK 包装器**：简化的 SDK 方法
- **事件监听**：实时事件订阅
- **批量操作**：多合约交互

---

## 4. SDK Usage / SDK 使用

### SDK Overview / SDK 概览

#### English

**Planned SDK Features:**

1. **Authentication SDK**
   - Wallet connection helpers
   - Session management
   - Token refresh

2. **API Client SDK**
   - Type-safe API calls
   - Request/response handling
   - Error management

3. **Web3 SDK**
   - Contract interaction helpers
   - Transaction building
   - Event subscription

4. **Utility SDK**
   - Data formatting
   - Validation helpers
   - Common utilities

**SDK Languages:**

- **JavaScript/TypeScript**: Primary SDK
- **Python**: For data analysis and automation
- **Rust**: For high-performance integrations
- **Go**: For backend services

#### 中文

**计划的 SDK 功能：**

1. **身份验证 SDK**
   - 钱包连接助手
   - 会话管理
   - 令牌刷新

2. **API 客户端 SDK**
   - 类型安全的 API 调用
   - 请求/响应处理
   - 错误管理

3. **Web3 SDK**
   - 合约交互助手
   - 交易构建
   - 事件订阅

4. **工具 SDK**
   - 数据格式化
   - 验证助手
   - 通用工具

**SDK 语言：**

- **JavaScript/TypeScript**：主要 SDK
- **Python**：用于数据分析和自动化
- **Rust**：用于高性能集成
- **Go**：用于后端服务

---

## 5. Examples & Tutorials / 示例与教程

### Example Use Cases / 示例用例

#### English

**Planned Tutorials:**

1. **Getting Started**
   - Setting up authentication
   - Making your first API call
   - Connecting a wallet

2. **Token Operations**
   - Querying token balance
   - Transferring tokens
   - Reading token metadata

3. **Trading Integration**
   - Placing orders
   - Querying market data
   - Managing positions

4. **Incentive Systems**
   - Creating quests
   - Distributing rewards
   - Tracking referrals

5. **Advanced Topics**
   - Batch operations
   - Event subscriptions
   - Error handling
   - Performance optimization

#### 中文

**计划的教程：**

1. **入门**
   - 设置身份验证
   - 进行第一次 API 调用
   - 连接钱包

2. **代币操作**
   - 查询代币余额
   - 转移代币
   - 读取代币元数据

3. **交易集成**
   - 下单
   - 查询市场数据
   - 管理仓位

4. **激励系统**
   - 创建任务
   - 分配奖励
   - 追踪推荐

5. **高级主题**
   - 批量操作
   - 事件订阅
   - 错误处理
   - 性能优化

---

## API Versioning / API 版本控制

### Version Strategy / 版本策略

#### English

- **Versioning**: `/api/v1/`, `/api/v2/`, etc.
- **Backward Compatibility**: Maintained for at least 2 major versions
- **Deprecation Policy**: 6-month notice before breaking changes
- **Migration Guides**: Provided for major version updates

#### 中文

- **版本控制**：`/api/v1/`、`/api/v2/` 等
- **向后兼容性**：至少保持 2 个主要版本
- **弃用政策**：重大更改前 6 个月通知
- **迁移指南**：为主要版本更新提供

---

## Rate Limiting / 速率限制

### Limits & Quotas / 限制与配额

#### English

- **Free Tier**: Basic rate limits for public access
- **Developer Tier**: Higher limits for API key holders
- **Enterprise Tier**: Custom limits for partners
- **Rate Limit Headers**: Included in all responses

#### 中文

- **免费层**：公共访问的基本速率限制
- **开发者层**：API 密钥持有者的更高限制
- **企业层**：合作伙伴的自定义限制
- **速率限制头**：包含在所有响应中

---

## Error Handling / 错误处理

### Error Response Format / 错误响应格式

#### English

**Standard Error Format:**

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {},
    "timestamp": "2025-01-17T12:00:00Z"
  }
}
```

**Error Codes:**

- `AUTH_REQUIRED`: Authentication needed
- `INVALID_INPUT`: Invalid request parameters
- `RATE_LIMIT_EXCEEDED`: Rate limit exceeded
- `CONTRACT_ERROR`: Smart contract interaction failed
- `NETWORK_ERROR`: Blockchain network error

#### 中文

**标准错误格式：**

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "人类可读的错误消息",
    "details": {},
    "timestamp": "2025-01-17T12:00:00Z"
  }
}
```

**错误代码：**

- `AUTH_REQUIRED`：需要身份验证
- `INVALID_INPUT`：无效的请求参数
- `RATE_LIMIT_EXCEEDED`：超过速率限制
- `CONTRACT_ERROR`：智能合约交互失败
- `NETWORK_ERROR`：区块链网络错误

---

## Security Considerations / 安全考虑

### Best Practices / 最佳实践

#### English

- **API Keys**: Store securely, never commit to version control
- **Authentication**: Always use HTTPS
- **Input Validation**: Validate all user inputs
- **Rate Limiting**: Respect rate limits
- **Error Messages**: Don't expose sensitive information

#### 中文

- **API 密钥**：安全存储，永远不要提交到版本控制
- **身份验证**：始终使用 HTTPS
- **输入验证**：验证所有用户输入
- **速率限制**：遵守速率限制
- **错误消息**：不要暴露敏感信息

---

## Future Development / 未来发展

### Planned Features / 计划功能

- **GraphQL API**: Alternative query interface
- **WebSocket Support**: Real-time data streaming
- **Webhook Integration**: Event notifications
- **OpenAPI Specification**: Complete API documentation
- **SDK Expansion**: Additional language support

---

## Getting Started / 开始使用

### Resources / 资源

- **Documentation**: [docs/API_INTEGRATION_GUIDE.md](../API_INTEGRATION_GUIDE.md)
- **Developer Portal**: Coming soon
- **Support**: contact@proofofinfluence.com
- **Community**: [Discord](https://discord.gg/proofofinfluence)

---

## Forward-Looking Statements / 前瞻性声明

This document outlines the planned API architecture. Actual implementation, endpoints, and features may differ based on development progress, technical requirements, and community feedback.

Detailed API specifications will be published as the platform evolves. This document serves as a roadmap and planning reference.

---

**Last Updated**: 2025-01-17  
**Version**: 1.0
