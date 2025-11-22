import React from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Section } from "@/components/layout/Section";
import { ThemedCard, ThemedProgress } from "@/components/themed";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import {
  Rocket,
  Users,
  TrendingUp,
  Target,
  Award,
  Zap,
} from "lucide-react";

export default function UseCases() {
  const { theme } = useTheme();

  const useCases = [
    {
      icon: Rocket,
      title: "冷启动",
      subtitle: "从零到一的用户增长",
      desc: "新用户完成任务获得积分，兑换代币参与生态",
      steps: [
        { step: "注册账号", status: 100 },
        { step: "完成 KYC", status: 100 },
        { step: "绑定钱包", status: 100 },
        { step: "获得积分", status: 70 },
      ],
    },
    {
      icon: Users,
      title: "社区激活",
      subtitle: "提升用户活跃度和留存",
      desc: "通过挑战赛、排行榜、勋章墙激励用户参与",
      steps: [
        { step: "每日签到", status: 100 },
        { step: "完成挑战", status: 80 },
        { step: "获得勋章", status: 60 },
        { step: "排名奖励", status: 40 },
      ],
    },
    {
      icon: TrendingUp,
      title: "资金侧",
      subtitle: "流动性池和收益优化",
      desc: "一键加入流动性池，获得稳定收益和风险提示",
      steps: [
        { step: "选择池子", status: 100 },
        { step: "风险评估", status: 100 },
        { step: "加入LP", status: 90 },
        { step: "查看收益", status: 75 },
      ],
    },
  ];

  const successStories = [
    {
      icon: Target,
      title: "某 KOL 代币发行",
      result: "30 天内筹集 $500k，粉丝持有获得专属权益",
      metrics: ["500k USDC", "2,000 Holders", "30 Days"],
    },
    {
      icon: Award,
      title: "品牌空投活动",
      result: "3 天获得 10,000 新用户，转化率 25%",
      metrics: ["10k Users", "25% CVR", "3 Days"],
    },
    {
      icon: Zap,
      title: "DeFi 项目 TGE",
      result: "通过 POI 平台完成 TGE，上市即盈利",
      metrics: ["$5M Raised", "100% ROI", "Week 1"],
    },
  ];

  return (
    <PageLayout>
      <Section>
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className={cn(
            'text-3xl md:text-5xl font-extrabold mb-4',
            theme === 'cyberpunk' ? 'font-orbitron' : 'font-fredoka'
          )}>
            Use Cases
          </h1>
          <p className={cn(
            'text-lg opacity-80',
            theme === 'cyberpunk' ? 'text-slate-300' : 'text-slate-600'
          )}>
            ProjectEX 平台的应用场景：展示价值互联网如何帮助品牌、创作者和用户实现价值代币化和协调
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {useCases.map((useCase) => {
            const Icon = useCase.icon;
            return (
              <ThemedCard key={useCase.title} hover className="p-6">
                <Icon className={cn(
                  'w-12 h-12 mb-4',
                  theme === 'cyberpunk' ? 'text-cyan-400' : 'text-blue-600'
                )} />
                <h3 className={cn(
                  'text-xl font-bold mb-1',
                  theme === 'cyberpunk' ? 'font-orbitron' : 'font-fredoka'
                )}>
                  {useCase.title}
                </h3>
                <div className="text-xs opacity-70 mb-3">{useCase.subtitle}</div>
                <p className="text-sm mb-4">{useCase.desc}</p>

                <div className="space-y-3">
                  {useCase.steps.map((step) => (
                    <div key={step.step}>
                      <div className="flex justify-between text-xs mb-1">
                        <span>{step.step}</span>
                        <span className={cn(
                          'font-bold',
                          theme === 'cyberpunk' ? 'text-cyan-300' : 'text-blue-600'
                        )}>
                          {step.status}%
                        </span>
                      </div>
                      <ThemedProgress value={step.status} />
                    </div>
                  ))}
                </div>
              </ThemedCard>
            );
          })}
        </div>
      </Section>

      <Section title="成功案例" subtitle="真实的成功故事">
        <div className="grid gap-6 md:grid-cols-3">
          {successStories.map((story) => {
            const Icon = story.icon;
            return (
              <ThemedCard key={story.title} hover className="p-6">
                <Icon className={cn(
                  'w-10 h-10 mb-3',
                  theme === 'cyberpunk' ? 'text-pink-400' : 'text-green-600'
                )} />
                <h4 className="font-bold mb-2">{story.title}</h4>
                <p className="text-sm mb-4 opacity-90">{story.result}</p>

                <div className="flex gap-2">
                  {story.metrics.map((metric) => (
                    <div
                      key={metric}
                      className={cn(
                        'px-2 py-1 rounded text-xs',
                        theme === 'cyberpunk'
                          ? 'bg-cyan-400/20 text-cyan-300'
                          : 'bg-blue-100 text-blue-600'
                      )}
                    >
                      {metric}
                    </div>
                  ))}
                </div>
              </ThemedCard>
            );
          })}
        </div>
      </Section>
    </PageLayout>
  );
}
