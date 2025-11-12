# 工作流自动化工具 - 使用指南

## 🎉 新增的工作流工具（3个）

### 1. `claim_task` - 领取指定任务

**功能**：领取并开始处理指定的任务

**使用方式**：
```
你: "领取任务 #42"
Cursor 调用: claim_task({taskId: 42})
```

**自动执行**：
- ✅ 更新任务状态：ready → in-progress
- ✅ 添加评论："🤖 CURSOR AI 开始处理此任务"
- ✅ Slack 通知状态变更

**适用场景**：
- 明确知道要处理哪个任务
- 需要跳过某些任务
- 领取特定的高优先级任务

---

### 2. `start_my_work` - 自动开始工作 ⭐

**功能**：自动查询并开始第一个待处理任务（推荐）

**使用方式**：
```
你: "开始工作"
Cursor 调用: start_my_work()
```

**自动执行**：
1. ✅ 查询 status:ready 的任务
2. ✅ 选择第一个任务
3. ✅ 更新状态为 in-progress
4. ✅ 添加开始工作的评论
5. ✅ Slack 通知
6. ✅ 返回任务详情

**返回信息**：
- 任务 ID
- 任务标题
- 任务 URL

**适用场景**：
- 日常开始工作
- 按优先级顺序处理任务
- 一键开始工作流

---

### 3. `complete_and_handoff` - 完成并交接 ⭐

**功能**：完成当前任务并交接给下一个 AI

**使用方式**：
```
你: "完成并交接给 Replit"
Cursor 调用: complete_and_handoff({nextAI: "replit"})

你: "完成任务 #42 并交接给 Codex，告诉他需要审查代码"
Cursor 调用: complete_and_handoff({
  taskId: 42,
  nextAI: "codex", 
  message: "请审查代码质量和安全性"
})
```

**自动执行**：
1. ✅ 自动检测当前 in-progress 任务（或使用指定的 taskId）
2. ✅ 更新状态为 needs-review
3. ✅ 添加完成评论并 @提及下一个 AI
4. ✅ Slack 通知下一个 AI
5. ✅ 通知协调频道任务交接

**参数**：
- `nextAI`（必需）：cursor | codex | replit
- `taskId`（可选）：不提供则自动查找当前任务
- `message`（可选）：给下一个 AI 的留言

**适用场景**：
- 开发完成，交给 Replit 部署
- 代码审查完成，交给 Cursor 修改
- 部署完成，任务结束

---

## 🚀 完整工作流示例

### 场景 1：Cursor 开发 → Replit 部署

```
# 步骤 1：开始工作
你: "开始工作"
Cursor: [调用 start_my_work()]
Cursor: "✅ 已开始任务 #42: 实现用户登录功能"

# 步骤 2：Cursor 进行开发
[Cursor 编写代码、提交代码...]

# 步骤 3：完成并交接
你: "完成并交接给 Replit"
Cursor: [调用 complete_and_handoff({nextAI: "replit"})]
Cursor: "✅ 任务 #42 已完成，已通知 Replit"

# 步骤 4：Replit 收到 Slack 通知
[Slack #replit 频道显示："🔔 Cursor 完成了任务 #42..."]

# 步骤 5：Replit 开始部署
你对 Replit 说: "开始工作"
Replit: [调用 start_my_work()]
Replit: "✅ 已开始任务 #42: 实现用户登录功能"
```

### 场景 2：领取特定任务

```
你: "查询我的任务"
Cursor: [调用 get_my_tasks()]
Cursor: "你有 3 个待处理任务：
  - #42: 实现登录功能 (high)
  - #43: 优化数据库 (medium)
  - #44: 更新文档 (low)"

你: "领取高优先级的任务 #42"
Cursor: [调用 claim_task({taskId: 42})]
Cursor: "✅ 已领取任务 #42: 实现登录功能"
```

### 场景 3：带留言的交接

```
你: "完成并交接给 Codex，让他审查代码安全性和性能"
Cursor: [调用 complete_and_handoff({
  nextAI: "codex",
  message: "请重点审查：1. SQL 注入风险 2. 密码加密 3. 查询性能"
})]
Cursor: "✅ 任务已完成并交接给 Codex"

# Codex 收到的 Slack 通知会包含这条留言
```

---

## 📊 工具对比

