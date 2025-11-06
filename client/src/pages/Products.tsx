import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Coins,
  TrendingUp,
  Image,
  Vote,
  Wallet,
  BarChart3,
  Shield,
  Zap,
  ArrowRight,
} from "lucide-react";

export default function Products() {
  const lang = "zh";

  const products = [
    {
      icon: Coins,
      title: "代币发行",
      description: "轻松创建和发行 ERC-20 代币，无需编写智能合约代码。支持自定义代币经济模型、分配规则和销毁机制。",
      features: [
        "一键发行 ERC-20 代币",
        "自定义代币经济模型",
        "自动流动性管理",
        "多链支持（Ethereum, Base, Arbitrum）",
      ],
      cta: "开始发行",
      href: "/dashboard",
    },
    {
      icon: TrendingUp,
      title: "质押挖矿",
      description: "为您的代币设置质押池，让社区成员通过质押获得奖励。支持灵活的质押期限和收益率配置。",
      features: [
        "灵活的质押周期设置",
        "动态收益率调整",
        "自动复利功能",
        "实时收益追踪",
      ],
      cta: "了解更多",
      href: "/dashboard",
    },
    {
      icon: Image,
      title: "NFT 服务",
      description: "创建和管理 NFT 集合，支持白名单铸造、盲盒机制和版税设置。适用于艺术品、会员卡和数字藏品。",
      features: [
        "ERC-721 / ERC-1155 支持",
        "白名单和空投功能",
        "版税自动分配",
        "元数据托管服务",
      ],
      cta: "创建 NFT",
      href: "/dashboard",
    },
    {
      icon: Vote,
      title: "治理平台",
      description: "构建去中心化治理系统，让代币持有者参与项目决策。支持提案创建、投票和自动执行。",
      features: [
        "链上治理提案",
        "多签钱包集成",
        "投票权重计算",
        "提案自动执行",
      ],
      cta: "启用治理",
      href: "/dashboard",
    },
    {
      icon: Wallet,
      title: "钱包管理",
      description: "统一管理多链钱包资产，查看实时余额、交易历史和代币持仓。支持 MetaMask 和 WalletConnect。",
      features: [
        "多链资产聚合",
        "交易历史记录",
        "Gas 费优化建议",
        "安全交易签名",
      ],
      cta: "连接钱包",
      href: "/dashboard",
    },
    {
      icon: BarChart3,
      title: "数据分析",
      description: "深入了解您的代币表现、用户行为和社区增长。提供实时图表和可导出报告。",
      features: [
        "实时数据仪表盘",
        "用户行为分析",
        "持币地址追踪",
        "数据报告导出",
      ],
      cta: "查看分析",
      href: "/dashboard",
    },
  ];

  const integrations = [
    {
      icon: Shield,
      title: "安全审计",
      description: "与顶级安全公司合作，为您的智能合约提供审计服务",
    },
    {
      icon: Zap,
      title: "API 接入",
      description: "开放 API 文档，支持自定义集成和自动化操作",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Header lang={lang} />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            产品生态
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed">
            我们的产品涵盖代币发行、质押挖矿、NFT 交易和治理系统等，满足不同 Web3 场景需求。
            通过 Dashboard 一站式访问所有功能，使用便捷。
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {products.map((product) => {
            const Icon = product.icon;
            return (
              <Card
                key={product.title}
                className="p-8 bg-slate-800/50 border-slate-700 hover:bg-slate-800 transition-all group"
              >
                <div className="space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="w-14 h-14 rounded-xl bg-slate-700/50 flex items-center justify-center group-hover:bg-slate-700 transition-colors">
                      <Icon className="w-7 h-7 text-slate-300" />
                    </div>
                    <Link href={product.href}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-400 hover:text-white"
                      >
                        {product.cta} <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-semibold text-white mb-3">
                      {product.title}
                    </h3>
                    <p className="text-slate-400 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  <ul className="space-y-2">
                    {product.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start text-sm text-slate-400"
                      >
                        <span className="text-slate-500 mr-2">•</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Integrations Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            集成与服务
          </h2>
          <p className="text-slate-400">
            提供额外的增值服务，助力您的项目成功
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {integrations.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.title}
                className="p-6 bg-slate-800/50 border-slate-700"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-slate-700/50 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-slate-300" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-slate-400">
                      {item.description}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <Card className="p-12 bg-gradient-to-r from-slate-800 to-slate-700 border-slate-600 text-center">
          <div className="space-y-6 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              准备好开始了吗？
            </h2>
            <p className="text-lg text-slate-300">
              连接您的钱包，立即访问所有产品功能
            </p>
            <Link href="/dashboard">
              <Button
                size="lg"
                className="bg-white text-slate-900 hover:bg-slate-100 px-8"
              >
                进入控制面板
              </Button>
            </Link>
          </div>
        </Card>
      </section>

      <Footer lang={lang} />
    </div>
  );
}
