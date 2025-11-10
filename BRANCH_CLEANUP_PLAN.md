# 分支清理计划

## 当前状态（2024-11-10）

### 分支清单
- ✅ `main` - 最新生产分支
- 🔄 `codex/develop-acee-projectx-backend-api` - 未合并（2个提交）
- ❓ `feat/mock-api-integration` - 未合并（4个提交，Mock API）
- ❓ `feat/multi-wallet-integration` - 未合并（10个提交，钱包集成）
- ✅ `feat/integrate-market-real-api` - 已删除（已合并）

---

## 清理步骤

### Phase 1: 检查分支内容

**目标：** 确定哪些分支需要保留、合并或删除

#### 1.1 检查 codex/develop-acee-projectx-backend-api
```bash
# 查看该分支的提交内容
git log main..codex/develop-acee-projectx-backend-api --oneline

# 查看文件变更
git diff main...codex/develop-acee-projectx-backend-api --stat
```

**决策：**
- [ ] 需要合并到main
- [ ] 已经过时，可以删除
- [ ] 需要保留继续开发

#### 1.2 检查 feat/mock-api-integration
```bash
# 查看该分支的提交内容
git log main..feat/mock-api-integration --oneline

# 查看文件变更
git diff main...feat/mock-api-integration --stat
```

**决策：**
- [ ] 需要合并到main（Mock API作为备用）
- [ ] 已被真实API替代，可以删除
- [ ] 需要保留作为测试环境

#### 1.3 检查 feat/multi-wallet-integration
```bash
# 查看该分支的提交内容
git log main..feat/multi-wallet-integration --oneline

# 查看文件变更
git diff main...feat/multi-wallet-integration --stat
```

**决策：**
- [ ] 需要合并到main
- [ ] 功能已在其他PR中实现，可以删除
- [ ] 需要rebase到最新main

---

### Phase 2: 清理已合并的分支

#### 2.1 删除本地已合并分支
```bash
# 如果确认某分支已合并（手动检查后）
git branch -d <branch-name>
```

#### 2.2 删除远程已合并分支
```bash
# 删除远程分支
git push origin --delete <branch-name>
```

---

### Phase 3: 处理未合并分支

#### Option A: 合并到main
```bash
# 切换到main并更新
git checkout main
git pull origin main

# 合并feature分支
git merge <branch-name>

# 解决冲突（如果有）
# 提交并推送
git push origin main
```

#### Option B: 创建PR在GitHub上合并
```bash
# 确保分支是最新的
git checkout <branch-name>
git pull origin <branch-name>

# 在GitHub上创建Pull Request
# 审查代码后合并
```

#### Option C: Rebase到最新main
```bash
# 如果分支落后太多，需要rebase
git checkout <branch-name>
git rebase main

# 如果有冲突，解决后继续
git rebase --continue

# 强制推送（如果已经推送到远程）
git push origin <branch-name> --force-with-lease
```

#### Option D: 删除过时分支
```bash
# 删除本地分支
git branch -D <branch-name>

# 删除远程分支
git push origin --delete <branch-name>
```

---

### Phase 4: 清理工作树（如果有）

```bash
# 列出所有工作树
git worktree list

# 删除不需要的工作树
git worktree remove <path>

# 清理工作树记录
git worktree prune
```

---

## 推荐的分支管理策略

### 分支命名规范
- `main` - 生产分支，只接受PR合并
- `feat/<feature-name>` - 功能开发分支
- `fix/<bug-name>` - Bug修复分支
- `refactor/<refactor-name>` - 重构分支
- `codex/<specific-task>` - Codex AI开发分支

### 工作流程
1. **开发新功能**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feat/new-feature
   # 开发...
   git push origin feat/new-feature
   # 在GitHub创建PR
   ```

2. **合并后清理**
   ```bash
   # PR合并后
   git checkout main
   git pull origin main
   git branch -d feat/new-feature
   git push origin --delete feat/new-feature
   ```

3. **定期清理**
   ```bash
   # 每周或每两周清理一次
   git fetch --all --prune
   git branch --merged main | grep -v "main" | xargs git branch -d
   ```

---

## 紧急清理命令（谨慎使用）

### 删除所有本地未合并分支（危险！）
```bash
# 先备份！
git branch --no-merged main

# 如果确定要删除
git branch --no-merged main | grep -v "main" | xargs git branch -D
```

### 删除所有远程分支（极度危险！）
```bash
# 不推荐！仅在完全确定时使用
# git push origin --delete <branch-name>
```

---

## 检查清单

清理完成后验证：

- [ ] `git branch -a` 只显示需要的分支
- [ ] `git worktree list` 只显示主工作树或需要的工作树
- [ ] GitHub上的PR都已处理（合并或关闭）
- [ ] 重要的代码都已合并到main
- [ ] 本地工作目录干净（git status）
- [ ] main分支是最新的（git pull origin main）

---

## 注意事项

1. **在删除前务必确认**分支内容已经不需要
2. **备份重要代码**到其他地方
3. **使用 -D（大写）**强制删除时要特别小心
4. **删除远程分支**前确保团队其他人不在使用
5. **工作树清理**前确保没有未提交的更改

---

## 联系人

如有疑问，请联系：
- Cursor AI（代码开发和审查）
- Replit AI（部署和测试）
- Team Lead（重大分支决策）

