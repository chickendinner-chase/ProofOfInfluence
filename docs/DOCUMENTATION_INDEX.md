# 文档索引

本文档提供了 ProofOfInfluence 项目所有文档的索引和概览。

**最后更新**: 2025-11-17

---

## 📚 核心文档

### 架构和设计
- **ARCHITECTURE.md** - 系统架构文档（页面结构、API 规范、技术栈）
- **DESIGN_SYSTEM_GUIDE.md** - 设计系统指南
- **DESIGN_HANDOFF.md** - 设计交接文档

### 部署和测试
- **DEPLOYMENT_CHECKLIST.md** - 部署清单（✅ 已更新）
- **DEPLOYMENT_TEST_RESULTS.md** - 部署和测试结果（✅ 最新）
- **CONTRACT_TESTING.md** - 合约测试脚本使用指南
- **CONTRACT_TEST_SUMMARY.md** - 合约测试总结（✅ 已更新）
- **CONTRACT_ADDRESSES.md** - 合约地址清单（✅ 新建）

### 环境变量配置
- **ENV_VARIABLES.md** - 后端环境变量配置（✅ 已更新）
- **ENV_VARIABLES_FRONTEND.md** - 前端环境变量配置（✅ 已更新）

---

## 🔧 合约文档

### 已部署合约

- **contracts/POI.md** - POI Token 合约
- **contracts/StakingRewards.md** - 质押奖励合约
- **contracts/VestingVault.md** - 锁仓金库（✅ 已更新）
- **contracts/MerkleAirdropDistributor.md** - 空投分发（✅ 已更新）
- **contracts/EarlyBirdAllowlist.md** - 早鸟白名单（✅ 已更新）

### 已部署合约（全部）

- **contracts/TGESale.md** - TGE 销售合约 ✅
- **contracts/ReferralRegistry.md** - 推荐注册表 ✅
- **contracts/AchievementBadges.md** - 成就徽章 ✅
- **contracts/IMMORTALITY_BADGE.md** - 不朽徽章 ✅

---

## 📖 工作流程文档

- **GIT_WORKFLOW.md** - Git 工作流程
- **REPLIT_WORKFLOW.md** - Replit 部署流程
- **UNIFIED_CONTRACT_CALLS.md** - 统一合约调用规范

---

## 🛠️ 开发指南

- **SETUP.md** - 项目设置指南
- **API_INTEGRATION_GUIDE.md** - API 集成指南
- **TGE_COLD_START_IMPLEMENTATION.md** - TGE 冷启动实现

---

## 📋 合约审查

- **CONTRACT_REVIEW_CODEX_PR.md** - Codex 合约审查报告

---

## 📝 白皮书和策略

### 白皮书目录
- **whitepaper/README.md** - 白皮书索引
- **whitepaper/cyber-immortality/overview.md** - 网络不朽概述
- **whitepaper/value-internet.md** - 价值互联网
- **whitepaper/projectex/overview.md** - ProjectX 概述
- **whitepaper/poi/role-and-boundaries.md** - POI 角色和边界
- **whitepaper/roadmap/phases-2025-2030.md** - 路线图
- **whitepaper/glossary.md** - 术语表
- **whitepaper/legal/disclaimer.md** - 法律声明

### 策略文档
- **ACEE_Strategy_Bluebook_V1.md** - ACEE 战略蓝皮书
- **SUMMARY.md** - 项目总结

---

## 🔗 AgentKit 和集成

- **agentkit/OVERVIEW.md** - AgentKit 概览文档（配置、调试、API 说明）
- **agentkit/ACTIONS_CONTRACT_MAPPING.md** - AgentKit 操作和合约映射
- **IMMORTALITY_LEDGER.md** - 不朽账本

---

## 💬 协作工具

- **SLACK_COLLABORATION.md** - Slack 协作指南
- **SLACK_BOT_SETUP.md** - Slack Bot 设置
- **CUSTOM_GPT_SETUP.md** - 自定义 GPT 设置

---

## 📊 运营文档

- **ops/imm-staking-plan.md** - 不朽质押计划

---

## ✅ 最近更新 (2025-11-17)

### 已更新的文档
1. ✅ **PROJECT_STATUS_REPORT.md** - 添加智能合约前后端集成检查
2. ✅ **CONTRACT_ADDRESSES.md** - 合并所有已部署合约，更新状态
3. ✅ **CONTRACT_TEST_SUMMARY.md** - 添加所有9个合约的测试信息
4. ✅ **README.md** - 更新合约部署状态（全部9个已部署）
5. ✅ **DOCUMENTATION_INDEX.md** - 更新日期和合约状态

### 主要更新内容
- ✅ 所有9个智能合约已部署完成
- ✅ 前后端集成已完成（100%）
- ✅ 所有合约地址已在前端配置
- ✅ 环境变量文档已更新

---

## 🎯 快速查找

### 查找合约地址
→ 查看 **CONTRACT_ADDRESSES.md**

### 查找部署步骤
→ 查看 **DEPLOYMENT_CHECKLIST.md**

### 查找测试方法
→ 查看 **CONTRACT_TESTING.md**

### 查找环境变量配置
→ 查看 **ENV_VARIABLES.md** 或 **ENV_VARIABLES_FRONTEND.md**

### 查找合约接口
→ 查看 **contracts/** 目录下对应的合约文档

### 查找前端 hooks
→ 查看代码 `client/src/hooks/useVestingVault.ts`, `useAirdrop.ts`, `useAllowlist.ts`

---

## 📞 相关链接

- **GitHub**: [项目仓库]
- **部署网络**: Base Sepolia (Chain ID: 84532)
- **区块浏览器**: https://sepolia.basescan.org

---

**维护者**: Development Team  
**文档版本**: 2.1

