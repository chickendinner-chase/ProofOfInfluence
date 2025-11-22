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

  // Platform features - aligned with Value Internet vision
  const features = [
    {
      icon: Zap,
      title: "标准化",
      desc: "将影响力、身份、AI 行为和 RWA 标准化为可互操作的价值单元",
    },
    {
      icon: Globe,
      title: "可验证",
      desc: "所有价值单元在链上可验证，确保真实性和防止欺诈",
    },
    {
      icon: Lock,
      title: "可协作",
      desc: "价值单元可以跨应用和网络组合、交易和协调",
    },
    {
      icon: TrendingUp,
      title: "可激励",
      desc: "统一的 POI 激励机制连接平台使用、价值分配和治理权",
    },
  ];

  // ProjectEX modules - social-financial hub
  const modules = [
    {
      icon: ShoppingCart,
      title: "代币化与交易",
      desc: "将 RWA、IP、品牌权益和影响力代币化，提供去中心化交易和流动性管理",
      features: ["资产代币化", "DEX 集成", "流动性池"],
    },
    {
      icon: Wallet,
      title: "链上协调",
      desc: "通过智能合约实现价值交换、质押、抵押和跨链互操作性",
      features: ["智能合约", "跨链协议", "价值协调"],
    },
    {
      icon: BarChart3,
      title: "激励与身份",
      desc: "任务系统、推荐计划、徽章成就和链上身份声誉体系",
      features: ["任务系统", "推荐奖励", "链上声誉"],
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
                  Building the{' '}
                  <span className={accentTextStyles}>Value Internet</span>
                </>
              ) : (
                <>
                  Welcome to the{' '}
                  <span className={accentTextStyles}>Value Internet</span>
                </>
              )}
            </h1>
            <p className={subtitleStyles}>
              {theme === 'cyberpunk'
                ? 'Acee 正在构建价值互联网——将影响力、身份、AI 行为和现实世界资产标准化为可验证、可组合和可激励的价值单元。'
                : 'ProjectEX 是价值互联网的社交金融枢纽，帮助品牌、创作者和用户将价值代币化、协调和变现。'}
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
      <Section title="价值互联网核心原则" subtitle="标准化、可验证、可协作、可激励">
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

      {/* ProjectEX Modules */}
      <Section
        title="ProjectEX 核心模块"
        subtitle="价值互联网的社交金融枢纽"
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
            加入价值互联网的早期建设者，通过 POI 代币参与统一价值层的激励与治理
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
