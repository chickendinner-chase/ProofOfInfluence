# GitHub 仓库访问和授权指南

本指南帮助你将 GitHub 仓库转为私有，并授权给 Replit 和其他协作工具。

---

## 📋 第一步：转为私有仓库

### 1. 访问仓库设置

在浏览器中打开：
```
https://github.com/chickendinner-chase/ProofOfInfluence/settings
```

### 2. 转为私有

1. 滚动到页面底部的 **"Danger Zone"** 区域
2. 点击 **"Change visibility"**
3. 选择 **"Make private"**
4. 输入仓库名确认：`ProofOfInfluence`
5. 点击 **"I understand, make this repository private"**

✅ 完成！仓库现在是私有的。

---

## 🔐 第二步：授权 Replit 访问

### 方法 1: 通过 Replit Import (推荐)

#### 1. 登录 Replit
访问 [Replit](https://replit.com/) 并登录你的账号

#### 2. Import from GitHub
1. 点击 **"Create Repl"**
2. 选择 **"Import from GitHub"**
3. 点击 **"Authorize Replit"**（如果第一次）
4. 在 GitHub 授权页面选择：
   - **Only select repositories**
   - 选择 **ProofOfInfluence**
5. 点击 **"Authorize Replit"**

#### 3. 导入仓库
1. 在 Replit 搜索框输入：`ProofOfInfluence`
2. 选择你的私有仓库
3. 点击 **"Import"**

### 方法 2: 通过 GitHub App (更精细控制)

#### 1. 访问 Replit GitHub App
```
https://github.com/apps/replit
```

#### 2. 配置访问权限
1. 点击 **"Configure"**
2. 选择你的账号或组织
3. 在 **"Repository access"** 部分：
   - 选择 **"Only select repositories"**
   - 下拉选择 **"ProofOfInfluence"**
4. 权限设置保持默认（Replit 需要读写权限）
5. 点击 **"Save"**

---

## 💻 第三步：授权 Cursor / VS Code

### Cursor (推荐给 AI 辅助开发)

Cursor 使用本地 Git，无需特殊授权。

#### 1. 克隆私有仓库

```bash
git clone https://github.com/chickendinner-chase/ProofOfInfluence.git
```

#### 2. 首次 clone 可能需要认证

**方法 A: Personal Access Token (推荐)**

1. 访问 GitHub 设置：
   ```
   https://github.com/settings/tokens
   ```

2. 点击 **"Generate new token"** → **"Generate new token (classic)"**

3. 配置 Token：
   - Note: `Cursor / Local Development`
   - Expiration: `90 days` 或 `No expiration`
   - 选择权限：
     - ✅ `repo` (完整仓库访问)
     - ✅ `workflow` (如果需要)
4. 点击 **"Generate token"**
5. **复制 token**（只显示一次！）

6. 使用 Token 克隆：
   ```bash
   git clone https://github.com/chickendinner-chase/ProofOfInfluence.git
   # Username: your_github_username
   # Password: ghp_... (paste your token)
   ```

7. 保存凭证（可选）：
   ```bash
   git config --global credential.helper store
   ```

**方法 B: SSH Key**

1. 生成 SSH Key：
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```

2. 添加到 GitHub：
   ```
   https://github.com/settings/keys
   ```
   点击 **"New SSH key"**，粘贴 `~/.ssh/id_ed25519.pub` 的内容

3. 使用 SSH 克隆：
   ```bash
   git clone git@github.com:chickendinner-chase/ProofOfInfluence.git
   ```

---

## 👥 第四步：添加协作者

### 添加团队成员

1. 访问仓库设置：
   ```
   https://github.com/chickendinner-chase/ProofOfInfluence/settings/access
   ```

2. 点击 **"Invite a collaborator"**

3. 输入 GitHub 用户名或邮箱

4. 选择权限级别：
   - **Read**: 只读（查看代码）
   - **Write**: 读写（推送代码，但不能管理设置）
   - **Admin**: 完整权限

5. 发送邀请

### 权限建议

| 角色 | 权限 | 说明 |
|------|------|------|
| 核心开发 | Admin | 完整访问 |
| 后端开发 | Write | 可以推送代码 |
| 前端开发 | Write | 可以推送代码 |
| 设计师 | Read | 查看代码参考 |
| 审计员 | Read | 代码审计 |

---

## 🔒 第五步：保护主分支

### 设置分支保护规则

1. 访问：
   ```
   https://github.com/chickendinner-chase/ProofOfInfluence/settings/branches
   ```

2. 点击 **"Add rule"**

3. 配置规则：
   - **Branch name pattern**: `main`
   - 启用以下选项：
     - ✅ **Require a pull request before merging**
       - ✅ Require approvals: 1
     - ✅ **Require status checks to pass before merging**
     - ✅ **Require branches to be up to date before merging**
     - ✅ **Require signed commits** (推荐)
     - ✅ **Include administrators** (强制执行)

4. 点击 **"Create"**

---

## 🔐 安全最佳实践

### GitHub 安全设置

#### 1. 启用两步验证 (2FA)
```
https://github.com/settings/security
```
强烈建议启用！

#### 2. 审计日志
定期查看访问日志：
```
https://github.com/chickendinner-chase/ProofOfInfluence/settings/security_analysis
```

#### 3. Secret Scanning
确保启用自动密钥扫描：
```
Settings → Security → Enable secret scanning
```

#### 4. Dependabot Alerts
自动检测依赖漏洞：
```
Settings → Security → Enable Dependabot alerts
```

### Replit 安全

1. **定期更新**: 保持 Replit 同步最新代码
2. **Secrets 管理**: 敏感信息只存储在 Replit Secrets
3. **访问控制**: 仅授权必要的人员访问 Replit

### 本地安全

1. **私钥管理**: 使用 `.env` 文件（已在 .gitignore）
2. **不提交敏感信息**: 定期检查 Git 历史
3. **使用 GPG 签名**: 验证提交真实性

---

## 🔄 工作流程

### 日常开发流程

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 创建功能分支
git checkout -b feature/your-feature

# 3. 开发和提交
git add .
git commit -m "feat: add new feature"

# 4. 推送到 GitHub
git push origin feature/your-feature

# 5. 在 GitHub 创建 Pull Request

# 6. 代码审查后合并到 main

# 7. Replit 自动部署
```

### 紧急修复流程

```bash
# 1. 创建 hotfix 分支
git checkout -b hotfix/critical-fix

# 2. 快速修复
git add .
git commit -m "fix: critical security issue"

# 3. 推送并立即合并
git push origin hotfix/critical-fix

# 4. 快速审查后合并

# 5. 确认 Replit 部署
```

---

## 📱 移动端访问

### GitHub Mobile App
- iOS: https://apps.apple.com/app/github/id1477376905
- Android: https://play.google.com/store/apps/details?id=com.github.android

功能：
- ✅ 查看代码
- ✅ 审查 PR
- ✅ 管理 Issues
- ✅ 接收通知

---

## 🆘 常见问题

### Q: 如何撤销某人的访问权限？

**A:** 
1. 访问：`Settings → Collaborators`
2. 找到用户，点击 **"Remove"**

### Q: Replit 无法拉取更新？

**A:** 
1. 检查 Replit 是否有仓库访问权限
2. 重新授权：Settings → Security → GitHub Apps → Replit
3. 在 Replit Shell 手动拉取：`git pull origin main`

### Q: 本地 git push 被拒绝？

**A:** 
1. 检查是否启用了分支保护
2. 创建 Pull Request 而不是直接推送到 main
3. 确保有推送权限（Write 或 Admin）

### Q: 如何查看谁访问了仓库？

**A:** 
1. 访问：`Insights → Traffic`
2. 查看克隆和访问统计

### Q: 想临时授权某人查看代码？

**A:** 
1. 添加为 Read 权限协作者
2. 或生成一个临时 Personal Access Token 分享

---

## 📊 访问权限总结

| 工具/服务 | 授权方式 | 权限级别 | 用途 |
|-----------|---------|---------|------|
| **Replit** | GitHub App | Read + Write | Web2 应用部署 |
| **Cursor** | Personal Access Token | Read + Write | 本地开发 |
| **团队成员** | Collaborators | Read/Write/Admin | 协作开发 |
| **CI/CD** | GitHub Actions | Built-in | 自动化 |

---

## ✅ 检查清单

完成以下步骤确保正确设置：

- [ ] 仓库已转为私有
- [ ] Replit 已授权访问
- [ ] 本地可以 clone 和 push
- [ ] 添加了必要的协作者
- [ ] 设置了分支保护规则
- [ ] 启用了 2FA
- [ ] Secret scanning 已启用
- [ ] Dependabot 已启用
- [ ] `.gitignore` 包含敏感文件
- [ ] 测试了完整的 git workflow

---

## 📞 需要帮助？

- **GitHub 支持**: https://support.github.com/
- **Replit 支持**: https://replit.com/support
- **团队内部**: Slack / Discord

---

**准备就绪！你的私有仓库现在安全且可访问。**

**开始安全地协作开发吧！🚀**

