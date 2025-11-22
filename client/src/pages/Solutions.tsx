import React from "react";
import { Link } from "wouter";
import { PageLayout } from "@/components/layout/PageLayout";
import { Section } from "@/components/layout/Section";
import { ThemedCard, ThemedButton, ThemedBadge } from "@/components/themed";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import {
  Users,
  Sparkles,
  Building2,
  Code,
  Zap,
  Globe,
  TrendingUp,
  Shield,
  Rocket,
  ArrowRight,
} from "lucide-react";

export default function Solutions() {
  const { theme } = useTheme();

  // Solution categories
  const solutions = [
    {
      icon: Users,
      title: "用户入口",
      subtitle: "User Onboarding",
      desc: "无加密基础也可上手，账号/钱包一键绑定，降低 Web3 使用门槛",
      features: ["邮箱注册", "社交登录", "钱包绑定", "新手引导"],
      color: theme === 'cyberpunk' ? 'cyan' : 'blue',
    },
    {
      icon: Sparkles,
      title: "创作者增长",
      subtitle: "Creator Growth",
      desc: "粉丝经济 × 积分激励 × 收益分成，帮助创作者将影响力变现",
      features: ["粉丝管理", "积分系统", "NFT 发行", "收益分成"],
      color: theme === 'cyberpunk' ? 'pink' : 'green',
    },
    {
      icon: Building2,
      title: "品牌营销",
      subtitle: "Brand Campaigns",
      desc: "裂变任务 / 空投 / 推荐返利，打造病毒式传播的营销活动",
      features: ["裂变任务", "空投活动", "推荐返利", "数据分析"],
      color: theme === 'cyberpunk' ? 'purple' : 'purple',
    },
    {
      icon: Code,
      title: "项目流动性",
      subtitle: "Project Liquidity",
      desc: "TGE/IDO/LP 工具 + 合规指引，为项目提供完整的代币发行解决方案",
      features: ["TGE 启动", "流动性池", "做市支持", "合规框架"],
      color: theme === 'cyberpunk' ? 'green' : 'orange',
    },
  ];

  // Key features
  const keyFeatures = [
    {
      icon: Zap,
      title: "标准化能力",
      desc: "将影响力、身份、AI 行为和 RWA 标准化为可互操作的价值单元",
    },
    {
      icon: Globe,
      title: "价值协调",
      desc: "通过智能合约和跨链协议实现价值交换、质押和协调",
    },
    {
      icon: TrendingUp,
      title: "激励机制",
      desc: "统一的 POI 激励机制连接平台使用、价值分配和治理权",
    },
    {
      icon: Shield,
      title: "身份与声誉",
      desc: "链上身份和声誉体系，支持跨平台价值转移和验证",
    },
  ];

  // Use cases
  const useCases = [
    {
      title: "内容创作者",
      desc: "发行个人代币，粉丝持有获得专属权益",
      example: "某 KOL 通过 POI 平台发行代币，粉丝持有可参与直播决策",
    },
    {
      title: "品牌方",
      desc: "启动推荐活动，用户邀请好友获得奖励",
      example: "某品牌通过空投活动，3 天内获得 10,000 新用户",
    },
    {
      title: "Web3 项目",
      desc: "快速启动 TGE，完成代币发行和流动性引导",
      example: "某 DeFi 项目通过 POI 完成 TGE，筹集 500 万美元",
    },
  ];

  return (
    <PageLayout>
      {/* Hero Section */}
      <Section>
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className={cn(
            'text-3xl md:text-5xl font-extrabold mb-4',
            theme === 'cyberpunk' ? 'font-orbitron' : 'font-fredoka'
          )}>
            {theme === 'cyberpunk' ? (
              <>
                End-to-End <span className="text-cyan-300">Solutions</span>
              </>
            ) : (
              <>
                Complete <span className="text-blue-600">Solutions</span> for Everyone
              </>
            )}
          </h1>
          <p className={cn(
            'text-lg opacity-80',
            theme === 'cyberpunk' ? 'text-slate-300' : 'text-slate-600'
          )}>
            ProjectEX 平台提供端到端解决方案，帮助品牌、创作者和用户将价值代币化、协调和变现
          </p>
        </div>

        {/* Solutions Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {solutions.map((solution) => {
            const Icon = solution.icon;
            return (
              <ThemedCard key={solution.title} hover className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className={cn(
                    'w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0',
                    theme === 'cyberpunk'
                      ? 'bg-gradient-to-br from-cyan-400/20 to-pink-500/20 border border-cyan-400/30'
                      : 'bg-gradient-to-br from-blue-100 to-green-100 border border-blue-200'
                  )}>
                    <Icon className={cn(
                      'w-7 h-7',
                      theme === 'cyberpunk' ? 'text-cyan-300' : 'text-blue-600'
                    )} />
                  </div>

                  <div className="flex-1">
                    <h3 className={cn(
                      'text-xl font-bold mb-1',
                      theme === 'cyberpunk' ? 'font-orbitron' : 'font-fredoka'
                    )}>
                      {solution.title}
                    </h3>
                    <div className="text-xs opacity-70 mb-2">{solution.subtitle}</div>
                  </div>
                </div>

                <p className="text-sm opacity-90 mb-4">{solution.desc}</p>

                <div className="flex flex-wrap gap-2">
                  {solution.features.map((feature) => (
                    <ThemedBadge key={feature}>{feature}</ThemedBadge>
                  ))}
                </div>
              </ThemedCard>
            );
          })}
        </div>
      </Section>

      {/* Key Features */}
      <Section title="平台优势" subtitle="价值互联网的核心能力">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {keyFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <ThemedCard key={feature.title} hover className="p-5">
                <Icon className={cn(
                  'w-10 h-10 mb-3',
                  theme === 'cyberpunk' ? 'text-cyan-400' : 'text-blue-600'
                )} />
                <h4 className="font-bold mb-2">{feature.title}</h4>
                <p className="text-sm opacity-80">{feature.desc}</p>
              </ThemedCard>
            );
          })}
        </div>
      </Section>

      {/* Use Cases */}
      <Section title="应用场景" subtitle="真实案例展示">
        <div className="grid gap-6 md:grid-cols-3">
          {useCases.map((useCase) => (
            <ThemedCard key={useCase.title} hover className="p-6">
              <h4 className={cn(
                'text-lg font-bold mb-2',
                theme === 'cyberpunk' ? 'font-rajdhani text-cyan-300' : 'font-poppins text-blue-600'
              )}>
                {useCase.title}
              </h4>
              <p className="text-sm mb-3">{useCase.desc}</p>
              <div className={cn(
                'p-3 rounded-lg text-xs italic',
                theme === 'cyberpunk'
                  ? 'bg-slate-900/60 border border-cyan-400/20'
                  : 'bg-slate-50 border border-slate-200'
              )}>
                💡 {useCase.example}
              </div>
            </ThemedCard>
          ))}
        </div>
      </Section>

      {/* CTA Section */}
      <Section>
        <ThemedCard className="p-8 md:p-12 text-center">
          <Rocket className={cn(
            'w-12 h-12 mx-auto mb-4',
            theme === 'cyberpunk' ? 'text-cyan-400' : 'text-blue-600'
          )} />
          <h3 className={cn(
            'text-2xl md:text-3xl font-bold mb-3',
            theme === 'cyberpunk' ? 'font-orbitron' : 'font-fredoka'
          )}>
            准备好开始了吗？
          </h3>
          <p className="text-sm md:text-base opacity-80 mb-6 max-w-2xl mx-auto">
            无论您是创作者、品牌方还是项目团队，ProofOfInfluence 都能为您提供定制化的解决方案
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/tge">
              <ThemedButton emphasis size="lg">
                加入 TGE
                <ArrowRight className="w-5 h-5 ml-2" />
              </ThemedButton>
            </Link>
            <Link href="/early-bird">
              <ThemedButton variant="outline" size="lg">
                注册早鸟
              </ThemedButton>
            </Link>
            <Link href="/use-cases">
              <ThemedButton variant="outline" size="lg">
                查看案例
              </ThemedButton>
            </Link>
          </div>
        </ThemedCard>
      </Section>
    </PageLayout>
  );
}
