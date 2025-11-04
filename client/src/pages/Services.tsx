import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowLeft,
  Layers,
  Network,
  Scale,
  ShieldCheck,
  FileText,
  Wallet,
  TrendingUp,
  Lock,
  Coins,
  Store,
  Users,
} from "lucide-react";

export default function Services() {
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
            <Layers className="w-10 h-10 text-slate-300" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            核心功能
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            三大核心功能模块，构建完整的非金融资产通证化生态
          </p>
        </div>

        {/* Feature 1: Asset Tokenization */}
        <Card className="p-8 mb-8 bg-slate-800/50 border-slate-700">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-slate-700/50 flex items-center justify-center">
              <Layers className="w-8 h-8 text-slate-300" />
            </div>
            <div>
              <h2 className="text-3xl font-semibold text-white mb-2">
                资产代币发行
              </h2>
              <p className="text-lg text-slate-400">
                将影视剧版权、艺术品、奢侈品或房产映射为链上通证，自动确权与收益分配，并可直接挂钩现实收益。
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-700">
              <FileText className="w-8 h-8 text-blue-400 mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">
                智能合约发行
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                通过智能合约自动化发行资产通证，定义资产属性、发行量、权益分配规则。确保发行过程透明、不可篡改。
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-700">
              <ShieldCheck className="w-8 h-8 text-green-400 mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">
                确权认证
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                上链前完成资产确权审核，包括所有权证明、价值评估、第三方鉴定等。确保每个通证背后都有真实资产支撑。
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-700">
              <Coins className="w-8 h-8 text-yellow-400 mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">
                收益分配
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                智能合约自动执行收益分配，根据持有比例将资产产生的收益（租金、版权费等）按时分配给持有人。
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-700">
              <Lock className="w-8 h-8 text-purple-400 mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">
                托管与保险
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                实物资产存放在专业托管机构，配备保险保障。数字通证与实物资产一一对应，可随时申请提货或兑换。
              </p>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-800/30">
            <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              应用场景示例
            </h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-blue-400">•</span>
                <span>
                  <strong>短剧版权通证化：</strong>将短剧版权份额化为1000个通证，每个通证代表0.1%的收益权，投资者可购买并分享广告、付费等收益
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400">•</span>
                <span>
                  <strong>奢侈品通证化：</strong>价值100万的百达翡丽手表通证化为100份，每份1万元，降低投资门槛，实现份额化交易
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400">•</span>
                <span>
                  <strong>房产通证化：</strong>商业地产的租金收益权通证化，投资者购买通证即可按月获得租金分红，无需购买整套房产
                </span>
              </li>
            </ul>
          </div>
        </Card>

        {/* Feature 2: DEX Trading */}
        <Card className="p-8 mb-8 bg-slate-800/50 border-slate-700">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-slate-700/50 flex items-center justify-center">
              <Network className="w-8 h-8 text-slate-300" />
            </div>
            <div>
              <h2 className="text-3xl font-semibold text-white mb-2">
                DEX 平台交易
              </h2>
              <p className="text-lg text-slate-400">
                支持 RWA
                通证在DEX中自由交易与流动性提供；规则上链、费用可治理并可引入销毁机制。
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-700">
              <TrendingUp className="w-8 h-8 text-green-400 mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">
                自由交易
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                去中心化交易所支持资产通证的24/7不间断交易，无需中心化机构审批，买卖双方直接点对点交易。
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-700">
              <Coins className="w-8 h-8 text-blue-400 mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">
                流动性池
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                用户可向流动性池提供资产通证和稳定币，赚取交易手续费分成。AMM机制确保随时有流动性可供交易。
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-700">
              <Scale className="w-8 h-8 text-purple-400 mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">
                价格发现
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                通过市场交易自动形成公允价格，反映资产的真实市场价值。价格数据透明公开，供所有人查询。
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-700">
              <ShieldCheck className="w-8 h-8 text-orange-400 mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">
                交易安全
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                智能合约执行交易，资金安全有保障。防夹子攻击、防闪电贷攻击等多重安全机制保护用户资产。
              </p>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-gradient-to-br from-green-900/20 to-blue-900/20 border border-green-800/30">
            <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
              <Network className="w-5 h-5" />
              DEX 特色功能
            </h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-green-400">•</span>
                <span>
                  <strong>交易挖矿：</strong>交易资产通证可获得$POI代币奖励，激励早期用户参与生态建设
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">•</span>
                <span>
                  <strong>手续费折扣：</strong>持有并质押$POI代币可享受交易手续费折扣，最高可达50%优惠
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">•</span>
                <span>
                  <strong>治理投票：</strong>社区可投票决定交易手续费率、新资产上架审核、代币销毁比例等关键参数
                </span>
              </li>
            </ul>
          </div>
        </Card>

        {/* Feature 3: Real World Consumption */}
        <Card className="p-8 mb-8 bg-slate-800/50 border-slate-700">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-slate-700/50 flex items-center justify-center">
              <Scale className="w-8 h-8 text-slate-300" />
            </div>
            <div>
              <h2 className="text-3xl font-semibold text-white mb-2">
                现实世界消费
              </h2>
              <p className="text-lg text-slate-400">
                连接链上资产与线下真实消费场景，形成'通证—收益—消费'闭环经济模型。
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-700">
              <Store className="w-8 h-8 text-pink-400 mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">
                实物兑换
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                持有奢侈品通证可随时申请提取实物，完成KYC后物流配送。也支持将实物存入托管，铸造对应通证。
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-700">
              <Coins className="w-8 h-8 text-yellow-400 mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">
                权益消费
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                资产通证持有人可享受相关权益，如影视剧观看特权、房产使用权、奢侈品体验权等。
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-700">
              <Users className="w-8 h-8 text-cyan-400 mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">
                会员体系
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                持有$POI代币可升级会员等级，享受平台手续费折扣、优先认购权、独家活动邀请等特权。
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-700">
              <Wallet className="w-8 h-8 text-indigo-400 mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">
                支付集成
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                支持使用$POI代币或资产通证在生态内支付，未来将接入更多线下商家，扩展应用场景。
              </p>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-800/30">
            <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
              <Store className="w-5 h-5" />
              消费场景示例
            </h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-purple-400">•</span>
                <span>
                  <strong>影视会员：</strong>持有短剧版权通证可免费观看该剧集，享受会员专属内容和无广告体验
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">•</span>
                <span>
                  <strong>奢侈品体验：</strong>持有名表通证可预约线下鉴赏体验，参加品牌活动，优先购买新品
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">•</span>
                <span>
                  <strong>房产使用权：</strong>持有房产通证可申请短期使用权，如度假居住、商业办公等
                </span>
              </li>
            </ul>
          </div>
        </Card>

        {/* Integration */}
        <Card className="p-8 bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
          <h2 className="text-2xl font-semibold mb-4 text-white flex items-center gap-2">
            <Network className="w-6 h-6" />
            三位一体的闭环生态
          </h2>
          <p className="text-slate-300 leading-relaxed mb-6">
            资产发行、交易流通、现实消费三大功能模块相互协同，形成完整的价值闭环：
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">发行</div>
              <p className="text-sm text-slate-400">
                优质资产上链通证化
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">
                交易
              </div>
              <p className="text-sm text-slate-400">
                DEX平台自由流通
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">
                消费
              </div>
              <p className="text-sm text-slate-400">
                链接现实世界权益
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

