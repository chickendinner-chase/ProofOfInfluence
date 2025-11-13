# Slack 通知流程完整指南

## 📊 当前的 Slack 通知覆盖情况

### ✅ 已实现的 Slack 通知

#### 1. 任务创建时（`createTask`）

**触发**：Custom GPT 创建任务

**Slack 通知**：
- 📍 **AI 专属频道**（#cursor / #codex / #replit）
  ```
  📋 新任务 #42
  **实现用户登录功能**
  分配给：cursor
  优先级：high
  描述：...
  ```

- 📍 **协调频道**（#coordination）
  ```
  ✅ 任务 #42 已创建并分配给 cursor
  ```

---

#### 2. AI 领取任务时（`claimTask` / `start_my_work`）

**触发**：AI 调用 start_my_work 或 claim_task

**Slack 通知**：
- 📍 **AI 专属频道**（领取任务的 AI）
  ```
  🤖 你已领取任务 #42
  状态：ready → in-progress
  ```

- 📍 **协调频道**（#coordination）
  ```
  🚀 CURSOR 开始工作
  任务：#42 实现用户登录功能
  ```

---

#### 3. AI 完成并交接时（`complete_and_handoff`）

**触发**：AI 调用 complete_and_handoff

**Slack 通知**（3 个频道）：

- 📍 **下一个 AI 的频道**（#replit）
  ```
  🔔 任务交接通知
  
  **任务 #42: 实现用户登录功能**
  来自：CURSOR
  状态：已完成 ✅
  留言：请部署到测试环境
  
  请对我说 "开始工作" 来领取此任务
  https://github.com/...
  ```

- 📍 **协调频道**（#coordination）
  ```
  🔄 任务交接
  任务：#42 实现用户登录功能
  CURSOR ✅ → REPLIT 🔜
  留言：请部署到测试环境
  ```

- 📍 **原 AI 的频道**（#cursor）
  ```
  ✅ 你的任务 #42 已完成并交接给 REPLIT
  ```

---

#### 4. 任务状态更新时（`updateTaskStatus`）

**触发**：手动更新状态

**Slack 通知**：
- 📍 **协调频道**（#coordination）
  ```
  🔄 任务状态更新 #42
  **实现用户登录功能**
  in-progress → done
  备注：...
  ```

---

#### 5. 部署通知（`notifyDeployment`）

**触发**：Replit 部署时调用

**Slack 通知**：
- 📍 **Replit 频道**（#replit）
- 📍 **协调频道**（#coordination）
  ```
  ✅ 部署 success
  环境：production
  分支：dev
  提交：a1b2c3d
  URL：https://...
  耗时：45s
  ```

---

#### 6. 提交通知（`notifyCommit`）

**触发**：代码提交时

**Slack 通知**：
- 📍 **提交频道**（#commits）
  ```
  📝 新提交到 dev
  **feat: implement user login**
  作者：Cursor AI
  SHA：a1b2c3d
  文件：5 个
  https://github.com/...
  ```

---

## 🎯 完整工作流的 Slack 通知时间线

### 示例：Cursor 开发 → Replit 部署

```
时间轴                    Slack 通知

T0: GPT 创建任务
                        #cursor: 📋 新任务 #42...
                        #coordination: ✅ 任务创建

T1: Cursor 开始工作
                        #cursor: 🤖 已领取任务 #42
                        #coordination: 🚀 CURSOR 开始工作

T2: Cursor 提交代码
                        #commits: 📝 新提交...

T3: Cursor 完成交接
                        #replit: 🔔 任务交接通知...
                        #coordination: 🔄 任务交接 CURSOR → REPLIT
                        #cursor: ✅ 任务已完成并交接

T4: Replit 开始部署
                        #replit: 🤖 已领取任务 #42
                        #coordination: 🚀 REPLIT 开始工作

T5: Replit 部署成功
                        #replit: ✅ 部署 success...
                        #coordination: ✅ 部署 success...

T6: Replit 标记完成
                        #coordination: 🔄 任务状态更新 done
```

---

## 📋 Slack 频道使用建议

### #coordination（协调频道）⭐ 关键！
**用途**：所有任务和 AI 活动的中心日志

**接收的通知**：
- ✅ 任务创建
- ✅ 任务开始（AI 领取）
- ✅ 任务交接
- ✅ 任务状态更新
- ✅ 部署通知

**适合**：
- 项目经理监控进度
- 团队了解整体状态
- 审计和追踪

---

### #cursor / #codex / #replit（AI 专属频道）
**用途**：每个 AI 的工作通知和提醒

**接收的通知**：
- ✅ 分配给该 AI 的新任务
- ✅ 该 AI 领取任务的确认
- ✅ 其他 AI 交接给该 AI 的任务
- ✅ 该 AI 完成任务的确认

**适合**：
- AI 操作员查看自己的任务
- 减少噪音（只看相关任务）

---

### #commits（提交频道）
**用途**：代码提交记录

**接收的通知**：
- ✅ Git 提交通知

**适合**：
- 代码审查
- 追踪代码变更

---

## 🔍 GitHub vs Slack 对比

| 信息 | GitHub Issue | Slack 通知 | 说明 |
|------|-------------|-----------|------|
| **任务创建** | ✅ Issue 创建 | ✅ 3 处通知 | GitHub 是主数据，Slack 是通知 |
| **AI 领取** | ✅ 评论记录 | ✅ 2 处通知 | 都有完整记录 |
| **状态变更** | ✅ 标签更新 | ✅ 协调频道 | 都同步 |
| **任务交接** | ✅ 评论 + 标签 | ✅ 3 处通知 | Slack 更实时！ |
| **完成确认** | ✅ 状态标签 | ✅ 通知 | 都有 |
| **工作时间线** | ⚠️ 需查看评论 | ✅ 实时流 | Slack 更直观！ |
| **@提及** | ✅ 评论中 | ❌ 只是文本 | GitHub 是正式记录 |

---

## 💡 Slack 的优势

### 1. 实时性
- GitHub：需要刷新页面
- Slack：即时推送通知

### 2. 上下文聚合
- GitHub：分散在多个 Issue 中
- Slack：#coordination 频道看到所有活动

### 3. 人类友好
- GitHub：技术性强
- Slack：对话式，易读

### 4. 协作提醒
- GitHub：不会主动提醒
- Slack：手机/桌面推送通知

---

## 🎯 是否需要更多 Slack 通知？

### 当前已经很完整了！

**覆盖的关键节点**：
- ✅ 任务创建
- ✅ 任务领取
- ✅ 任务交接
- ✅ 状态更新
- ✅ 部署通知
- ✅ 代码提交

### 可选的额外通知（不是必需）

**1. 任务阻塞通知**
```typescript
// 当 AI 遇到问题时
update_task_status(42, "blocked")
→ Slack: "⚠️ 任务 #42 被阻塞，需要帮助"
```

**2. 任务进度更新**
```typescript
// AI 报告进度
report_progress(42, "已完成 50%")
→ Slack: "📊 任务 #42 进度：50%"
```

**3. 紧急任务提醒**
```typescript
// 高优先级任务创建时 @channel
→ Slack: "@channel 🚨 高优先级任务 #42 需要立即处理"
```

---

## 建议：当前的 Slack 通知已经足够

**理由**：
- ✅ 覆盖所有关键节点
- ✅ 三层通知（AI 频道 + 协调频道 + 原 AI 频道）
- ✅ 信息清晰完整
- ❌ 更多通知可能造成干扰

**GitHub 作为权威数据源，Slack 作为实时通知渠道**，两者配合已经很完美了！

