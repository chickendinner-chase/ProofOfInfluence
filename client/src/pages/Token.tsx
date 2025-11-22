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

  // Token distribution - 根据 tokenomics.md 文档
  const distribution = [
    { label: "私募投资者", value: 30, color: theme === 'cyberpunk' ? 'pink' : 'green' },
    { label: "社区激励/KOL", value: 20, color: theme === 'cyberpunk' ? 'cyan' : 'blue' },
    { label: "团队与顾问", value: 15, color: theme === 'cyberpunk' ? 'purple' : 'purple' },
    { label: "储备金库", value: 10, color: theme === 'cyberpunk' ? 'green' : 'orange' },
    { label: "质押挖矿池", value: 10, color: theme === 'cyberpunk' ? 'yellow' : 'yellow' },
    { label: "影响力挖矿池", value: 10, color: theme === 'cyberpunk' ? 'blue' : 'cyan' },
    { label: "协议流动性", value: 5, color: theme === 'cyberpunk' ? 'red' : 'red' },
  ];

  // Token utilities - 根据 tokenomics.md 文档
  const utilities = [
    {
      icon: DollarSign,
      title: "支付与折扣",
      desc: "订阅、打赏、付费内容、升级、应用内市场，使用 $POI 支付享受优惠价格",
      examples: ["订阅服务", "打赏创作者", "付费内容解锁", "应用内市场交易"],
    },
    {
      icon: Gift,
      title: "激励与奖励",
      desc: "质押奖励和影响力挖矿奖励，与 GMV 和留存相关",
      examples: ["质押挖矿奖励", "影响力挖矿奖励", "长期质押倍数", "粉丝任务奖励"],
    },
    {
      icon: Vote,
      title: "治理与参数",
      desc: "参与排放、燃烧、费用分配、金库使用的参数投票",
      examples: ["排放参数投票", "燃烧率调整", "费用分配决策", "金库使用提案"],
    },
    {
      icon: Zap,
      title: "燃烧机制",
      desc: "退出、DeFi 操作、高影响平台操作触发代币燃烧，维持净通胀 ≤ 5%",
      examples: ["法币提现燃烧 3-8%", "DeFi 操作燃烧 1-3%", "打赏燃烧 3%", "自适应燃烧控制"],
    },
  ];

  // Key metrics - 根据 tokenomics.md 文档
  const metrics = [
    { label: "总供应量", value: "TBD", unit: "待治理决定" },
    { label: "净通胀目标", value: "≤ 5%", unit: "年化" },
    { label: "质押 APY", value: "8-25%", unit: "目标区间" },
    { label: "解锁方式", value: "每日线性", unit: "链上可验证" },
  ];

  // Vesting schedule - 根据 tokenomics.md 文档
  const vestingSchedule = [
    { category: "Phase 0 (TGE)", unlock: "应用内可用但不可转账/交易，初始解锁包括 LP + 质押 + 影响力池" },
    { category: "Phase 1 (交易启用)", unlock: "启用链上转账/交易，私募解锁开始（锁定期 + 每日线性解锁）" },
    { category: "Phase 2 (创始人解锁)", unlock: "创始人解锁开始（锁定期 + 每日线性解锁）" },
    { category: "储备金库", unlock: "默认长期线性解锁（治理可调整）" },
    { category: "挖矿池", unlock: "每日按规则发放，未发放余额保持锁定" },
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
                <div className="font-semibold mb-1">私募投资者 (30%)</div>
                <p className="opacity-80">战略分配，锁定期 + 线性解锁</p>
              </div>
              <div>
                <div className="font-semibold mb-1">社区激励/KOL (20%)</div>
                <p className="opacity-80">根据奖励参与度发放</p>
              </div>
              <div>
                <div className="font-semibold mb-1">团队与顾问 (15%)</div>
                <p className="opacity-80">长期对齐，锁定期 + 线性解锁</p>
              </div>
              <div>
                <div className="font-semibold mb-1">储备金库 (10%)</div>
                <p className="opacity-80">回购、紧急情况、增长、生态系统</p>
              </div>
              <div>
                <div className="font-semibold mb-1">质押挖矿池 (10%)</div>
                <p className="opacity-80">每日向质押者发放，APY 目标 8-25%</p>
              </div>
              <div>
                <div className="font-semibold mb-1">影响力挖矿池 (10%)</div>
                <p className="opacity-80">每日向创作者/粉丝发放，与 GMV 和留存相关</p>
              </div>
              <div>
                <div className="font-semibold mb-1">协议流动性 (5%)</div>
                <p className="opacity-80">上市后的做市和稳定性</p>
              </div>
            </div>
          </ThemedCard>
        </div>
      </Section>

      {/* Token Utility */}
      <Section title="代币用途" subtitle="$POI 在生态系统中的作用">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
                  所有线性解锁通过智能合约每日计算，链上可验证。团队和投资者代币设有锁定期，确保长期发展激励一致。所有参数受治理控制，可根据发展需要调整。
                </p>
              </div>
            </div>
          </div>
        </ThemedCard>
      </Section>

      {/* Roadmap */}
      <Section title="发展路线" subtitle="根据 tokenomics 文档的阶段性规划">
        <div className="grid gap-4 md:grid-cols-5">
          {[
            { phase: "Phase 0", milestone: "TGE → Phase 1: 应用内消费/挖矿，反女巫系统，质押和影响力挖矿封闭测试" },
            { phase: "Phase 1", milestone: "交易启用：上市 + LP 初始注入，开放转账，私募线性解锁开始" },
            { phase: "Phase 2", milestone: "创始人解锁：创始人线性解锁开始，DeFi 钩子，治理 v1" },
            { phase: "Phase 3", milestone: "扩展开发：扩展创作者经济，NFT 实用工具，收入分成试点" },
            { phase: "Phase 4", milestone: "成熟阶段：程序化 LP 管理，金库优化，成熟治理" },
          ].map((item, index) => (
            <ThemedCard key={item.phase} hover className="p-5">
              <div className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center mb-3 text-lg font-bold',
                theme === 'cyberpunk'
                  ? 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/40'
                  : 'bg-blue-100 text-blue-600 border border-blue-300'
              )}>
                {index}
              </div>
              <div className="font-bold mb-2">{item.phase}</div>
              <div className="text-xs opacity-80 leading-relaxed">{item.milestone}</div>
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
            <Link href="/docs/whitepaper/tokenomics.md">
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
