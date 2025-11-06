import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Building2,
  Users,
  Target,
  TrendingUp,
  Shield,
  Zap,
  Globe,
  BarChart3,
  CheckCircle2,
  Rocket,
} from "lucide-react";

export default function ForBrands() {
  const lang = "zh";

  const features = [
    {
      icon: Rocket,
      title: "快速发行",
      description: "从品牌代币创建到上线交易，全流程只需几天。我们的团队提供一对一技术支持。",
    },
    {
      icon: Users,
      title: "用户激励",
      description: "通过代币奖励激励用户参与、消费和推广，构建品牌忠诚度计划2.0。",
    },
    {
      icon: Target,
      title: "精准营销",
      description: "基于链上数据分析用户行为，实现精准的营销投放和用户触达。",
    },
    {
      icon: TrendingUp,
      title: "品牌增值",
      description: "通过代币化运营提升品牌价值，为用户提供资产增值预期，增强品牌吸引力。",
    },
    {
      icon: Shield,
      title: "合规保障",
      description: "完整的 KYC/AML 流程和法律合规支持，确保品牌安全进入 Web3 领域。",
    },
    {
      icon: Globe,
      title: "全球化",
      description: "一次发行，全球流通。接触国际用户，拓展品牌影响力到全球市场。",
    },
  ];

  const solutions = [
    {
      title: "会员积分通证化",
      description: "将传统会员积分升级为可交易的数字资产，提升用户参与度和品牌粘性。支持跨平台积分互通和二级市场交易。",
      icon: Users,
      benefits: ["提升用户活跃度 60%", "降低营销成本 40%", "增加复购率"],
    },
    {
      title: "品牌 NFT 发行",
      description: "为您的品牌创建限量版数字藏品，包括虚拟商品、会员卡和纪念品。增强品牌故事性和收藏价值。",
      icon: Zap,
      benefits: ["创造新收入来源", "增强品牌认同感", "吸引年轻用户群"],
    },
    {
      title: "去中心化营销",
      description: "构建品牌 DAO，让用户参与品牌决策和内容创作。通过代币激励用户生成内容（UGC）和口碑传播。",
      icon: Target,
      benefits: ["降低获客成本", "提升品牌传播效率", "建立社区文化"],
    },
  ];

  const steps = [
    {
      number: "01",
      title: "需求咨询",
      description: "与我们的团队沟通您的品牌目标和代币化需求",
    },
    {
      number: "02",
      title: "方案设计",
      description: "定制代币经济模型、合规方案和技术架构",
    },
    {
      number: "03",
      title: "开发部署",
      description: "智能合约开发、审计和部署，通常 2-4 周完成",
    },
    {
      number: "04",
      title: "上线运营",
      description: "协助营销推广、社区管理和持续优化",
    },
  ];

  const caseStudies = [
    {
      brand: "某连锁咖啡品牌",
      industry: "餐饮",
      result: "发行品牌代币后，会员复购率提升 65%，新用户增长 120%",
    },
    {
      brand: "某时尚零售品牌",
      industry: "零售",
      result: "通过 NFT 会员卡和代币激励，社群活跃度提升 3 倍",
    },
    {
      brand: "某健身连锁品牌",
      industry: "健康",
      result: "代币化积分系统使用户留存率提高 45%，推荐率翻倍",
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
              为品牌打造
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            助力品牌快速进入加密领域
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed">
            我们提供完整的代币发行和营销解决方案，帮助您吸引用户、提升品牌价值。
            从代币经济设计到合规部署，全程专业支持。
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link href="/dashboard">
              <Button
                size="lg"
                className="bg-white text-slate-900 hover:bg-slate-100 px-8"
              >
                咨询方案
              </Button>
            </Link>
            <Link href="/use-cases">
              <Button
                size="lg"
                variant="outline"
                className="border-slate-700 hover:bg-slate-800 px-8"
              >
                查看案例
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            品牌专属功能
          </h2>
          <p className="text-slate-400">
            为企业级客户定制的 Web3 解决方案
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

      {/* Solutions */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            行业解决方案
          </h2>
          <p className="text-slate-400">
            针对不同行业的定制化 Web3 解决方案
          </p>
        </div>

        <div className="space-y-6">
          {solutions.map((solution) => {
            const Icon = solution.icon;
            return (
              <Card
                key={solution.title}
                className="p-8 bg-slate-800/50 border-slate-700 hover:bg-slate-800 transition-all"
              >
                <div className="grid md:grid-cols-3 gap-6 items-start">
                  <div className="md:col-span-2 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-700/50 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-slate-300" />
                      </div>
                      <h3 className="text-2xl font-semibold text-white">
                        {solution.title}
                      </h3>
                    </div>
                    <p className="text-slate-400 leading-relaxed">
                      {solution.description}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-semibold text-slate-300 mb-3">
                      核心收益
                    </div>
                    {solution.benefits.map((benefit) => (
                      <div key={benefit} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-400">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Process */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            合作流程
          </h2>
          <p className="text-slate-400">
            从需求到上线，我们全程支持
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

      {/* Case Studies */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            成功案例
          </h2>
          <p className="text-slate-400">
            真实的品牌合作和成效
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {caseStudies.map((study) => (
            <Card
              key={study.brand}
              className="p-6 bg-slate-800/50 border-slate-700"
            >
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-slate-500 mb-1">{study.industry}</div>
                  <h3 className="text-xl font-semibold text-white">
                    {study.brand}
                  </h3>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {study.result}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <Card className="p-12 bg-gradient-to-r from-slate-800 to-slate-700 border-slate-600 text-center">
          <div className="space-y-6 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              准备开启 Web3 品牌之旅？
            </h2>
            <p className="text-lg text-slate-300">
              联系我们的团队，获取定制化解决方案和报价
            </p>
            <Link href="/dashboard">
              <Button
                size="lg"
                className="bg-white text-slate-900 hover:bg-slate-100 px-8"
              >
                预约咨询
              </Button>
            </Link>
          </div>
        </Card>
      </section>

      <Footer lang={lang} />
    </div>
  );
}
