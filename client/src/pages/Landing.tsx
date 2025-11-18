import React from "react";
import { Link } from "wouter";
import { PageLayout } from "@/components/layout/PageLayout";
import { Section } from "@/components/layout/Section";
import { ThemedCard, ThemedButton, ThemedBadge } from "@/components/themed";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/routes";
import {
  Zap,
  Globe,
  Lock,
  TrendingUp,
  ShoppingCart,
  Wallet,
  BarChart3,
  ArrowRight,
  Rocket,
} from "lucide-react";

export default function Landing() {
  const { theme } = useTheme();

  // Statistics data
  const stats = [
    { label: "24h Volume", value: "$2.65M" },
    { label: "Active Users", value: "12,382" },
    { label: "Rewards Paid", value: "$183k" },
  ];

  // Platform features
  const features = [
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
  ];

  // ProjectX modules
  const modules = [
    {
      icon: ShoppingCart,
      title: "交易市场",
      desc: "去中心化的影响力代币交易平台，支持实时报价、订单撮合和低手续费交易通道",
      features: ["实时交易", "订单撮合", "低手续费"],
    },
    {
      icon: Wallet,
      title: "Reserve Pool",
      desc: "智能资金池管理系统，自动归集手续费、管理金库并执行 $POI 回购策略",
      features: ["手续费归集", "金库管理", "$POI 回购"],
    },
    {
      icon: BarChart3,
      title: "商家后台",
      desc: "专业的商家管理界面，支持自主定价、订单管理和税务报表生成",
      features: ["自主定价", "订单管理", "税务报表"],
    },
  ];

  const titleStyles = theme === 'cyberpunk'
    ? 'text-3xl md:text-5xl font-extrabold leading-tight font-orbitron tracking-tight'
    : 'text-3xl md:text-5xl font-extrabold leading-tight font-fredoka';

  const accentTextStyles = theme === 'cyberpunk'
    ? 'text-cyan-300'
    : 'text-blue-600';

  const subtitleStyles = theme === 'cyberpunk'
    ? 'mt-4 max-w-xl text-sm md:text-base text-slate-300 font-rajdhani'
    : 'mt-4 max-w-xl text-sm md:text-base text-slate-600 font-poppins';

  return (
    <PageLayout>
      {/* Hero Section */}
      <Section className="pt-12 pb-16 md:pt-16 md:pb-24">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <h1 className={titleStyles}>
              {theme === 'cyberpunk' ? (
                <>
                  Trade-grade UX for{' '}
                  <span className={accentTextStyles}>On-chain</span> Growth
                </>
              ) : (
                <>
                  Play • Earn • Share —{' '}
                  <span className={accentTextStyles}>ProjectX</span>
                </>
              )}
            </h1>
            <p className={subtitleStyles}>
              {theme === 'cyberpunk'
                ? '深色赛博 + 霓虹风的专业体验：更快的决策、更高的信息密度、更冷静的视觉干扰。'
                : '明亮友好的新手入口：积分、勋章与任务系统，把增长做成好玩又容易传播的事情。'}
            </p>

            {/* CTA Buttons */}
            <div className="mt-6 flex gap-3 flex-wrap">
              <Link href={ROUTES.APP_IMMORTALITY}>
                <ThemedButton emphasis>
                  {theme === 'cyberpunk' ? 'Launch Immortality' : 'Enter Immortality'}
                </ThemedButton>
              </Link>
              <Link href={ROUTES.APP_TRADE}>
                <ThemedButton variant="outline">
                  {theme === 'cyberpunk' ? 'Buy POI' : 'Go to TGESale'}
                </ThemedButton>
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-8 grid grid-cols-3 gap-3 text-xs md:text-sm">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <div className={cn(
                    'text-xs opacity-60',
                    theme === 'cyberpunk' ? 'font-rajdhani' : 'font-poppins'
                  )}>
                    {stat.label}
                  </div>
                  <div className={cn(
                    'mt-1 text-base font-semibold',
                    theme === 'cyberpunk' ? 'font-rajdhani text-cyan-300' : 'font-poppins text-blue-600'
                  )}>
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Preview Card */}
          <ThemedCard className="p-6">
            <div className={cn(
              'text-xs mb-3',
              theme === 'cyberpunk' ? 'text-cyan-200/80 font-rajdhani' : 'text-slate-500 font-poppins'
            )}>
              {theme === 'cyberpunk' ? 'LIVE • Trading Panel' : 'PLAY • Level Panel'}
            </div>
            <div className="space-y-3">
              <div className={cn(
                'p-4 rounded-lg',
                theme === 'cyberpunk'
                  ? 'bg-slate-900/60 border border-cyan-400/20'
                  : 'bg-slate-50 border border-slate-200'
              )}>
                <div className="text-sm font-semibold mb-2">
                  {theme === 'cyberpunk' ? 'Market Overview' : 'Your Progress'}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="opacity-70">TVL</div>
                    <div className="font-bold text-lg">$12.3M</div>
                  </div>
                  <div>
                    <div className="opacity-70">APR</div>
                    <div className="font-bold text-lg text-green-500">7.8%</div>
                  </div>
                </div>
              </div>
            </div>
          </ThemedCard>
        </div>
      </Section>

      {/* Platform Features */}
      <Section title="平台优势" subtitle="为什么选择 ProofOfInfluence">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <ThemedCard key={feature.title} hover className="p-5">
                <Icon className={cn(
                  'w-10 h-10 mb-3',
                  theme === 'cyberpunk' ? 'text-cyan-400' : 'text-blue-600'
                )} />
                <h3 className={cn(
                  'text-base font-semibold mb-2',
                  theme === 'cyberpunk' ? 'font-rajdhani' : 'font-poppins'
                )}>
                  {feature.title}
                </h3>
                <p className="text-sm opacity-80">{feature.desc}</p>
              </ThemedCard>
            );
          })}
        </div>
      </Section>

      {/* ProjectX Modules */}
      <Section
        title="ProjectX 核心模块"
        subtitle="构建完整的影响力变现生态系统"
      >
        <div className="grid gap-6 md:grid-cols-3">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <ThemedCard key={module.title} hover className="p-6">
                <Icon className={cn(
                  'w-12 h-12 mb-4',
                  theme === 'cyberpunk' ? 'text-pink-400' : 'text-green-600'
                )} />
                <h3 className={cn(
                  'text-lg font-bold mb-2',
                  theme === 'cyberpunk' ? 'font-orbitron' : 'font-fredoka'
                )}>
                  {module.title}
                </h3>
                <p className="text-sm opacity-80 mb-4">{module.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {module.features.map((feat) => (
                    <ThemedBadge key={feat}>{feat}</ThemedBadge>
                  ))}
                </div>
              </ThemedCard>
            );
          })}
        </div>
      </Section>

      {/* TGE Banner */}
      <Section>
        <ThemedCard className="p-8 text-center">
          <Rocket className={cn(
            'w-12 h-12 mx-auto mb-4',
            theme === 'cyberpunk' ? 'text-cyan-400' : 'text-blue-600'
          )} />
          <h3 className={cn(
            'text-2xl font-bold mb-2',
            theme === 'cyberpunk' ? 'font-orbitron' : 'font-fredoka'
          )}>
            TGE 即将启动
          </h3>
          <p className="text-sm opacity-80 mb-6 max-w-2xl mx-auto">
            加入早鸟计划，获取独家空投和推荐奖励
          </p>
          <div className="flex justify-center gap-3">
            <Link href={ROUTES.TGE}>
              <ThemedButton emphasis size="lg">
                参与 TGE
                <ArrowRight className="w-4 h-4 ml-2" />
              </ThemedButton>
            </Link>
            <Link href={ROUTES.EARLY_BIRD}>
              <ThemedButton variant="outline" size="lg">
                注册早鸟
              </ThemedButton>
            </Link>
          </div>
        </ThemedCard>
      </Section>

      {/* Quick Links */}
      <Section title="快速导航" subtitle="探索 ProofOfInfluence 生态系统">
        <div className="grid gap-4 md:grid-cols-4">
          <Link href={ROUTES.SOLUTIONS}>
            <ThemedCard hover className="p-5 cursor-pointer">
              <h4 className="font-semibold mb-1">解决方案</h4>
              <p className="text-xs opacity-70">了解我们的产品</p>
            </ThemedCard>
          </Link>
          <Link href={ROUTES.TOKEN}>
            <ThemedCard hover className="p-5 cursor-pointer">
              <h4 className="font-semibold mb-1">Token 文档</h4>
              <p className="text-xs opacity-70">$POI 代币经济</p>
            </ThemedCard>
          </Link>
          <Link href={ROUTES.USE_CASES}>
            <ThemedCard hover className="p-5 cursor-pointer">
              <h4 className="font-semibold mb-1">应用案例</h4>
              <p className="text-xs opacity-70">真实场景应用</p>
            </ThemedCard>
          </Link>
          <Link href={ROUTES.ABOUT}>
            <ThemedCard hover className="p-5 cursor-pointer">
              <h4 className="font-semibold mb-1">关于我们</h4>
              <p className="text-xs opacity-70">了解团队愿景</p>
            </ThemedCard>
          </Link>
        </div>
      </Section>
    </PageLayout>
  );
}