| 操作 | 旧方式（多步） | 新方式（一键） | 节省步骤 |
|------|-------------|--------------|---------|
| **开始工作** | get_my_tasks()<br>update_task_status(42, "in-progress")<br>add_task_comment(42, "开始") | start_my_work() | 减少 67% |
| **完成交接** | update_task_status(42, "needs-review")<br>add_task_comment(42, "@replit")<br>send_message_to_ai({toAI: "replit"})<br>notify_task_complete(...) | complete_and_handoff({nextAI: "replit"}) | 减少 75% |

---

## 🎯 工具层次结构

### 基础工具（保留）
- `get_my_tasks` - 查询任务
- `list_tasks` - 列出所有任务
- `update_task_status` - 更新状态
- `add_task_comment` - 添加评论
- `send_message_to_ai` - 发消息

### 工作流工具（新增）
- `claim_task` - 领取指定任务
- `start_my_work` - 自动开始工作 ⭐
- `complete_and_handoff` - 完成并交接 ⭐

**设计理念**：
- 基础工具提供灵活性
- 工作流工具提供便捷性
- 两者可以混合使用

---

## 🔧 技术实现

### tools.ts 新增方法

```typescript
class CollaborationTools {
  // 领取指定任务
  async claimTask(ai: AIIdentity, taskId: number) {
    const task = await this.github.getTask(taskId);
    await this.github.updateTaskStatus(taskId, "in-progress");
    await this.github.addComment(taskId, `🤖 ${ai.toUpperCase()} AI 开始处理此任务`);
    if (this.slack) {
      await this.slack.notifyTaskStatusUpdate(...);
    }
    return { taskId, title: task.title, status: "in-progress" };
  }

  // 自动开始工作
  async startMyWork(ai: AIIdentity) {
    const readyTasks = await this.github.listTasks({
      assignee: ai,
      status: "ready",
      state: "open",
    });
    if (readyTasks.length === 0) {
      return { started: false, message: "No ready tasks" };
    }
    const task = readyTasks[0];
    await this.claimTask(ai, task.number);
    return { started: true, task: {...} };
  }

  // 完成并交接
  async completeAndHandoff(ai: AIIdentity, params: {...}) {
    let taskId = params.taskId;
    if (!taskId) {
      // 自动查找 in-progress 任务
      const inProgressTasks = await this.github.listTasks({
        assignee: ai,
        status: "in-progress",
        state: "open",
      });
      taskId = inProgressTasks[0].number;
    }
    const task = await this.github.getTask(taskId);
    await this.github.updateTaskStatus(taskId, "needs-review");
    await this.github.addComment(taskId, `✅ ${ai} 已完成工作\n\n@${params.nextAI} ${params.message}`);
    if (this.slack) {
      await this.slack.sendToChannel(params.nextAI, ...);
      await this.slack.sendToChannel("coordination", ...);
    }
    return { success: true, taskId, ... };
  }
}
```

---

## ✅ 测试清单

### 本地测试（需要重启 Cursor）

- [ ] 重启 Cursor
- [ ] 调用 `start_my_work` 开始任务
- [ ] 调用 `claim_task` 领取指定任务
- [ ] 调用 `complete_and_handoff` 完成并交接

### 服务器部署

- [ ] 推送代码到 GitHub
- [ ] Replit 拉取最新代码
- [ ] 重启 API Server
- [ ] 测试 HTTP MCP 端点

---

## 🎉 现在可用的完整工具集

### GitHub 任务管理（6+3 = 9个）
1. `create_task` - 创建任务
2. `get_my_tasks` - 查询我的任务
3. `list_tasks` - 列出所有任务
4. `update_task_status` - 更新状态
5. `add_task_comment` - 添加评论
6. `get_project_status` - 项目状态
7. **`claim_task`** - 领取任务 🆕
8. **`start_my_work`** - 开始工作 🆕⭐
9. **`complete_and_handoff`** - 完成交接 🆕⭐

### Slack 通知（4个）
10. `notify_task_complete` - 完成通知
11. `notify_task_status` - 状态通知
12. `notify_deployment` - 部署通知
13. `notify_commit` - 提交通知

### AI 通信（3个）
14. `send_message_to_ai` - 发消息
15. `broadcast_to_coordination` - 广播
16. `send_slack_message` - 自定义消息

**总计：16 个 MCP 工具** 🎯

---

## 🚀 下一步

1. **重启 Cursor**
2. **测试新工具**：
   ```
   你: "开始工作"
   你: "完成并交接给 Replit"
   ```
3. **推送到 GitHub**：`git push origin dev`
4. **Replit 部署**：拉取并重启服务器
5. **端到端测试**：完整的 GPT → Cursor → Replit 工作流

---

**🎊 工作流自动化工具已就绪！**

