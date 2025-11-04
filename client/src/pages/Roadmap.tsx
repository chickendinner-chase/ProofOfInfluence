import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowLeft,
  MapPin,
  CheckCircle2,
  Circle,
  Rocket,
  TrendingUp,
  Shield,
  Network,
  Zap,
} from "lucide-react";

export default function Roadmap() {
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
            <MapPin className="w-10 h-10 text-slate-300" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            三年路线图
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            基于《LOVE代币经济学提案》的分阶段实施计划
          </p>
        </div>

        {/* Timeline Overview */}
        <Card className="p-8 mb-8 bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
          <h2 className="text-2xl font-semibold mb-6 text-white">路线图概览</h2>
          <div className="grid md:grid-cols-5 gap-4">
            <div className="text-center p-4 rounded-xl bg-slate-800/50 border border-slate-700">
              <div className="text-2xl font-bold text-blue-400 mb-2">阶段 0</div>
              <div className="text-sm text-slate-400">0-3个月</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-slate-800/50 border border-slate-700">
              <div className="text-2xl font-bold text-green-400 mb-2">
                阶段 1
              </div>
              <div className="text-sm text-slate-400">第3个月</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-slate-800/50 border border-slate-700">
              <div className="text-2xl font-bold text-purple-400 mb-2">
                阶段 2
              </div>
              <div className="text-sm text-slate-400">第6个月</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-slate-800/50 border border-slate-700">
              <div className="text-2xl font-bold text-orange-400 mb-2">
                阶段 3
              </div>
              <div className="text-sm text-slate-400">6-24个月</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-slate-800/50 border border-slate-700">
              <div className="text-2xl font-bold text-pink-400 mb-2">
                阶段 4
              </div>
              <div className="text-sm text-slate-400">24-36个月</div>
            </div>
          </div>
        </Card>

        {/* Phase 0 */}
        <Card className="p-8 mb-8 bg-slate-800/50 border-slate-700">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-blue-900/30 border border-blue-800/30 flex items-center justify-center">
              <Rocket className="w-8 h-8 text-blue-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 rounded-full bg-blue-900/30 border border-blue-800/30 text-blue-400 text-sm font-semibold">
                  阶段 0
                </span>
                <h2 className="text-2xl font-semibold text-white">
                  TGE → 第 3 月
                </h2>
              </div>
              <p className="text-slate-400">基础设施建设与冷启动阶段</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-700">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                核心功能上线
              </h3>
              <ul className="space-y-2 text-sm text-slate-300 ml-7">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  <span>站内消费系统：用户可使用$POI在平台内进行消费</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  <span>
                    挖矿机制上线：通过交易、质押等行为获得$POI奖励
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  <span>
                    反女巫系统：防止机器人和虚假账号，确保公平分配
                  </span>
                </li>
              </ul>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-700">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Circle className="w-5 h-5 text-slate-400" />
                质押与影响力系统
              </h3>
              <ul className="space-y-2 text-sm text-slate-300 ml-7">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  <span>
                    质押挖矿内测：小范围开放，测试经济模型参数
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  <span>
                    影响力评分系统：根据用户贡献计算影响力值
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  <span>早期创作者招募：邀请优质内容创作者入驻</span>
                </li>
              </ul>
            </div>

            <div className="p-5 rounded-xl bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-800/30">
              <h4 className="font-semibold text-white mb-2">
                阶段目标
              </h4>
              <p className="text-sm text-slate-300">
                建立基础用户群体，验证经济模型可行性，为TGE做好准备。预期活跃用户达到10,000+。
              </p>
            </div>
          </div>
        </Card>

        {/* Phase 1 */}
        <Card className="p-8 mb-8 bg-slate-800/50 border-slate-700">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-green-900/30 border border-green-800/30 flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 rounded-full bg-green-900/30 border border-green-800/30 text-green-400 text-sm font-semibold">
                  阶段 1
                </span>
                <h2 className="text-2xl font-semibold text-white">第 3 月</h2>
              </div>
              <p className="text-slate-400">代币上市与流动性注入</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-700">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                TGE 与上市
              </h3>
              <ul className="space-y-2 text-sm text-slate-300 ml-7">
                <li className="flex items-start gap-2">
                  <span className="text-green-400">•</span>
                  <span>代币生成事件（TGE）：$POI正式发行</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">•</span>
                  <span>
                    DEX上市：在Uniswap等主流DEX上线交易对
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">•</span>
                  <span>LP首次注入：提供初始流动性，确保交易顺畅</span>
                </li>
              </ul>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-700">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Circle className="w-5 h-5 text-slate-400" />
                解锁与透明化
              </h3>
              <ul className="space-y-2 text-sm text-slate-300 ml-7">
                <li className="flex items-start gap-2">
                  <span className="text-green-400">•</span>
                  <span>开放转账：用户可自由转账和交易$POI</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">•</span>
                  <span>
                    私募线性解锁启动：早期投资人开始按计划解锁
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">•</span>
                  <span>
                    公开数据看板：实时展示代币流通、销毁、质押等数据
                  </span>
                </li>
              </ul>
            </div>

            <div className="p-5 rounded-xl bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-800/30">
              <h4 className="font-semibold text-white mb-2">阶段目标</h4>
              <p className="text-sm text-slate-300">
                成功上市并建立健康的流动性池，日交易量达到$1M+，持币地址突破50,000个。
              </p>
            </div>
          </div>
        </Card>

        {/* Phase 2 */}
        <Card className="p-8 mb-8 bg-slate-800/50 border-slate-700">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-purple-900/30 border border-purple-800/30 flex items-center justify-center">
              <Network className="w-8 h-8 text-purple-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 rounded-full bg-purple-900/30 border border-purple-800/30 text-purple-400 text-sm font-semibold">
                  阶段 2
                </span>
                <h2 className="text-2xl font-semibold text-white">第 6 月</h2>
              </div>
              <p className="text-slate-400">DeFi 生态与治理升级</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-700">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                Founder 解锁与 DeFi 钩子
              </h3>
              <ul className="space-y-2 text-sm text-slate-300 ml-7">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">•</span>
                  <span>Founder代币线性解锁启动（锁定期结束）</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">•</span>
                  <span>跨链桥上线：支持多链资产互通</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">•</span>
                  <span>借贷协议集成：$POI可作为抵押品借贷</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">•</span>
                  <span>质押升级：新增流动性质押、双币质押等玩法</span>
                </li>
              </ul>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-700">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Circle className="w-5 h-5 text-slate-400" />
                治理 v1 上线
              </h3>
              <ul className="space-y-2 text-sm text-slate-300 ml-7">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">•</span>
                  <span>DAO治理框架上线：提案、投票、执行流程</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">•</span>
                  <span>
                    社区可投票决定手续费率、新功能上线等事项
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">•</span>
                  <span>金库多签管理：增强资金安全性</span>
                </li>
              </ul>
            </div>

            <div className="p-5 rounded-xl bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border border-purple-800/30">
              <h4 className="font-semibold text-white mb-2">阶段目标</h4>
              <p className="text-sm text-slate-300">
                完善DeFi生态，实现跨链互联，建立社区治理机制。TVL突破$50M，治理提案数达到20+。
              </p>
            </div>
          </div>
        </Card>

        {/* Phase 3 */}
        <Card className="p-8 mb-8 bg-slate-800/50 border-slate-700">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-orange-900/30 border border-orange-800/30 flex items-center justify-center">
              <Zap className="w-8 h-8 text-orange-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 rounded-full bg-orange-900/30 border border-orange-800/30 text-orange-400 text-sm font-semibold">
                  阶段 3
                </span>
                <h2 className="text-2xl font-semibold text-white">
                  第 6-24 月
                </h2>
              </div>
              <p className="text-slate-400">创作者经济与生态扩展</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-700">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                创作者经济升级
              </h3>
              <ul className="space-y-2 text-sm text-slate-300 ml-7">
                <li className="flex items-start gap-2">
                  <span className="text-orange-400">•</span>
                  <span>
                    NFT实用性增强：NFT可作为会员凭证、收益分成等
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-400">•</span>
                  <span>
                    创作者分润试点：优质内容创作者可获得平台收益分成
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-400">•</span>
                  <span>粉丝激励系统：粉丝支持可获得代币奖励</span>
                </li>
              </ul>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-700">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Circle className="w-5 h-5 text-slate-400" />
                跨平台集成
              </h3>
              <ul className="space-y-2 text-sm text-slate-300 ml-7">
                <li className="flex items-start gap-2">
                  <span className="text-orange-400">•</span>
                  <span>社交媒体集成：支持X/Instagram等平台账号绑定</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-400">•</span>
                  <span>支付网关接入：支持法币出入金通道</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-400">•</span>
                  <span>合作伙伴生态：与RWA项目方、艺术平台等合作</span>
                </li>
              </ul>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-700">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Circle className="w-5 h-5 text-slate-400" />
                自适应销毁调优
              </h3>
              <ul className="space-y-2 text-sm text-slate-300 ml-7">
                <li className="flex items-start gap-2">
                  <span className="text-orange-400">•</span>
                  <span>
                    根据市场情况动态调整销毁比例，维持健康的通缩模型
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-400">•</span>
                  <span>引入更多销毁场景，如NFT铸造、特权购买等</span>
                </li>
              </ul>
            </div>

            <div className="p-5 rounded-xl bg-gradient-to-br from-orange-900/20 to-amber-900/20 border border-orange-800/30">
              <h4 className="font-semibold text-white mb-2">阶段目标</h4>
              <p className="text-sm text-slate-300">
                打造繁荣的创作者经济，实现多平台互联互通。创作者数量达到10,000+，RWA资产上链总值突破$100M。
              </p>
            </div>
          </div>
        </Card>

        {/* Phase 4 */}
        <Card className="p-8 mb-8 bg-slate-800/50 border-slate-700">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-pink-900/30 border border-pink-800/30 flex items-center justify-center">
              <Shield className="w-8 h-8 text-pink-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 rounded-full bg-pink-900/30 border border-pink-800/30 text-pink-400 text-sm font-semibold">
                  阶段 4
                </span>
                <h2 className="text-2xl font-semibold text-white">
                  第 24-36 月
                </h2>
              </div>
              <p className="text-slate-400">生态成熟与治理完善</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-700">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                程序化 LP 管理
              </h3>
              <ul className="space-y-2 text-sm text-slate-300 ml-7">
                <li className="flex items-start gap-2">
                  <span className="text-pink-400">•</span>
                  <span>
                    智能合约自动管理流动性池，优化资金效率
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-400">•</span>
                  <span>动态手续费机制：根据市场波动自动调整</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-400">•</span>
                  <span>无常损失保护：为LP提供者提供风险对冲</span>
                </li>
              </ul>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-700">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Circle className="w-5 h-5 text-slate-400" />
                金库优化
              </h3>
              <ul className="space-y-2 text-sm text-slate-300 ml-7">
                <li className="flex items-start gap-2">
                  <span className="text-pink-400">•</span>
                  <span>金库资金多元化投资，提升收益能力</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-400">•</span>
                  <span>
                    建立风险储备金，应对市场极端情况
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-400">•</span>
                  <span>透明化金库使用报告，定期公开披露</span>
                </li>
              </ul>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-700">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Circle className="w-5 h-5 text-slate-400" />
                治理成熟化
              </h3>
              <ul className="space-y-2 text-sm text-slate-300 ml-7">
                <li className="flex items-start gap-2">
                  <span className="text-pink-400">•</span>
                  <span>
                    治理权重优化：引入声誉系统、投票权委托等
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-400">•</span>
                  <span>子DAO建立：细分领域的专业治理组织</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-400">•</span>
                  <span>
                    完全去中心化：核心团队逐步退出，社区自治
                  </span>
                </li>
              </ul>
            </div>

            <div className="p-5 rounded-xl bg-gradient-to-br from-pink-900/20 to-rose-900/20 border border-pink-800/30">
              <h4 className="font-semibold text-white mb-2">阶段目标</h4>
              <p className="text-sm text-slate-300">
                实现生态的自驱动和可持续发展，完成去中心化过渡。TVL突破$500M，成为RWA通证化领域的领导者。
              </p>
            </div>
          </div>
        </Card>

        {/* Long-term Vision */}
        <Card className="p-8 bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
          <h2 className="text-2xl font-semibold mb-4 text-white flex items-center gap-2">
            <Rocket className="w-6 h-6" />
            长期愿景（3年后）
          </h2>
          <p className="text-slate-300 leading-relaxed mb-6">
            成为全球最大的非金融资产通证化平台，服务数百万用户，管理价值数十亿美元的RWA资产。
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">10M+</div>
              <p className="text-sm text-slate-400">全球用户</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">$1B+</div>
              <p className="text-sm text-slate-400">RWA资产管理规模</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">50+</div>
              <p className="text-sm text-slate-400">合作生态伙伴</p>
            </div>
          </div>
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

