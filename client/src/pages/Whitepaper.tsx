import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowLeft,
  BookText,
  CheckCircle2,
  ShieldCheck,
  Target,
  Sparkles,
  Lock,
  Network,
  DollarSign,
  Scale,
  FileText,
} from "lucide-react";

export default function Whitepaper() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800 sticky top-0 bg-slate-900/95 backdrop-blur-sm z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center p-4">
          <Link href="/">
            <Button
              variant="ghost"
              className="hover:bg-slate-800"
              data-testid="back-button"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回首页
            </Button>
          </Link>
          <div className="font-semibold text-lg text-white">ACEE Ventures</div>
          <div className="w-24"></div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center space-y-6 mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-slate-800 border border-slate-700">
            <BookText className="w-10 h-10 text-slate-300" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            $POI 白皮书
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Proof of Influence（POI）：非金融资产通证化基础设施
          </p>
        </div>

        {/* Background */}
        <Card className="p-8 mb-8 bg-slate-800/50 border-slate-700">
          <h2 className="text-2xl font-semibold mb-4 text-white flex items-center gap-2">
            <Target className="w-6 h-6" />
            项目背景
          </h2>
          <p className="text-slate-300 leading-relaxed mb-4">
            在数字经济时代，非金融资产需要在链上被有效标记与流通。POI
            以通证为载体，让资产可追溯、可交易、可治理。
          </p>
          <p className="text-slate-300 leading-relaxed">
            传统的资产流通存在诸多痛点：信息不透明、交易成本高、流动性受限、确权困难。POI
            通过区块链技术，为非金融资产提供了一个去中心化、透明、高效的通证化解决方案。
          </p>
        </Card>

        {/* Positioning */}
        <Card className="p-8 mb-8 bg-slate-800/50 border-slate-700">
          <h2 className="text-2xl font-semibold mb-4 text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6" />
            项目定位
          </h2>
          <p className="text-slate-300 leading-relaxed text-lg">
            面向短剧/艺术与奢侈品/住宅商业不动产等非金融资产的通证化基础设施。
          </p>
          <div className="mt-6 grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700">
              <h4 className="font-semibold text-white mb-2">影视剧版权</h4>
              <p className="text-sm text-slate-400">
                短剧、电影、电视剧等影视作品的版权通证化，实现收益权分配与交易
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700">
              <h4 className="font-semibold text-white mb-2">艺术与奢侈品</h4>
              <p className="text-sm text-slate-400">
                艺术品、名表、珠宝等高价值奢侈品的所有权通证化与溯源认证
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700">
              <h4 className="font-semibold text-white mb-2">不动产</h4>
              <p className="text-sm text-slate-400">
                住宅、商业地产等不动产的份额化通证，降低投资门槛
              </p>
            </div>
          </div>
        </Card>

        {/* Core Values */}
        <Card className="p-8 mb-8 bg-slate-800/50 border-slate-700">
          <h2 className="text-2xl font-semibold mb-6 text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6" />
            核心价值
          </h2>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">原创设计</h3>
                <p className="text-slate-400">
                  以'影响力即价值'为经济内核，强调可审计与激励闭环。POI
                  不仅是资产的数字化，更是价值创造与分配的新范式。
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">结构优势</h3>
                <p className="text-slate-400">
                  RWA 发行 + DEX 交易 +
                  治理/激励。三位一体的架构设计，确保从资产上链、流通交易到社区治理的完整闭环。
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">合规意识</h3>
                <p className="text-slate-400">
                  KYC/AML、确权认证、上链审计与金库披露。严格遵循监管要求，确保项目的合法合规运营。
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">生态扩展</h3>
                <p className="text-slate-400">
                  忠诚度系统、NFT 成就、跨链互联、DeFi
                  扩展。构建开放的生态系统，与更多项目和协议实现互联互通。
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Technical Architecture */}
        <Card className="p-8 mb-8 bg-slate-800/50 border-slate-700">
          <h2 className="text-2xl font-semibold mb-6 text-white flex items-center gap-2">
            <Network className="w-6 h-6" />
            技术架构
          </h2>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700">
              <h4 className="font-semibold text-white mb-2">链上资产层</h4>
              <p className="text-sm text-slate-400">
                智能合约管理资产通证发行、转移、销毁等核心功能，确保资产的链上映射与确权
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700">
              <h4 className="font-semibold text-white mb-2">交易协议层</h4>
              <p className="text-sm text-slate-400">
                DEX 协议支持资产通证的自由交易、流动性池管理、价格发现机制
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700">
              <h4 className="font-semibold text-white mb-2">治理与激励层</h4>
              <p className="text-sm text-slate-400">
                DAO 治理框架、质押挖矿机制、影响力评分系统，激励生态参与者
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700">
              <h4 className="font-semibold text-white mb-2">应用与接口层</h4>
              <p className="text-sm text-slate-400">
                Web/移动端应用、API 接口、钱包集成，为用户提供便捷的访问入口
              </p>
            </div>
          </div>
        </Card>

        {/* Low Fee Channel - NEW SECTION */}
        <Card className="p-8 mb-8 bg-slate-800/50 border-slate-700">
          <h2 className="text-2xl font-semibold mb-6 text-white flex items-center gap-2">
            <DollarSign className="w-6 h-6" />
            低手续费通道（费用路径）
          </h2>
          
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white">手续费结构与定价机制</h3>
            <div className="space-y-4 text-slate-300">
              <p><strong className="text-white">目标</strong>：端到端把加密↔法币的<strong className="text-green-400">到手成本</strong>压到 ≈0%，仅剩链上 Gas 与银行刚性成本。</p>
              
              <div>
                <p className="font-semibold text-white mb-2">组成：</p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span><strong>撮合费</strong>：在 Coinbase Exchange/International 走 <strong className="text-green-400">Maker 限价</strong>，费率 <strong>0%</strong>；必要时 Taker ≤ 5–10 bps</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span><strong>出金费</strong>：<strong className="text-green-400">ACH ≈ $0 / SEPA ≈ €0–€1</strong>；急单或跨境走 Wire（固定费）分摊到大额单上</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span><strong>链费</strong>：统一低费网络（TRON USDT、Solana PYUSD、EVM L2 USDC），<strong className="text-green-400">&lt; $0.1</strong> 级</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span><strong>平台服务费（可选）</strong>：前端/路由层 <code className="text-xs bg-slate-700 px-1 py-0.5 rounded">feeBps</code>（0–20 bps，按 $POI 等级动态减免）</span>
                  </li>
                </ul>
              </div>

              <div>
                <p className="font-semibold text-white mb-2">定价策略：</p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-1">•</span>
                    <span><strong>B2B 商家</strong>：feeBps=0–5</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-1">•</span>
                    <span><strong>C 端自由交易</strong>：feeBps=5–20（含 Paymaster 免 Gas 场景）</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-1">•</span>
                    <span><strong>大额订单</strong>：强制 Maker + ACH；feeBps 自动降档</span>
                  </li>
                </ul>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-white pt-4">费用路径优化策略</h3>
            <div className="space-y-3 text-slate-300">
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span><strong>稳定币出口优先级</strong>：<code className="text-xs bg-slate-700 px-1 py-0.5 rounded">PYUSD (Solana) → USDC (Base/L2) → USDT (TRON)</code></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span><strong>撮合策略</strong>：<code className="text-xs bg-slate-700 px-1 py-0.5 rounded">内部撮合 {' > '} 外部 Maker {' > '} OTC RFQ {' > '} 外部 Taker（兜底）</code></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span><strong>银行出金策略</strong>：<code className="text-xs bg-slate-700 px-1 py-0.5 rounded">ACH/SEPA 批量（T+1）{' > '} Wire（仅大额/紧急）</code></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span><strong>风控路由</strong>：高风险地址或地区切换到合规网关（费率略高），保证成功率</span>
                </li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-white pt-4">与传统交易所的费用对比</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left p-3 text-white">项</th>
                    <th className="text-left p-3 text-white">传统 CEX（零售）</th>
                    <th className="text-left p-3 text-white">ProjectX（DeFi Broker）</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  <tr className="border-b border-slate-700/50">
                    <td className="p-3">加密↔法币兑换</td>
                    <td className="p-3">10–50 bps（含点差）</td>
                    <td className="p-3 text-green-400 font-semibold">0 bps（Maker） / ≤10 bps（Taker兜底）</td>
                  </tr>
                  <tr className="border-b border-slate-700/50">
                    <td className="p-3">出金</td>
                    <td className="p-3">$15–$35（Wire）/卡通道 1–4%</td>
                    <td className="p-3 text-green-400 font-semibold">ACH/SEPA ≈ $0 / Wire 仅大额</td>
                  </tr>
                  <tr className="border-b border-slate-700/50">
                    <td className="p-3">前端费</td>
                    <td className="p-3">0–20 bps（视 VIP）</td>
                    <td className="p-3 text-green-400 font-semibold">0–20 bps（按 $POI 等级动态减免）</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold">总体到手成本</td>
                    <td className="p-3">0.3%–1.5%</td>
                    <td className="p-3 text-green-400 font-bold text-lg">≈0%–0.2%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-xl font-semibold text-white pt-4">Reserve Pool 费用归集机制</h3>
            <div className="space-y-3 text-slate-300">
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span><strong>来源</strong>：前端 feeBps、撮合正滑点、聚合返佣（UniswapX/0x appFee）</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span><strong>归集</strong>：实时记账到 <code className="text-xs bg-slate-700 px-1 py-0.5 rounded">Reserve Pool</code>，并记录事件 <code className="text-xs bg-slate-700 px-1 py-0.5 rounded">FeeCaptured(orderId, token, amount, source)</code></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span><strong>分配</strong>：周期 Job 执行 <code className="text-xs bg-slate-700 px-1 py-0.5 rounded">USDC → $POI 回购</code>：<code className="text-xs bg-slate-700 px-1 py-0.5 rounded">X% 销毁</code>、<code className="text-xs bg-slate-700 px-1 py-0.5 rounded">Y% 分红</code>、<code className="text-xs bg-slate-700 px-1 py-0.5 rounded">Z% 生态基金</code>（默认 50/30/20，可配置）</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span><strong>审计</strong>：公开周报（累计费、回购均价、销毁总量），链上/链下双账对照</span>
                </li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Compliance Module - NEW SECTION */}
        <Card className="p-8 mb-8 bg-slate-800/50 border-slate-700">
          <h2 className="text-2xl font-semibold mb-6 text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6" />
            合规模块（KYC/AML、税务与隐私）
          </h2>
          
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white">KYC/AML 合规流程</h3>
            <div className="space-y-4 text-slate-300">
              <p><strong className="text-white">主体合规</strong>：双实体结构（<strong className="text-green-400">US MSB + 离岸 VASP</strong>），满足不同区域清算要求。</p>
              
              <div>
                <p className="font-semibold text-white mb-2">用户分层：</p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span><strong>L0（小额）</strong>：邮箱+设备指纹，限额严格</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span><strong>L1（常规）</strong>：身份证件+人脸+住址证明</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span><strong>L2（高额/商家）</strong>：公司证照+UBO+经审计财报</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <p><strong className="text-white">交易监控</strong>：链上 KYT（黑名单/关联度/风险分），可疑流量转合规网关或人工复核</p>
                <p><strong className="text-white">报送</strong>：大额/可疑交易触发 SAR/CTR（按当地法规保留/报送记录）</p>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-white pt-4">跨境税务优化结构</h3>
            <div className="space-y-3 text-slate-300">
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span><strong>运营</strong>：美国实体承担技术/品牌（Cost+5%），<strong className="text-green-400">离岸实体</strong>收取撮合协议费（0–9% 所得税）</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span><strong>商户</strong>：本地纳税（销售税/VAT），平台提供<strong className="text-green-400">税务报表</strong>与交易明细导出</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span><strong>预提税与 CFC</strong>：在协议与转定价中约定服务属性与合理利润，降低被动收入与利润转移风险</span>
                </li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-white pt-4">用户隐私保护机制</h3>
            <div className="space-y-3 text-slate-300">
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span><strong>最小化采集</strong>（GDPR/CCPA）：只存必要身份/交易数据</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span><strong>加密</strong>：静态（KMS/Envelope）与传输（TLS1.3）；敏感字段分区加密与脱敏</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span><strong>数据生命周期</strong>：KYC 过期与销户的<strong className="text-green-400">到期删除</strong>与<strong className="text-green-400">证据保留</strong>并行</span>
                </li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-white pt-4">监管报告与审计流程</h3>
            <div className="space-y-3 text-slate-300">
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span><strong>审计</strong>：季度内部审计 + 年度外部审计（冷钱包多签、储备证明、对账差异&lt; 0.1%）</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span><strong>合规档案</strong>：政策、流程、培训、日志留存 ≥ 5 年</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span><strong>报告</strong>：交易量、投诉处理、可疑交易、资金充足率等 KPI</span>
                </li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-white pt-4">商家税务报表生成功能</h3>
            <div className="space-y-3 text-slate-300">
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  <span><strong>报表</strong>：周期（周/月/季/年）生成 <strong className="text-green-400">销售额/平台费/净额/应税额</strong> 报表</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  <span><strong>导出</strong>：CSV/XLS/PDF 勾稽凭证</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  <span><strong>接口</strong>：<code className="text-xs bg-slate-700 px-1 py-0.5 rounded">GET /api/merchant/tax-reports</code>、<code className="text-xs bg-slate-700 px-1 py-0.5 rounded">POST /api/merchant/tax-reports</code>、下载链接</span>
                </li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Tax Comparison - NEW SECTION */}
        <Card className="p-8 mb-8 bg-slate-800/50 border-slate-700">
          <h2 className="text-2xl font-semibold mb-6 text-white flex items-center gap-2">
            <Scale className="w-6 h-6" />
            税收比较图示
          </h2>
          
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white">结构对比（Web2 vs ProjectX）</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left p-3 text-white">维度</th>
                    <th className="text-left p-3 text-white">Web2 平台</th>
                    <th className="text-left p-3 text-white">ProjectX（DeFi Broker）</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  <tr className="border-b border-slate-700/50">
                    <td className="p-3 font-semibold">收入性质</td>
                    <td className="p-3">交易/支付业务收入</td>
                    <td className="p-3 text-green-400 font-semibold">技术服务费/协议费</td>
                  </tr>
                  <tr className="border-b border-slate-700/50">
                    <td className="p-3 font-semibold">税目</td>
                    <td className="p-3">增值税/销售税普遍适用</td>
                    <td className="p-3 text-green-400 font-semibold">多数辖区可免 VAT/低税</td>
                  </tr>
                  <tr className="border-b border-slate-700/50">
                    <td className="p-3 font-semibold">税基</td>
                    <td className="p-3">全额交易利润</td>
                    <td className="p-3 text-green-400 font-semibold">仅协议费（3–5%）</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold">实体</td>
                    <td className="p-3">单一法域</td>
                    <td className="p-3 text-green-400 font-semibold">US + 离岸 双实体</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-xl font-semibold text-white pt-4">法域税率（示例）</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left p-3 text-white">地区</th>
                    <th className="text-right p-3 text-white">公司所得税</th>
                    <th className="text-left p-3 text-white">备注</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  <tr className="border-b border-slate-700/50">
                    <td className="p-3">美国（联邦）</td>
                    <td className="p-3 text-right">21%</td>
                    <td className="p-3">另加州税</td>
                  </tr>
                  <tr className="border-b border-slate-700/50">
                    <td className="p-3">ADGM（UAE）</td>
                    <td className="p-3 text-right text-green-400 font-semibold">9%</td>
                    <td className="p-3">合格收入可优惠</td>
                  </tr>
                  <tr className="border-b border-slate-700/50">
                    <td className="p-3">香港</td>
                    <td className="p-3 text-right">8.25–16.5%</td>
                    <td className="p-3">递进制</td>
                  </tr>
                  <tr>
                    <td className="p-3">BVI/Cayman</td>
                    <td className="p-3 text-right text-green-400 font-semibold">0%</td>
                    <td className="p-3">年审必做</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-slate-400 italic">
              * 实际税率与优惠以当地法规与事务所意见为准
            </p>

            <h3 className="text-xl font-semibold text-white pt-4">创作者/品牌的税务优惠</h3>
            <div className="space-y-3 text-slate-300">
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>平台提供分成明细与成本抵扣凭证（平台费、支付费、链费）</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>可选 <strong className="text-green-400">预扣模式</strong>（withholding）降低申报复杂度（需法务确认）</span>
                </li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-white pt-4">合规成本与效益分析</h3>
            <div className="space-y-3 text-slate-300">
              <div>
                <p className="font-semibold text-white mb-2">成本：</p>
                <p className="ml-4">牌照、审计、KYC/KYT、合规人力</p>
              </div>
              <div>
                <p className="font-semibold text-white mb-2">效益：</p>
                <ul className="space-y-1 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>更高限额</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>更低失败率</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>更稳定银行对接</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>品牌信誉与增发场景（RWA）</span>
                  </li>
                </ul>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-white pt-4">流程图示</h3>
            <div className="p-6 bg-slate-700/30 rounded-xl">
              <pre className="text-xs text-slate-300 overflow-x-auto">
{`flowchart LR
A[用户/商家] --> B[ACEE ProjectX 撮合层]
B --> C[Coinbase Intl/Exch. Maker 0%]
C --> D[ACH/SEPA 0费 出金]
B --> E[Reserve Pool 费用归集]
E --> F[$POI 回购/销毁/分红]`}
              </pre>
              <p className="text-xs text-slate-400 mt-2 italic">
                注：Mermaid 流程图 - 可使用在线工具渲染或替换为图片
              </p>
            </div>
          </div>
        </Card>

        {/* ProjectX Architecture - NEW SECTION */}
        <Card className="p-8 mb-8 bg-slate-800/50 border-slate-700">
          <h2 className="text-2xl font-semibold mb-6 text-white flex items-center gap-2">
            <FileText className="w-6 h-6" />
            ProjectX 架构详解
          </h2>
          
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white">交易市场模块：订单撮合与低手续费通道</h3>
            <div className="space-y-4 text-slate-300">
              <p><strong className="text-white">API</strong>：<code className="text-xs bg-slate-700 px-1 py-0.5 rounded">/api/market/orders|orderbook|trades|stats</code></p>
              
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span><strong>撮合</strong>：内部撮合优先；外部 Maker 作兜底；失败转 RFQ/Taker</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span><strong>费用</strong>：<code className="text-xs bg-slate-700 px-1 py-0.5 rounded">feeBps</code> 动态；事件 <code className="text-xs bg-slate-700 px-1 py-0.5 rounded">FeeCaptured</code> 写账</span>
                </li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-white pt-4">Reserve Pool 模块：资金池管理与 $POI 回购策略</h3>
            <div className="space-y-4 text-slate-300">
              <p><strong className="text-white">接口</strong>：<code className="text-xs bg-slate-700 px-1 py-0.5 rounded">GET /reserve-pool</code>、<code className="text-xs bg-slate-700 px-1 py-0.5 rounded">POST /buyback</code>、<code className="text-xs bg-slate-700 px-1 py-0.5 rounded">POST /withdraw</code>、<code className="text-xs bg-slate-700 px-1 py-0.5 rounded">GET /analytics</code></p>
              
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  <span><strong>策略</strong>：阈值触发/T+N 定时；回购价格走聚合器 VWAP</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  <span><strong>审计</strong>：公开"累计回购/销毁/分红"与资金足额证明</span>
                </li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-white pt-4">商家后台：定价、订单管理与税务报表</h3>
            <div className="space-y-4 text-slate-300">
              <p><strong className="text-white">模型</strong>：<code className="text-xs bg-slate-700 px-1 py-0.5 rounded">products / orders / tax_reports</code></p>
              
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span><strong>操作</strong>：定价、上下架、订单状态机（PENDING/PAID/SHIPPED/REFUNDED）、税表生成/下载</span>
                </li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-white pt-4">系统集成与数据流转</h3>
            <div className="space-y-3 text-slate-300">
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span><strong>数据流</strong>：前端下单 → FeeRouter 扣费 → 撮合/清算 → Reserve Pool 归集 → 周期回购/报表 → 商家/平台税务</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span><strong>对账</strong>：链上事件 + 中心化账簿双写，幂等与回滚</span>
                </li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-white pt-4">技术栈与安全机制</h3>
            <div className="space-y-4 text-slate-300">
              <div>
                <p className="font-semibold text-white mb-2">技术栈：</p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span><strong>前端</strong>：React/TypeScript、TailwindCSS、Shadcn UI、Wouter</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span><strong>后端</strong>：Node/Express 或 Nest、Postgres（Drizzle/Prisma）</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span><strong>合约</strong>：Hardhat/Foundry、Solidity 0.8.20、OpenZeppelin</span>
                  </li>
                </ul>
              </div>

              <div>
                <p className="font-semibold text-white mb-2">安全机制：</p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">🔒</span>
                    <span>多签金库、权限分级（Owner/Operator）</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">🔒</span>
                    <span>KMS 秘钥管理、Webhook 验签</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">🔒</span>
                    <span>私有 RPC/MEV 防护、速率限制</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">🔒</span>
                    <span>链上事件监控与异常告警</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </Card>

        {/* Vision */}
        <Card className="p-8 bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
          <h2 className="text-2xl font-semibold mb-4 text-white">愿景</h2>
          <p className="text-lg text-slate-300 leading-relaxed mb-4">
            成为全球领先的非金融资产通证化基础设施，让每一个有价值的资产都能在链上流通。
          </p>
          <p className="text-slate-400 leading-relaxed">
            我们相信，在 Web3
            时代，资产的流动性将不再受限于地理边界和传统金融体系。POI
            致力于构建一个开放、透明、高效的资产通证化生态，让价值自由流动，让每个人都能参与到优质资产的投资与收益分享中。
          </p>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center text-sm text-slate-500">
          © 2025 ACEE Ventures. 保留所有权利。
        </div>
      </footer>
    </div>
  );
}
