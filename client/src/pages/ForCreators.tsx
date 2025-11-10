import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Sparkles,
  Users,
  Coins,
  Zap,
  TrendingUp,
  Gift,
  MessageCircle,
  BarChart3,
  CheckCircle2,
} from "lucide-react";

export default function ForCreators() {
  const lang = "zh";
  const isAuthenticated = false;

  const features = [
    {
      icon: Coins,
      title: "轻松发币",
      description: "无需技术背景，几分钟内创建您的专属代币。设置代币名称、符号和总量，开始您的 Web3 之旅。",
    },
    {
      icon: Users,
      title: "社区激励",
      description: "通过代币空投、质押奖励和持币福利激励您的粉丝，建立更紧密的社区联系。",
    },
    {
      icon: Gift,
      title: "专属福利",
      description: "为代币持有者提供独家内容、早期访问权和特殊福利，增强粉丝忠诚度。",
    },
    {
      icon: TrendingUp,
      title: "收益变现",
      description: "通过代币销售、会员订阅和创作者经济模式实现内容变现，获得持续收益。",
    },
    {
      icon: MessageCircle,
      title: "社群管理",
      description: "使用内置的社群管理工具，轻松与粉丝互动，发布公告和举办活动。",
    },
    {
      icon: BarChart3,
      title: "数据洞察",
      description: "查看详细的粉丝数据、代币持有分布和互动统计，优化您的社区策略。",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "连接钱包",
      description: "使用 MetaMask 或其他 Web3 钱包连接到 ACEE 平台",
    },
    {
      number: "02",
      title: "创建代币",
      description: "填写代币信息，设置经济模型，一键发行您的创作者代币",
    },
    {
      number: "03",
      title: "建立社区",
      description: "通过空投、活动和内容发布吸引并激励您的粉丝",
    },
    {
      number: "04",
      title: "持续增长",
      description: "利用数据分析优化策略，扩大影响力并增加收益",
    },
  ];

  const useCases = [
    {
      title: "内容创作者",
      description: "YouTuber、博主和播客主通过发行代币为粉丝提供独家内容访问权和投票权。",
      icon: Sparkles,
    },
    {
      title: "艺术家",
      description: "数字艺术家发行 NFT 和创作者代币，建立收藏者社区并获得持续版税收入。",
      icon: Zap,
    },
    {
      title: "KOL / 影响者",
      description: "社交媒体影响者通过代币化社区运营，提供粉丝专属福利和互动机会。",
      icon: Users,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Header lang={lang} />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-block">
            <span className="text-sm font-semibold px-4 py-2 rounded-full bg-slate-800 text-slate-300">
              为创作者打造
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            赋能创作者，让您的影响力价值化
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed">
            ACEE 为创作者提供强大的 Web3 工具，帮助您轻松发行代币、激励粉丝并创建专属社区。
            无需技术背景，开启您的创作者经济新时代。
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link href={isAuthenticated ? "/app" : "/login"}>
              <Button
                size="lg"
                className="bg-white text-slate-900 hover:bg-slate-100 px-8 text-xl py-6"
              >
                免费开始
              </Button>
            </Link>
            <Link href="/use-cases">
              <Button
                size="lg"
                variant="outline"
                className="border-slate-700 hover:bg-slate-800 px-8 text-xl py-6"
              >
                查看案例
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            专为创作者设计的功能
          </h2>
          <p className="text-slate-400">
            一站式工具，助您构建和管理 Web3 创作者社区
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
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
                    {feature.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            如何开始
          </h2>
          <p className="text-slate-400">
            四步启动您的创作者代币和社区
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              <Card className="p-6 bg-slate-800/50 border-slate-700 h-full">
                <div className="space-y-4">
                  <div className="text-4xl font-bold text-slate-700">
                    {step.number}
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-400">
                    {step.description}
                  </p>
                </div>
              </Card>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-slate-700" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Use Cases */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            成功案例
          </h2>
          <p className="text-slate-400">
            看看其他创作者如何使用 ACEE 平台
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {useCases.map((useCase) => {
            const Icon = useCase.icon;
            return (
              <Card
                key={useCase.title}
                className="p-8 bg-slate-800/50 border-slate-700 hover:bg-slate-800 transition-all text-center"
              >
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-xl bg-slate-700/50 flex items-center justify-center mx-auto">
                    <Icon className="w-7 h-7 text-slate-300" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">
                    {useCase.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {useCase.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <Card className="p-12 bg-slate-800/30 border-slate-700">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-white">
                为什么选择 ACEE？
              </h2>
              <ul className="space-y-4">
                {[
                  "无需编程知识，界面简单易用",
                  "低成本启动，无隐藏费用",
                  "全程技术支持和社区指导",
                  "安全可靠的智能合约基础设施",
                  "与主流钱包和平台无缝集成",
                ].map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-center">
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="bg-white text-slate-900 hover:bg-slate-100 px-8"
                >
                  立即开始创作
                </Button>
              </Link>
              <p className="text-sm text-slate-400 mt-4">
                免费注册，无需信用卡
              </p>
            </div>
          </div>
        </Card>
      </section>

      <Footer lang={lang} />
    </div>
  );
}
