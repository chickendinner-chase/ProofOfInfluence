import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Building2,
  Palette,
  TrendingUp,
  Music,
  Home,
  Gem,
  Trophy,
  Briefcase,
  ArrowRight,
} from "lucide-react";

export default function UseCases() {
  const lang = "zh";

  const cases = [
    {
      icon: Home,
      category: "房地产",
      title: "房地产份额代币化",
      description: "将高价值房地产资产分割成小额可交易的代币份额，降低投资门槛，提高流动性。",
      scenario: "某豪华公寓项目发行 1000 万枚代币，每枚代表 0.0001% 的房产所有权。投资者可以从 100 USDC 起投资高端房产。",
      benefits: [
        "投资门槛降低 99%",
        "24/7 全球化交易",
        "智能合约自动分红",
        "合规透明管理",
      ],
      tags: ["RWA", "非金融资产", "投资"],
    },
    {
      icon: Palette,
      category: "艺术品",
      title: "艺术品所有权 NFT",
      description: "将实体艺术品的所有权和版权代币化，支持碎片化持有、交易和展览收益分配。",
      scenario: "价值 500 万美元的当代艺术作品被代币化为 10,000 份 NFT。持有者共享作品增值和展览收入，并可参与作品巡展决策。",
      benefits: [
        "民主化艺术品投资",
        "透明的所有权记录",
        "自动化版税分配",
        "全球二级市场",
      ],
      tags: ["NFT", "艺术", "收藏"],
    },
    {
      icon: Music,
      category: "音乐版权",
      title: "音乐版权代币化",
      description: "将歌曲的流媒体收益权代币化，让粉丝成为音乐作品的共同受益人。",
      scenario: "某流行歌手将新专辑未来 3 年的版权收益 50% 代币化。粉丝购买代币后，根据歌曲播放量自动获得收益分成。",
      benefits: [
        "粉丝参与音乐价值创造",
        "创作者获得预先资金",
        "透明的收益分配",
        "可交易的版权份额",
      ],
      tags: ["版权", "创作者经济", "Web3"],
    },
    {
      icon: Gem,
      category: "奢侈品",
      title: "限量版商品认证",
      description: "为限量版商品发行 NFT 数字证书，防伪溯源并增加收藏价值。",
      scenario: "某奢侈品牌为限量手表发行 NFT 证书，记录生产、销售、转手历史。二手交易时 NFT 自动转移，确保真伪可验证。",
      benefits: [
        "杜绝假货流通",
        "完整溯源记录",
        "提升二手价值",
        "品牌忠诚度计划",
      ],
      tags: ["防伪", "NFT", "溯源"],
    },
    {
      icon: Trophy,
      category: "体育",
      title: "体育俱乐部粉丝代币",
      description: "发行球队/俱乐部粉丝代币，粉丝可投票决策、获得专属福利和参与收益分享。",
      scenario: "某足球俱乐部发行粉丝代币，持有者可投票选择球衣设计、参加见面会、获得比赛门票优先购买权并分享赞助收益。",
      benefits: [
        "增强粉丝参与感",
        "新的收入来源",
        "全球粉丝社区",
        "民主化俱乐部决策",
      ],
      tags: ["社区", "治理", "粉丝经济"],
    },
    {
      icon: Briefcase,
      category: "股权融资",
      title: "初创企业股权代币",
      description: "将初创企业股权通证化，支持小额投资和全球众筹。",
      scenario: "某科技创业公司将 A 轮融资的 10% 股权代币化，全球投资者可从 500 USDC 起参与投资，智能合约管理分红和退出。",
      benefits: [
        "扩大投资者群体",
        "提高融资效率",
        "透明的股权管理",
        "二级市场流动性",
      ],
      tags: ["融资", "股权", "Web3"],
    },
    {
      icon: Building2,
      category: "会员权益",
      title: "高端会所会员 NFT",
      description: "将会所会员资格 NFT 化，支持转让、出租和权益升级。",
      scenario: "某高尔夫俱乐部将会员卡改为 NFT。会员可以将未使用的权益短期出租给他人，或在二级市场转让会员资格。",
      benefits: [
        "会员权益流动化",
        "降低会员资格浪费",
        "透明的权益管理",
        "新会员获取渠道",
      ],
      tags: ["会员", "NFT", "共享经济"],
    },
    {
      icon: TrendingUp,
      category: "碳信用",
      title: "碳信用额度交易",
      description: "将碳信用额度代币化，创建透明高效的碳交易市场。",
      scenario: "某可再生能源项目将其产生的碳信用代币化。企业购买这些代币抵消碳排放，所有交易和抵消记录不可篡改地存储在链上。",
      benefits: [
        "透明的碳足迹追踪",
        "高效的碳交易",
        "防止双重计算",
        "激励绿色项目",
      ],
      tags: ["ESG", "环境", "RWA"],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Header lang={lang} />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            应用案例
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed">
            探索我们的应用案例：从代币化房地产基金到 NFT 艺术品销售，ACEE 平台覆盖金融与非金融领域的多个场景。
            了解每个案例的实施方案与成效。
          </p>
        </div>
      </section>

      {/* Use Cases Grid */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {cases.map((useCase) => {
            const Icon = useCase.icon;
            return (
              <Card
                key={useCase.title}
                className="p-8 bg-slate-800/50 border-slate-700 hover:bg-slate-800 transition-all group"
              >
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-slate-700/50 flex items-center justify-center group-hover:bg-slate-700 transition-colors">
                        <Icon className="w-7 h-7 text-slate-300" />
                      </div>
                      <div>
                        <div className="text-sm text-slate-500 mb-1">
                          {useCase.category}
                        </div>
                        <h3 className="text-xl font-semibold text-white">
                          {useCase.title}
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-slate-400 leading-relaxed">
                    {useCase.description}
                  </p>

                  {/* Scenario */}
                  <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-700">
                    <div className="text-sm font-semibold text-slate-300 mb-2">
                      实施案例
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      {useCase.scenario}
                    </p>
                  </div>

                  {/* Benefits */}
                  <div>
                    <div className="text-sm font-semibold text-slate-300 mb-3">
                      核心收益
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {useCase.benefits.map((benefit) => (
                        <div
                          key={benefit}
                          className="flex items-start gap-2 text-sm"
                        >
                          <span className="text-green-500 mt-0.5">✓</span>
                          <span className="text-slate-400">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {useCase.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-3 py-1 rounded-full bg-slate-700/50 text-slate-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Categories Summary */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <Card className="p-12 bg-slate-800/30 border-slate-700">
          <div className="text-center space-y-6">
            <h2 className="text-3xl font-bold text-white">
              覆盖多个行业场景
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              从实物资产（房地产、艺术品）到数字权益（版权、会员），
              ACEE 平台为各种资产类型提供代币化解决方案
            </p>
            <div className="grid md:grid-cols-4 gap-6 pt-8">
              {[
                { label: "实物资产", count: "RWA" },
                { label: "数字版权", count: "IP" },
                { label: "会员权益", count: "NFT" },
                { label: "融资工具", count: "STO" },
              ].map((category) => (
                <div key={category.label} className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">
                    {category.count}
                  </div>
                  <div className="text-slate-400">{category.label}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <Card className="p-12 bg-gradient-to-r from-slate-800 to-slate-700 border-slate-600 text-center">
          <div className="space-y-6 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              您的资产也能代币化
            </h2>
            <p className="text-lg text-slate-300">
              联系我们的团队，探讨您的业务如何通过代币化创造新价值
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="bg-white text-slate-900 hover:bg-slate-100 px-8"
                >
                  开始咨询
                </Button>
              </Link>
              <Link href="/for-brands">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-slate-500 hover:bg-slate-800 px-8 text-white"
                >
                  了解品牌方案
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </section>

      <Footer lang={lang} />
    </div>
  );
}
