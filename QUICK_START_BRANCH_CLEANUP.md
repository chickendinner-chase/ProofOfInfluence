# 🚀 快速开始：分支清理

**5分钟快速指南** - 最简单的分支清理方法

---

## 📋 现状总结

你有 **3个未合并的分支**：

| 分支 | 状态 | 行动 |
|------|------|------|
| `codex/develop-acee-projectx-backend-api` | ⚠️ **重要代码未合并** | 🔥 **必须合并** |
| `feat/mock-api-integration` | ✅ 已在 main 中 | 可以删除 |
| `feat/multi-wallet-integration` | ✅ 已在 main 中 | 可以删除 |

---

## ⚡ 3个简单步骤

### Step 1️⃣: 合并重要的后端代码（必做）

```powershell
# 方法A：使用 PowerShell 脚本（推荐）
.\cleanup_branches.ps1
# 然后选择 "3" 合并 codex 分支

# 方法B：手动合并
git checkout main
git pull origin main
git merge codex/develop-acee-projectx-backend-api
git push origin main
```

**重要：** 这个分支包含后端 API 实现（Market, Reserve Pool, Merchant），目前 main 只有 Mock API！

---

### Step 2️⃣: 验证并删除已合并的分支（可选）

```powershell
# 检查分支是否真的已经在 main 中
git log main..feat/mock-api-integration --oneline
git log main..feat/multi-wallet-integration --oneline

# 如果输出很少或为空 → 可以删除
git branch -d feat/mock-api-integration
git branch -d feat/multi-wallet-integration

# 删除远程分支
git push origin --delete feat/mock-api-integration
git push origin --delete feat/multi-wallet-integration
```

---

### Step 3️⃣: 清理完成后验证

```powershell
# 查看剩余分支（应该只有 main）
git branch -a

# 清理远程追踪
git fetch --all --prune

# 验证后端文件已存在
Test-Path server/routes/market.ts      # 应该返回 True
Test-Path server/routes/merchant.ts    # 应该返回 True
Test-Path server/routes/reservePool.ts # 应该返回 True
```

---

## 🎯 最推荐的方式

### 使用交互式脚本（最简单）

```powershell
# 1. 运行脚本
.\cleanup_branches.ps1

# 2. 按照菜单操作：
#    选项 1: 查看状态
#    选项 2: 检查 codex 分支
#    选项 3: 合并 codex 分支  ← 最重要
#    选项 4: 检查 mock-api 分支
#    选项 5: 检查 multi-wallet 分支
#    选项 6/7: 删除不需要的分支
```

---

## 🔥 只想做最重要的事？

**超简化版（1分钟）：**

```powershell
# 只做这3条命令
git checkout main
git merge codex/develop-acee-projectx-backend-api
git push origin main
```

这会把最重要的后端 API 代码合并到 main。其他分支以后再清理也可以。

---

## ❓ 常见问题

### Q: 合并时遇到冲突怎么办？

**A:** 
```powershell
# 查看冲突文件
git status

# 让 Cursor AI 帮你解决冲突
# 打开冲突文件，Cursor 会显示冲突标记：
# <<<<<<< HEAD
# =======
# >>>>>>> codex/develop-acee-projectx-backend-api

# 解决后：
git add .
git commit -m "fix: resolve merge conflicts"
git push origin main
```

### Q: 不确定某个分支是否可以删除？

**A:** 创建备份分支，然后再删除：
```powershell
# 先备份
git branch backup/mock-api feat/mock-api-integration

# 然后删除原分支
git branch -D feat/mock-api-integration

# 如果发现删错了，可以恢复：
git branch feat/mock-api-integration backup/mock-api
```

### Q: 删除远程分支后其他人会怎样？

**A:** 其他人需要清理他们的本地追踪分支：
```powershell
git fetch --all --prune
```

### Q: 工作树（worktree）是什么？

**A:** 工作树允许你同时检出多个分支到不同目录。查看：
```powershell
git worktree list

# 如果有不需要的工作树
git worktree remove <path>
```

---

## 📁 相关文档

- **详细分析报告**: `BRANCH_ANALYSIS_REPORT.md` - 完整的分支分析
- **清理计划**: `BRANCH_CLEANUP_PLAN.md` - 分步清理指南
- **PowerShell 脚本**: `cleanup_branches.ps1` - 交互式清理工具

---

## ⚠️ 重要提醒

### ✅ 安全操作（可以随意做）
- 查看分支状态
- 检查分支差异
- 创建备份分支
- 本地合并（可以 reset 撤销）

### ⚠️ 谨慎操作（需要确认）
- 删除本地未合并分支（`-D` 强制删除）
- 删除远程分支（影响其他人）
- 强制推送（`--force`）

### ❌ 危险操作（不要做）
- `git push origin main --force`
- 删除 main 分支
- 在没有备份的情况下删除重要分支

---

## 🎉 完成后的状态

清理完成后，你应该有：

```
本地分支：
  * main

远程分支：
  origin/HEAD -> origin/main
  origin/main

工作目录：
  干净（git status 显示 "working tree clean"）

后端文件：
  ✅ server/routes/market.ts
  ✅ server/routes/merchant.ts
  ✅ server/routes/reservePool.ts
```

---

## 🚀 下一步

合并完成后：

1. **让 Replit 部署**：
   ```bash
   # 在 Replit 执行
   npm run db:push
   npm run dev
   ```

2. **测试后端 API**：
   ```bash
   curl http://localhost:5000/api/market/stats
   ```

3. **切换到真实 API**：
   ```bash
   # 在 Replit Secrets 设置
   VITE_USE_MOCK_MARKET=false
   VITE_USE_MOCK_RESERVE=false
   VITE_USE_MOCK_MERCHANT=false
   ```

---

**开始吧！运行 `.\cleanup_branches.ps1` 或直接合并 codex 分支！** 🚀

