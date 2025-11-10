# 多钱包集成配置说明

本次更新集成了 **AppKit (Reown)** + wagmi，支持多种钱包连接方式，包括移动端扫码连接。

## 🎯 主推钱包（Featured Wallets）

1. **MetaMask** - 最流行的以太坊钱包
2. **Coinbase Wallet** - Coinbase 官方钱包
3. **Phantom** - 支持多链的现代钱包
4. **Binance Web3 Wallet** - 币安生态钱包
5. **OKX Wallet** - OKX 交易所钱包

## 🌐 其他支持的钱包

- **WalletConnect** (扫码连接，支持 300+ 钱包)
- **Trust Wallet**
- **Rainbow Wallet**
- **Ledger**
- **Trezor**
- 以及更多...

## 📱 移动端支持

- ✅ Safari iOS - 通过 WalletConnect 扫码连接
- ✅ 微信浏览器 - 通过 WalletConnect 扫码连接
- ✅ Chrome Mobile - 支持浏览器插件或扫码
- ✅ 任何移动端浏览器 - WalletConnect 通用支持

## 🔧 配置步骤（Replit 部署）

### 1. 获取 WalletConnect Project ID

访问 https://cloud.walletconnect.com/

1. 注册/登录账号
2. 点击 "Create New Project"
3. 填写项目信息：
   - Project Name: `ProofOfInfluence`
   - Homepage URL: `https://yourapp.replit.app` (替换为实际域名)
4. 复制生成的 **Project ID**

### 2. 在 Replit 配置环境变量

在 Replit 项目中：

1. 打开 "Secrets" (工具栏中的 🔐 图标)
2. 添加新的 Secret：
   - Key: `VITE_WALLETCONNECT_PROJECT_ID`
   - Value: `[粘贴你的 Project ID]`
3. 保存

### 3. 部署测试

```bash
# Replit 会自动重启，或手动运行：
npm install
npm run build
npm start
```

## 🧪 测试清单

### 桌面端测试
- [ ] Chrome + MetaMask 插件连接
- [ ] 切换网络（Base/Ethereum）
- [ ] 查看余额
- [ ] 执行交易

### 移动端测试
- [ ] Safari 打开网站
- [ ] 点击"连接钱包"
- [ ] 选择 WalletConnect
- [ ] 扫描二维码
- [ ] 在移动钱包中确认连接
- [ ] 执行交易测试

### 微信浏览器测试
- [ ] 在微信中打开网站
- [ ] 钱包连接流程
- [ ] 交易功能

## 📝 技术栈更新

### 新增依赖
```json
{
  "@reown/appkit": "^1.7.0",
  "@reown/appkit-adapter-wagmi": "^1.7.0",
  "wagmi": "^2.0.0",
  "viem": "^2.0.0"
}
```

### 修改的文件
- `package.json` - 更新依赖（AppKit + wagmi + viem）
- `client/src/App.tsx` - 简化 Provider 结构（无需额外 Provider）
- `client/src/lib/wagmi.ts` - AppKit Wagmi Adapter 配置
- `client/src/lib/ethersAdapter.ts` - viem 到 ethers.js 适配器（保持不变）
- `client/src/components/WalletConnectButton.tsx` - 使用 AppKit hooks（保留 standalone 模式）
- `client/src/components/UniswapSwapCard.tsx` - 使用 wagmi hooks（保持不变）
- `client/src/pages/TradingApp.tsx` - 钱包状态管理（保持不变）

## 🚀 新功能

### 1. 多钱包支持
用户可以选择任何支持的钱包连接，不再局限于 MetaMask。

### 2. WalletConnect 集成
移动端用户通过扫码即可连接桌面端钱包应用。

### 3. 网络切换
内置网络切换功能，自动提示用户切换到正确的链。

### 4. 更好的 UI/UX
- 显示连接状态
- 显示当前网络
- 显示钱包余额
- 一键断开连接

## ⚠️ 注意事项

### 开发模式（本地）
如果没有配置 `VITE_WALLETCONNECT_PROJECT_ID`，会使用默认的 `demo-project-id`，功能可能受限。

### 生产模式（Replit）
**必须**配置正确的 WalletConnect Project ID，否则 WalletConnect 功能无法使用。

### 向后兼容性
- 保留了 `standalone` 模式用于不需要 Web2 集成的页面
- 现有的 MetaMask 功能完全兼容
- API 接口无需修改

## 🔐 安全性

- WalletConnect 使用端到端加密
- 私钥始终保存在用户钱包中
- 签名验证在客户端完成
- 遵循 EIP-1193 标准

## 📞 故障排查

### 问题：连接按钮无反应
**解决**：检查浏览器控制台，确认 AppKit 正确初始化。

### 问题：WalletConnect 二维码不显示
**解决**：检查 `VITE_WALLETCONNECT_PROJECT_ID` 是否正确配置。

### 问题：移动端无法连接
**解决**：
1. 确认移动端已安装支持的钱包 App
2. 确认钱包 App 已更新到最新版本
3. 尝试重新扫码

### 问题：网络切换失败
**解决**：某些钱包可能不支持自动切换，需要手动在钱包中切换网络。

## 📚 相关文档

- [AppKit (Reown) 文档](https://docs.reown.com/appkit/overview)
- [wagmi 文档](https://wagmi.sh/)
- [WalletConnect 文档](https://docs.walletconnect.com/)
- [Base Network 文档](https://docs.base.org/)

## 🤝 团队协作

- **Cursor AI**: 完成代码开发和集成 ✅
- **Replit AI**: 负责部署和环境变量配置 📋
- **团队测试**: 各平台功能验证 🧪

---

**初次集成日期**: 2025-11-06
**AppKit 迁移日期**: 2025-11-08
**负责人**: Cursor AI
**状态**: ✅ AppKit 迁移完成，等待 Replit 部署测试

