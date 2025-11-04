import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowLeft,
  Coins,
  PieChart,
  Lock,
  TrendingUp,
  Users,
  Shield,
  Flame,
  Zap,
  Target,
} from "lucide-react";

export default function Tokenomics() {
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
            <Coins className="w-10 h-10 text-slate-300" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            $POI 代币经济学
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            构建可持续发展的通证经济模型，激励生态参与者共建共享
          </p>
        </div>

        {/* Token Supply */}
        <Card className="p-8 mb-8 bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-slate-700/50 flex items-center justify-center">
              <Coins className="w-8 h-8 text-yellow-400" />
            </div>
            <div>
              <h2 className="text-3xl font-semibold text-white mb-2">
                代币总量
              </h2>
              <p className="text-lg text-slate-400">
                总量：1000 亿枚（100B），用于流通媒介、激励与治理凭证。
              </p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-700">
              <div className="text-4xl font-bold text-yellow-400 mb-2">
                100B
              </div>
              <p className="text-sm text-slate-400">
                总发行量，固定供应，永不增发
              </p>
            </div>
            <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-700">
              <div className="text-4xl font-bold text-green-400 mb-2">ERC-20</div>
              <p className="text-sm text-slate-400">
                标准以太坊代币协议，支持跨链
              </p>
            </div>
          </div>
        </Card>

        {/* Token Distribution */}
        <Card className="p-8 mb-8 bg-slate-800/50 border-slate-700">
          <h2 className="text-2xl font-semibold mb-6 text-white flex items-center gap-2">
            <PieChart className="w-6 h-6" />
            代币分配
          </h2>
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-700">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-white">社区与生态</h3>
                <span className="text-2xl font-bold text-blue-400">40%</span>
              </div>
              <p className="text-sm text-slate-400 mb-2">
                40B 枚，用于激励早期用户、流动性挖矿、质押奖励、生态建设
              </p>
              <div className="text-xs text-slate-500">
                解锁：4年线性释放，TGE后即开始
              </div>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-700">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-white">团队与顾问</h3>
                <span className="text-2xl font-bold text-purple-400">20%</span>
              </div>
              <p className="text-sm text-slate-400 mb-2">
                20B 枚，用于核心团队激励、技术顾问报酬
              </p>
              <div className="text-xs text-slate-500">
                解锁：6个月锁定期，之后3年线性释放
              </div>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-700">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-white">私募投资人</h3>
                <span className="text-2xl font-bold text-green-400">15%</span>
              </div>
              <p className="text-sm text-slate-400 mb-2">
                15B 枚，用于早期机构投资人与战略合作伙伴
              </p>
              <div className="text-xs text-slate-500">
                解锁：3个月锁定期，之后2年线性释放
              </div>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-700">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-white">金库储备</h3>
                <span className="text-2xl font-bold text-orange-400">15%</span>
              </div>
              <p className="text-sm text-slate-400 mb-2">
                15B 枚，用于应对市场波动、战略投资、生态扩展
              </p>
              <div className="text-xs text-slate-500">
                解锁：由 DAO 治理决定释放节奏
              </div>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-700">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-white">公开发售</h3>
                <span className="text-2xl font-bold text-cyan-400">5%</span>
              </div>
              <p className="text-sm text-slate-400 mb-2">
                5B 枚，用于公开募资（IDO/IEO）
              </p>
              <div className="text-xs text-slate-500">解锁：TGE 时全部解锁</div>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-700">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-white">流动性池</h3>
                <span className="text-2xl font-bold text-pink-400">5%</span>
              </div>
              <p className="text-sm text-slate-400 mb-2">
                5B 枚，用于 DEX 初始流动性提供
              </p>
              <div className="text-xs text-slate-500">解锁：TGE 时注入流动性池</div>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-800/30">
            <h4 className="font-semibold text-white mb-2">分配原则</h4>
            <ul className="text-sm text-slate-300 space-y-1">
              <li>• 长期主义：团队与投资人代币长期锁定，确保利益一致</li>
              <li>• 社区优先：40%分配给社区，激励早期参与者</li>
              <li>• 透明治理：金库使用由DAO投票决定，公开透明</li>
            </ul>
          </div>
        </Card>

        {/* Token Utility */}
        <Card className="p-8 mb-8 bg-slate-800/50 border-slate-700">
          <h2 className="text-2xl font-semibold mb-6 text-white flex items-center gap-2">
            <Zap className="w-6 h-6" />
            代币用途
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-700">
              <Shield className="w-8 h-8 text-blue-400 mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">
                治理权益
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                持有$POI可参与DAO治理投票，决定平台费率、新资产上架、协议升级等重大事项。投票权重与持有量和质押时长相关。
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-700">
              <TrendingUp className="w-8 h-8 text-green-400 mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">
                交易手续费折扣
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                质押$POI可享受DEX交易手续费折扣，最高可达50%。持有量越多、质押时间越长，折扣力度越大。
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-700">
              <Lock className="w-8 h-8 text-purple-400 mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">
                质押挖矿
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                质押$POI可获得挖矿奖励，APY根据总质押量动态调整。长期质押可获得额外奖励加成和NFT成就徽章。
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-700">
              <Target className="w-8 h-8 text-orange-400 mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">
                优先认购权
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                持有$POI可优先认购新上架的优质RWA资产通证，享受早鸟价格和独家额度。VIP会员可获得更多权益。
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-700">
              <Users className="w-8 h-8 text-cyan-400 mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">
                会员特权
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                根据持有量划分会员等级（青铜/白银/黄金/铂金），享受不同等级的专属权益，如活动邀请、空投资格等。
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-700">
              <Flame className="w-8 h-8 text-red-400 mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">
                销毁机制
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                平台手续费的一部分用于回购并销毁$POI，持续减少流通量，提升代币价值。销毁记录公开透明，可随时查询。
              </p>
            </div>
          </div>
        </Card>

        {/* Staking Rewards */}
        <Card className="p-8 mb-8 bg-slate-800/50 border-slate-700">
          <h2 className="text-2xl font-semibold mb-6 text-white flex items-center gap-2">
            <Lock className="w-6 h-6" />
            质押与挖矿
          </h2>
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="p-5 rounded-xl bg-gradient-to-br from-blue-900/30 to-blue-900/10 border border-blue-800/30 text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">15-30%</div>
              <p className="text-sm text-slate-400">质押年化收益（APY）</p>
              <p className="text-xs text-slate-500 mt-2">
                根据总质押量动态调整
              </p>
            </div>
            <div className="p-5 rounded-xl bg-gradient-to-br from-green-900/30 to-green-900/10 border border-green-800/30 text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">
                7-365天
              </div>
              <p className="text-sm text-slate-400">灵活质押期限</p>
              <p className="text-xs text-slate-500 mt-2">
                时间越长收益越高
              </p>
            </div>
            <div className="p-5 rounded-xl bg-gradient-to-br from-purple-900/30 to-purple-900/10 border border-purple-800/30 text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">
                1.5x-3x
              </div>
              <p className="text-sm text-slate-400">长期质押奖励加成</p>
              <p className="text-xs text-slate-500 mt-2">
                365天质押可获得3倍加成
              </p>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-700">
            <h4 className="font-semibold text-white mb-3">质押等级与权益</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                <div>
                  <span className="font-semibold text-yellow-400">铂金会员</span>
                  <span className="text-sm text-slate-400 ml-2">
                    &gt;= 1,000,000 $POI
                  </span>
                </div>
                <span className="text-sm text-slate-300">
                  50%手续费折扣 + 3倍挖矿加成
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                <div>
                  <span className="font-semibold text-blue-400">黄金会员</span>
                  <span className="text-sm text-slate-400 ml-2">
                    &gt;= 100,000 $POI
                  </span>
                </div>
                <span className="text-sm text-slate-300">
                  30%手续费折扣 + 2倍挖矿加成
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                <div>
                  <span className="font-semibold text-slate-300">白银会员</span>
                  <span className="text-sm text-slate-400 ml-2">
                    &gt;= 10,000 $POI
                  </span>
                </div>
                <span className="text-sm text-slate-300">
                  15%手续费折扣 + 1.5倍挖矿加成
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                <div>
                  <span className="font-semibold text-slate-400">青铜会员</span>
                  <span className="text-sm text-slate-400 ml-2">
                    &gt;= 1,000 $POI
                  </span>
                </div>
                <span className="text-sm text-slate-300">
                  5%手续费折扣 + 基础挖矿权益
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Deflationary Mechanism */}
        <Card className="p-8 mb-8 bg-slate-800/50 border-slate-700">
          <h2 className="text-2xl font-semibold mb-6 text-white flex items-center gap-2">
            <Flame className="w-6 h-6" />
            通缩机制
          </h2>
          <div className="space-y-4 mb-6">
            <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-700">
              <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-400"></div>
                交易手续费回购销毁
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                DEX交易手续费的50%用于从市场回购$POI并销毁，持续减少流通供应量。回购价格公开透明，销毁记录上链可查。
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-700">
              <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                RWA资产上架费销毁
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                新RWA资产上架需支付一定数量的$POI作为审核费，其中70%将被直接销毁，确保上架资产质量的同时减少代币供应。
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-700">
              <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                治理投票销毁
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                提交治理提案需质押一定数量的$POI，若提案未通过，质押代币的20%将被销毁，防止垃圾提案。
              </p>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-gradient-to-br from-red-900/20 to-orange-900/20 border border-red-800/30">
            <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
              <Flame className="w-5 h-5 text-red-400" />
              预期通缩效果
            </h4>
            <p className="text-sm text-slate-300 mb-3">
              根据经济模型测算，在正常交易量下，$POI的年销毁率预计在5-10%之间。随着生态发展和交易量增长，通缩效应将更加显著。
            </p>
            <div className="text-xs text-slate-500">
              * 具体销毁数据可通过区块链浏览器实时查询
            </div>
          </div>
        </Card>

        {/* Governance */}
        <Card className="p-8 bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
          <h2 className="text-2xl font-semibold mb-4 text-white flex items-center gap-2">
            <Users className="w-6 h-6" />
            DAO 治理
          </h2>
          <p className="text-slate-300 leading-relaxed mb-6">
            $POI持有人可通过DAO参与平台治理，投票决定关键参数和发展方向：
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
              <h4 className="font-semibold text-white mb-2">经济参数</h4>
              <p className="text-sm text-slate-400">
                交易手续费率、销毁比例、质押收益率等
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
              <h4 className="font-semibold text-white mb-2">资产审核</h4>
              <p className="text-sm text-slate-400">
                新RWA资产上架审批、资产下架决策
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
              <h4 className="font-semibold text-white mb-2">协议升级</h4>
              <p className="text-sm text-slate-400">
                智能合约升级、新功能上线、技术路线调整
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
              <h4 className="font-semibold text-white mb-2">金库管理</h4>
              <p className="text-sm text-slate-400">
                金库资金使用、战略投资、生态扩展
              </p>
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

