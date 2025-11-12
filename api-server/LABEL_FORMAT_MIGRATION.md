# GitHub 标签格式统一 - 迁移完成

## 📋 变更摘要

将 GitHub Issue 标签格式从 `@cursor` 统一改为 `ai:cursor`，并添加初始状态标签 `status:ready`。

**提交**: `650db8b` - fix(api): unify GitHub label format to ai: prefix and add status:ready

---

## 🔄 标签格式变更

### 修改前（不统一）

```typescript
// 创建任务
labels: ['ai:cursor']  // ❌ 没有初始状态

// 查询任务
labels: ['@cursor']    // ❌ 格式不一致

// 统计状态
labels: ['@cursor']    // ❌ 格式不一致
```

### 修改后（统一）

```typescript
// 创建任务
labels: ['ai:cursor', 'status:ready']  // ✅ 统一格式 + 初始状态

// 查询任务
labels: ['ai:cursor']  // ✅ 统一格式

// 统计状态
labels: ['ai:cursor']  // ✅ 统一格式
```

---

## ✅ 修改的文件

### 1. `api-server/github.ts` (3处修改)

#### 修改 1: 创建任务时添加初始状态（第 34 行）

```typescript
// 修改前
const labels = [`ai:${params.assignee}`];

// 修改后
const labels = [`ai:${params.assignee}`, 'status:ready'];
```

#### 修改 2: 查询任务时使用 ai: 前缀（第 85 行）

```typescript
// 修改前
if (params.assignee) {
  labels.push(`@${params.assignee}`);
}

// 修改后
if (params.assignee) {
  labels.push(`ai:${params.assignee}`);
}
```

#### 修改 3: 统计状态时使用 ai: 前缀（第 218 行）

```typescript
// 修改前
if (labels.includes(`@${ai}`)) {

// 修改后
if (labels.includes(`ai:${ai}`)) {
```

### 2. `api-server/README.md` (1处修改)

更新文档示例（第 157 行）：

```json
// 修改前
"labels": ["@cursor", "status:in-progress"]

// 修改后
"labels": ["ai:cursor", "status:in-progress"]
```

---

## 🎯 统一后的标签规范

### AI 分配标签
- `ai:cursor` - 分配给 Cursor AI
- `ai:codex` - 分配给 Codex AI
- `ai:replit` - 分配给 Replit AI

### 状态标签
- `status:ready` - 待处理（新建任务的初始状态）
- `status:in-progress` - 进行中
- `status:needs-review` - 需要审查
- `status:blocked` - 阻塞
- `status:done` - 完成

### 优先级标签
- `priority:low` - 低优先级
- `priority:medium` - 中优先级
- `priority:high` - 高优先级

### 组件标签
- `component:frontend` - 前端组件
- `component:backend` - 后端组件
- `component:contracts` - 智能合约

---

## 🚀 自动化工作流程

### 完整流程示例

```
1. Custom GPT 创建任务
   POST /api/tasks/create
   {
     "title": "实现用户登录",
     "assignee": "cursor",
     "priority": "high"
   }
   
   ↓ 创建 GitHub Issue
   标签: ['ai:cursor', 'status:ready', 'priority:high']
   
2. Slack 通知
   #cursor 频道: "📋 新任务 #42: 实现用户登录"
   
3. Cursor 查询待办任务
   调用 MCP: get_my_tasks({status: "ready"})
   查询标签: 'ai:cursor,status:ready'
   ✅ 成功找到任务 #42
   
4. Cursor 领取任务
   调用 MCP: update_task_status(42, "in-progress")
   标签变更: 'status:ready' → 'status:in-progress'
   
5. Cursor 完成开发
   调用 MCP: update_task_status(42, "needs-review")
   调用 MCP: add_task_comment(42, "@replit 请部署")
   调用 MCP: send_message_to_ai({toAI: "replit", ...})
   
6. Replit 查询需要部署的任务
   调用 MCP: get_my_tasks({status: "needs-review"})
   ✅ 成功找到任务 #42
   
7. Replit 完成部署
   调用 MCP: update_task_status(42, "done")
   ✅ 任务完成
```

---

## 📊 优势对比

| 特性 | 旧格式 (@cursor) | 新格式 (ai:cursor) |
|------|-----------------|-------------------|
| **一致性** | ❌ 不一致 | ✅ 统一 category:value |
| **可读性** | ⚠️ 易与 @mention 混淆 | ✅ 语义清晰 |
| **可编程性** | ⚠️ 难以批量操作 | ✅ 易于解析和过滤 |
| **扩展性** | ⚠️ 格式不统一 | ✅ 遵循标准模式 |
| **查询准确性** | ❌ 格式不匹配 | ✅ 100% 匹配 |

---

## ⚠️ 旧任务迁移

### 如果 GitHub 上有旧格式的任务

旧标签格式：`@cursor`, `@codex`, `@replit`

**选项 1**：手动更新旧任务标签
- 在 GitHub Issues 页面批量编辑标签
- 删除 `@cursor` 标签
- 添加 `ai:cursor` 和 `status:ready` 标签

**选项 2**：代码兼容旧格式（可选）
- 查询时同时搜索新旧格式
- 逐步自然淘汰旧格式

**建议**：新任务使用新格式，旧任务逐步关闭或手动更新

---

## ✅ 验证清单

- [x] 创建任务时添加 `status:ready` 标签
- [x] 查询任务时使用 `ai:` 前缀
- [x] 统计状态时使用 `ai:` 前缀
- [x] 更新文档示例
- [x] TypeScript 编译通过
- [x] 无 linter 错误
- [x] 代码已提交

---

## 🎉 完成

标签格式统一完成！现在所有 AI 自动化工作流都可以正确筛选和操作任务了。

**下一步**：
1. 推送到 GitHub: `git push origin dev`
2. 在 Replit 部署测试
3. 使用 Custom GPT 创建测试任务
4. 验证 MCP 工具能正确查询和操作任务

