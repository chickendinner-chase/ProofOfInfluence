import React from "react";
import { Link } from "wouter";
import { PageLayout } from "@/components/layout/PageLayout";
import { Section } from "@/components/layout/Section";
import { ThemedCard, ThemedButton, ThemedProgress } from "@/components/themed";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import {
  Coins,
  PieChart,
  TrendingUp,
  Lock,
  Users,
  Zap,
  Shield,
  Gift,
  Vote,
  DollarSign,
  Rocket,
} from "lucide-react";

export default function Token() {
  const { theme } = useTheme();

  // Token distribution
  const distribution = [
    { label: "生态发展", value: 28, color: theme === 'cyberpunk' ? 'cyan' : 'blue' },
    { label: "投资者", value: 20, color: theme === 'cyberpunk' ? 'pink' : 'green' },
    { label: "团队", value: 15, color: theme === 'cyberpunk' ? 'purple' : 'purple' },
    { label: "做市商", value: 12, color: theme === 'cyberpunk' ? 'green' : 'orange' },
    { label: "流动性池", value: 25, color: theme === 'cyberpunk' ? 'yellow' : 'red' },
  ];

  // Token utilities
  const utilities = [
    {
      icon: DollarSign,
      title: "支付与折扣",
      desc: "使用 $POI 支付平台服务费，享受专属折扣",
      examples: ["手续费折扣 20%", "VIP 会员权益", "优先服务"],
    },
    {
      icon: Gift,
      title: "激励与奖励",
      desc: "完成任务、推荐好友获得 $POI 代币奖励",
      examples: ["每日任务奖励", "推荐返利", "创作者激励"],
    },
    {
      icon: Vote,
      title: "治理与权限",
      desc: "持有 $POI 参与平台治理，决定发展方向",
      examples: ["提案投票", "参数调整", "功能优先级"],
    },
  ];

  // Key metrics
  const metrics = [
    { label: "总供应量", value: "1,000,000,000", unit: "POI" },
    { label: "初始流通", value: "100,000,000", unit: "POI (10%)" },
    { label: "TGE 价格", value: "$0.05", unit: "USDC/POI" },
    { label: "市值 (FDV)", value: "$50,000,000", unit: "at TGE" },
  ];

  // Vesting schedule
  const vestingSchedule = [
    { category: "TGE 公开发售", unlock: "15% TGE unlock, 3 months linear" },
    { category: "团队", unlock: "12 months cliff, 36 months linear" },
    { category: "投资者", unlock: "6 months cliff, 24 months linear" },
    { category: "生态发展", unlock: "5% quarterly unlock over 5 years" },
  ];

  return (
    <PageLayout>
      {/* Hero Section */}
      <Section>
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="flex justify-center mb-4">
            <Coins className={cn(
              'w-16 h-16',
              theme === 'cyberpunk' ? 'text-cyan-400' : 'text-blue-600'
            )} />
          </div>
          <h1 className={cn(
            'text-3xl md:text-5xl font-extrabold mb-4',
            theme === 'cyberpunk' ? 'font-orbitron' : 'font-fredoka'
          )}>
            $POI Token
          </h1>
          <p className={cn(
            'text-lg opacity-80',
            theme === 'cyberpunk' ? 'text-slate-300' : 'text-slate-600'
          )}>
            POI（Proof of Influence）作为价值互联网的统一价值层，连接平台使用、价值分配和治理权
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-4">
          {metrics.map((metric) => (
            <ThemedCard key={metric.label} className="p-5 text-center">
              <div className="text-xs opacity-70 mb-2">{metric.label}</div>
              <div className={cn(
                'text-xl md:text-2xl font-bold mb-1',
                theme === 'cyberpunk' ? 'font-orbitron text-cyan-300' : 'font-poppins text-blue-600'
              )}>
                {metric.value}
              </div>
              <div className="text-xs opacity-60">{metric.unit}</div>
            </ThemedCard>
          ))}
        </div>
      </Section>

      {/* Token Distribution */}
      <Section title="代币分配" subtitle="$POI 代币分配结构">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Pie Chart Visualization */}
          <ThemedCard className="p-6">
            <div className="space-y-3">
              {distribution.map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between mb-2 text-sm">
                    <span className="font-medium">{item.label}</span>
                    <span className={cn(
                      'font-bold',
                      theme === 'cyberpunk' ? 'text-cyan-300' : 'text-blue-600'
                    )}>
                      {item.value}%
                    </span>
                  </div>
                  <ThemedProgress value={item.value} animated />
                </div>
              ))}
            </div>
          </ThemedCard>

          {/* Distribution Details */}
          <ThemedCard className="p-6">
            <h4 className={cn(
              'font-bold mb-4 flex items-center gap-2',
              theme === 'cyberpunk' ? 'font-rajdhani text-cyan-200' : 'font-poppins text-slate-900'
            )}>
              <PieChart className="w-5 h-5" />
              分配说明
            </h4>

            <div className="space-y-3 text-sm">
              <div>
                <div className="font-semibold mb-1">生态发展 (28%)</div>
                <p className="opacity-80">用于平台开发、营销推广和社区建设</p>
              </div>
              <div>
                <div className="font-semibold mb-1">投资者 (20%)</div>
                <p className="opacity-80">早期投资者和战略合作伙伴</p>
              </div>
              <div>
                <div className="font-semibold mb-1">团队 (15%)</div>
                <p className="opacity-80">核心团队和顾问激励</p>
              </div>
              <div>
                <div className="font-semibold mb-1">做市商 (12%)</div>
                <p className="opacity-80">保证二级市场流动性</p>
              </div>
              <div>
                <div className="font-semibold mb-1">流动性池 (25%)</div>
                <p className="opacity-80">DEX 流动性挖矿激励</p>
              </div>
            </div>
          </ThemedCard>
        </div>
      </Section>

      {/* Token Utility */}
      <Section title="代币用途" subtitle="$POI 在生态系统中的作用">
        <div className="grid gap-6 md:grid-cols-3">
          {utilities.map((utility) => {
            const Icon = utility.icon;
            return (
              <ThemedCard key={utility.title} hover className="p-6">
                <Icon className={cn(
                  'w-12 h-12 mb-4',
                  theme === 'cyberpunk' ? 'text-cyan-400' : 'text-blue-600'
                )} />
                <h4 className={cn(
                  'text-lg font-bold mb-2',
                  theme === 'cyberpunk' ? 'font-orbitron' : 'font-fredoka'
                )}>
                  {utility.title}
                </h4>
                <p className="text-sm opacity-90 mb-4">{utility.desc}</p>

                <div className="space-y-1">
                  {utility.examples.map((example) => (
                    <div key={example} className="flex items-start gap-2 text-xs">
                      <Zap className={cn(
                        'w-3 h-3 mt-0.5 flex-shrink-0',
                        theme === 'cyberpunk' ? 'text-green-400' : 'text-green-600'
                      )} />
                      <span className="opacity-80">{example}</span>
                    </div>
                  ))}
                </div>
              </ThemedCard>
            );
          })}
        </div>
      </Section>

      {/* Vesting Schedule */}
      <Section title="解锁计划" subtitle="代币释放时间表">
        <ThemedCard className="p-6">
          <div className="grid gap-4 md:grid-cols-2">
            {vestingSchedule.map((item) => (
              <div
                key={item.category}
                className={cn(
                  'p-4 rounded-lg',
                  theme === 'cyberpunk'
                    ? 'bg-slate-900/60 border border-cyan-400/20'
                    : 'bg-slate-50 border border-slate-200'
                )}
              >
                <div className="flex items-start gap-3">
                  <Lock className={cn(
                    'w-5 h-5 mt-0.5 flex-shrink-0',
                    theme === 'cyberpunk' ? 'text-pink-400' : 'text-purple-600'
                  )} />
                  <div>
                    <div className="font-semibold mb-1">{item.category}</div>
                    <div className="text-xs opacity-80">{item.unlock}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className={cn(
            'mt-6 p-4 rounded-lg text-sm',
            theme === 'cyberpunk'
              ? 'bg-cyan-400/10 border border-cyan-400/30'
              : 'bg-blue-50 border border-blue-200'
          )}>
            <div className="flex items-start gap-2">
              <Shield className={cn(
                'w-5 h-5 mt-0.5 flex-shrink-0',
                theme === 'cyberpunk' ? 'text-cyan-400' : 'text-blue-600'
              )} />
              <div>
                <div className="font-semibold mb-1">解锁保障</div>
                <p className="opacity-90 text-xs">
                  所有解锁计划通过智能合约自动执行，透明可查。团队和投资者代币设有锁定期，确保长期发展激励一致。
                </p>
              </div>
            </div>
          </div>
        </ThemedCard>
      </Section>

      {/* Roadmap */}
      <Section title="发展路线" subtitle="2025-2026 规划">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { quarter: "Q4 2025", milestone: "TGE 启动 & DEX 上市" },
            { quarter: "Q1 2026", milestone: "CEX 上市 & 质押功能" },
            { quarter: "Q2 2026", milestone: "跨链桥 & NFT 集成" },
            { quarter: "Q3 2026", milestone: "DAO 治理 & 移动端" },
          ].map((item, index) => (
            <ThemedCard key={item.quarter} hover className="p-5 text-center">
              <div className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold',
                theme === 'cyberpunk'
                  ? 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/40'
                  : 'bg-blue-100 text-blue-600 border border-blue-300'
              )}>
                {index + 1}
              </div>
              <div className="font-bold mb-1">{item.quarter}</div>
              <div className="text-sm opacity-80">{item.milestone}</div>
            </ThemedCard>
          ))}
        </div>
      </Section>

      {/* CTA */}
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
            参与 $POI TGE
          </h3>
          <p className="text-sm opacity-80 mb-6 max-w-2xl mx-auto">
            成为 ProofOfInfluence 生态的早期参与者
          </p>
          <div className="flex justify-center gap-3">
            <Link href="/tge">
              <ThemedButton emphasis size="lg">
                加入 TGE
              </ThemedButton>
            </Link>
            <Link href="/docs/whitepaper/tokenomics">
              <ThemedButton variant="outline" size="lg">
                查看代币经济学
              </ThemedButton>
            </Link>
            <Link href="/docs/whitepaper">
              <ThemedButton variant="outline" size="lg">
                查看白皮书
              </ThemedButton>
            </Link>
          </div>
        </ThemedCard>
      </Section>
    </PageLayout>
  );
}
