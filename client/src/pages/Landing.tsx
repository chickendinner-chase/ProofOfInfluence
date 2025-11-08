import React, { useMemo, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import POITokenPrice from "@/components/POITokenPrice";
import { useAuth } from "@/hooks/useAuth";
import {
  Rocket,
  Layers,
  Users,
  Building2,
  FileText,
  Coins,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  Zap,
  Globe,
  Lock,
  ShoppingCart,
  Wallet,
  BarChart3,
  DollarSign,
} from "lucide-react";

// i18n/config (ZH only for now; extendable to EN)
const zh = {
  brand: "ACEE Ventures",
  hero: {
    title: "引领社交金融创新",
    subtitle: "打造影响力变现平台",
    description:
      "projectX 是 ACEE Ventures 研发的一站式影响力变现平台，$POI 作为流量价值载体，帮助创作者和品牌将影响力转化为真实价值。通过一体化平台实现代币发行、社区管理和价值流通。",
    primaryCTA: "开始使用",
    secondaryCTA: "了解更多",
  },
  features: {
    title: "平台优势",
    items: [
      {
        icon: Zap,
        title: "一站式服务",
        desc: "从代币发行到社区管理，所有功能集成在统一仪表盘",
      },
      {
        icon: Globe,
        title: "多角色支持",
        desc: "为品牌方、创作者和开发者提供定制化解决方案",
      },
      {
        icon: Lock,
        title: "安全合规",
        desc: "严格遵守 KYC/AML 要求，确保平台安全可靠",
      },
      {
        icon: TrendingUp,
        title: "生态增长",
        desc: "通过 $POI 代币激励和治理机制促进生态发展",
      },
    ],
  },
  projectX: {
    title: "ProjectX 核心模块",
    subtitle: "构建完整的影响力变现生态系统",
    description: "ProjectX 集成了市场交易、资金池管理和商家后台三大核心功能，为创作者、品牌和平台提供完整的价值流通解决方案。",
    modules: [
      {
        icon: ShoppingCart,
        title: "交易市场",
        desc: "去中心化的影响力代币交易平台，支持实时报价、订单撮合和低手续费交易通道",
        features: ["实时交易", "订单撮合", "低手续费"],
        color: "blue",
      },
      {
        icon: Wallet,
        title: "Reserve Pool",
        desc: "智能资金池管理系统，自动归集手续费、管理金库并执行 $POI 回购策略",
        features: ["手续费归集", "金库管理", "$POI 回购"],
        color: "green",
      },
      {
        icon: BarChart3,
        title: "商家后台",
        desc: "专业的商家管理界面，支持自主定价、订单管理和税务报表生成",
        features: ["自主定价", "订单管理", "税务报表"],
        color: "purple",
      },
    ],
  },
  quickLinks: {
    title: "快速导航",
    products: {
      title: "产品",
      desc: "探索我们的产品生态",
      icon: Layers,
      href: "/products",
    },
    creators: {
      title: "创作者专区",
      desc: "为创作者打造的工具",
      icon: Users,
      href: "/for-creators",
    },
    brands: {
      title: "品牌专区",
      desc: "助力品牌进入 Web3",
      icon: Building2,
      href: "/for-brands",
    },
    useCases: {
      title: "应用案例",
      desc: "查看真实应用场景",
      icon: FileText,
      href: "/use-cases",
    },
    token: {
      title: "Token & 文档",
      desc: "$POI 白皮书与文档",
      icon: Coins,
      href: "/token-docs",
    },
    compliance: {
      title: "合规",
      desc: "了解我们的合规政策",
      icon: ShieldCheck,
      href: "/compliance",
    },
  },
  cta: {
    title: "准备好开始了吗？",
    description: "立即连接钱包，访问您的专属 projectX",
    button: "进入 projectX",
  },
};

export default function Landing() {
  const [lang, setLang] = useState("zh");
  const t = useMemo(() => zh, [lang]);
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Header lang={lang} />

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold leading-tight text-white">
            {t.hero.title}
          </h1>
          <p className="text-2xl md:text-3xl text-slate-300 font-semibold">
            {t.hero.subtitle}
          </p>
          
          {/* POI Token Price Display */}
          <div className="py-6">
            <POITokenPrice />
          </div>
          
          <p className="text-lg text-slate-400 leading-relaxed max-w-3xl mx-auto">
            {t.hero.description}
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link href={isAuthenticated ? "/app" : "/login"}>
              <Button
                size="lg"
                className="bg-white text-slate-900 hover:bg-slate-100 px-8 text-xl py-6"
              >
                {t.hero.primaryCTA}
              </Button>
            </Link>
            <Link href="/products">
              <Button
                size="lg"
                variant="outline"
                className="border-slate-700 hover:bg-slate-800 px-8 text-xl py-6"
              >
                {t.hero.secondaryCTA}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-white mb-12">
          {t.features.title}
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {t.features.items.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="p-6 bg-slate-800/50 border-slate-700 hover:bg-slate-800 transition-all"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-700/50 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-slate-300" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ProjectX Showcase Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            {t.projectX.title}
          </h2>
          <p className="text-xl text-slate-300 font-semibold">
            {t.projectX.subtitle}
          </p>
          <p className="text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
            {t.projectX.description}
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 mt-12">
          {t.projectX.modules.map((module, index) => {
            const Icon = module.icon;
            const colorClasses = {
              blue: "from-blue-900/50 to-blue-800/30 border-blue-700/50",
              green: "from-green-900/50 to-green-800/30 border-green-700/50",
              purple: "from-purple-900/50 to-purple-800/30 border-purple-700/50",
            };
            return (
              <Card
                key={index}
                className={`p-8 bg-gradient-to-br ${colorClasses[module.color]} hover:scale-105 transition-all duration-300`}
              >
                <div className="space-y-6">
                  <div className="w-16 h-16 rounded-2xl bg-slate-700/50 flex items-center justify-center">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-3">
                      {module.title}
                    </h3>
                    <p className="text-slate-300 leading-relaxed mb-4">
                      {module.desc}
                    </p>
                  </div>
                  <div className="space-y-2">
                    {module.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-slate-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Link href={isAuthenticated ? "/app" : "/login"}>
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-10 text-lg py-6"
            >
              探索 ProjectX <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Feature Deep Dive Sections */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Low Fee Channel */}
          <Card className="p-8 bg-slate-800/50 border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="w-8 h-8 text-blue-400" />
              <h3 className="text-2xl font-bold text-white">低手续费通道</h3>
            </div>
            <p className="text-slate-300 leading-relaxed mb-4">
              ProjectX 提供行业领先的低手续费交易通道，通过优化的费用路径和智能合约设计，让每笔交易都更经济实惠。
            </p>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2"></div>
                <span>仅 0.3% 交易手续费</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2"></div>
                <span>自动归集到 Reserve Pool</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2"></div>
                <span>支持生态系统可持续发展</span>
              </li>
            </ul>
          </Card>

          {/* Compliance & Tax Structure */}
          <Card className="p-8 bg-slate-800/50 border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="w-8 h-8 text-green-400" />
              <h3 className="text-2xl font-bold text-white">合规与税务结构</h3>
            </div>
            <p className="text-slate-300 leading-relaxed mb-4">
              ACEE Ventures 严格遵守全球监管要求，为用户和商家提供合规、透明的税务解决方案。
            </p>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2"></div>
                <span>完善的 KYC/AML 合规流程</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2"></div>
                <span>自动化税务报表生成</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2"></div>
                <span>跨境税务优化结构</span>
              </li>
            </ul>
          </Card>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-white mb-12">
          {t.quickLinks.title}
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.values(t.quickLinks)
            .filter((item) => typeof item === "object" && "href" in item)
            .map((item: any) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <Card className="p-6 bg-slate-800/50 border-slate-700 hover:bg-slate-800 transition-all cursor-pointer group h-full">
                    <div className="space-y-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-700/50 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-slate-300" />
                      </div>
                      <h3 className="text-xl font-semibold text-white">
                        {item.title}
                      </h3>
                      <p className="text-sm text-slate-400 leading-relaxed">
                        {item.desc}
                      </p>
                      <div className="flex items-center text-sm text-slate-400 group-hover:text-white transition-colors pt-2">
                        了解更多 <ArrowRight className="w-4 h-4 ml-1" />
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <Card className="p-12 bg-gradient-to-r from-slate-800 to-slate-700 border-slate-600 text-center">
          <div className="space-y-6 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              {t.cta.title}
            </h2>
            <p className="text-lg text-slate-300">
              {t.cta.description}
            </p>
            <Link href={isAuthenticated ? "/app" : "/login"}>
              <Button
                size="lg"
                className="bg-white text-slate-900 hover:bg-slate-100 px-8 text-xl py-6"
              >
                {t.cta.button}
              </Button>
            </Link>
          </div>
        </Card>
      </section>

      <Footer lang={lang} />
    </div>
  );
}
