import React from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Section } from "@/components/layout/Section";
import { ThemedCard, ThemedButton, ThemedBadge } from "@/components/themed";
import { AirdropCard } from "@/components/AirdropCard";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import {
  Gift,
  CheckCircle2,
  Lock,
  Twitter,
  MessageCircle,
  Share2,
  Wallet,
  Mail,
  Users,
  Star,
  Trophy,
  Zap,
} from "lucide-react";

export default function Airdrop() {
  const { theme } = useTheme();

  // Example tasks
  const tasks = [
    {
      id: 1,
      icon: Wallet,
      title: "绑定钱包",
      reward: "+25 XP",
      completed: true,
    },
    {
      id: 2,
      icon: Mail,
      title: "验证邮箱",
      reward: "+15 XP",
      completed: true,
    },
    {
      id: 3,
      icon: Twitter,
      title: "关注 Twitter",
      reward: "+30 XP",
      completed: false,
    },
    {
      id: 4,
      icon: MessageCircle,
      title: "加入 Discord",
      reward: "+30 XP",
      completed: false,
    },
    {
      id: 5,
      icon: Share2,
      title: "分享推荐链接",
      reward: "+50 XP",
      completed: false,
    },
    {
      id: 6,
      icon: Users,
      title: "邀请 3 位好友",
      reward: "+80 XP",
      completed: false,
    },
  ];

  // Example badges
  const badges = [
    { id: 1, name: "Early Adopter", earned: true, color: "from-cyan-400 to-blue-500" },
    { id: 2, name: "Community Hero", earned: true, color: "from-pink-400 to-purple-500" },
    { id: 3, name: "Referral Master", earned: false, color: "from-yellow-400 to-orange-500" },
    { id: 4, name: "Trading Pro", earned: false, color: "from-green-400 to-teal-500" },
    { id: 5, name: "Diamond Hands", earned: false, color: "from-purple-400 to-pink-500" },
    { id: 6, name: "Whale", earned: false, color: "from-blue-400 to-cyan-500" },
    { id: 7, name: "Contributor", earned: false, color: "from-orange-400 to-red-500" },
    { id: 8, name: "Innovator", earned: false, color: "from-indigo-400 to-purple-500" },
  ];

  // User stats
  const userStats = {
    totalXP: 70,
    level: 3,
    tasksCompleted: 2,
    badgesEarned: 2,
    rank: "Bronze",
  };

  const iconStyles = theme === 'cyberpunk'
    ? 'text-cyan-400'
    : 'text-blue-600';

  return (
    <PageLayout>
      {/* Airdrop Claim Section */}
      <Section
        title="Claim Airdrop"
        subtitle="Claim your POI tokens from Merkle Airdrop"
      >
        <div className="max-w-2xl mx-auto">
          <AirdropCard />
        </div>
      </Section>

      {/* Hero Section */}
      <Section
        title="Airdrop Campaign"
        subtitle="完成任务，获取独家空投和徽章"
      >
        <div className="grid gap-6 md:grid-cols-4">
          <ThemedCard className="p-5 text-center">
            <Zap className={cn('w-8 h-8 mx-auto mb-2', iconStyles)} />
            <div className="text-sm opacity-70 mb-1">总 XP</div>
            <div className={cn(
              'text-2xl font-bold',
              theme === 'cyberpunk' ? 'font-orbitron text-cyan-300' : 'font-poppins text-blue-600'
            )}>
              {userStats.totalXP}
            </div>
          </ThemedCard>

          <ThemedCard className="p-5 text-center">
            <Star className={cn('w-8 h-8 mx-auto mb-2', iconStyles)} />
            <div className="text-sm opacity-70 mb-1">等级</div>
            <div className={cn(
              'text-2xl font-bold',
              theme === 'cyberpunk' ? 'font-orbitron text-pink-300' : 'font-poppins text-green-600'
            )}>
              Lv. {userStats.level}
            </div>
          </ThemedCard>

          <ThemedCard className="p-5 text-center">
            <CheckCircle2 className={cn('w-8 h-8 mx-auto mb-2', iconStyles)} />
            <div className="text-sm opacity-70 mb-1">完成任务</div>
            <div className={cn(
              'text-2xl font-bold',
              theme === 'cyberpunk' ? 'font-orbitron text-purple-300' : 'font-poppins text-purple-600'
            )}>
              {userStats.tasksCompleted}/{tasks.length}
            </div>
          </ThemedCard>

          <ThemedCard className="p-5 text-center">
            <Trophy className={cn('w-8 h-8 mx-auto mb-2', iconStyles)} />
            <div className="text-sm opacity-70 mb-1">徽章</div>
            <div className={cn(
              'text-2xl font-bold',
              theme === 'cyberpunk' ? 'font-orbitron text-green-300' : 'font-poppins text-green-600'
            )}>
              {userStats.badgesEarned}/{badges.length}
            </div>
          </ThemedCard>
        </div>
      </Section>

      {/* Tasks Grid */}
      <Section title="任务中心" subtitle="完成任务以获取 XP 和奖励">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => {
            const Icon = task.icon;
            return (
              <ThemedCard
                key={task.id}
                hover={!task.completed}
                className={cn(
                  'p-6 transition-transform',
                  !task.completed && 'cursor-pointer'
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center',
                    task.completed
                      ? theme === 'cyberpunk'
                        ? 'bg-green-400/20'
                        : 'bg-green-100'
                      : theme === 'cyberpunk'
                        ? 'bg-cyan-400/20'
                        : 'bg-blue-100'
                  )}>
                    {task.completed ? (
                      <CheckCircle2 className={cn(
                        'w-6 h-6',
                        theme === 'cyberpunk' ? 'text-green-400' : 'text-green-600'
                      )} />
                    ) : (
                      <Icon className={cn('w-6 h-6', iconStyles)} />
                    )}
                  </div>

                  <ThemedBadge variant={task.completed ? "success" : "default"}>
                    {task.reward}
                  </ThemedBadge>
                </div>

                <h4 className={cn(
                  'font-bold mb-2',
                  theme === 'cyberpunk' ? 'font-rajdhani' : 'font-poppins'
                )}>
                  {task.title}
                </h4>

                {task.completed ? (
                  <div className={cn(
                    'text-sm flex items-center gap-1',
                    theme === 'cyberpunk' ? 'text-green-400' : 'text-green-600'
                  )}>
                    <CheckCircle2 className="w-4 h-4" />
                    已完成
                  </div>
                ) : (
                  <ThemedButton size="sm" emphasis className="w-full mt-2">
                    开始任务
                  </ThemedButton>
                )}
              </ThemedCard>
            );
          })}
        </div>
      </Section>

      {/* Badges Wall */}
      <Section title="徽章墙" subtitle="收集所有徽章展示您的成就">
        <ThemedCard className="p-6">
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className={cn(
                  'aspect-square rounded-lg transition-all relative group cursor-pointer',
                  badge.earned
                    ? `bg-gradient-to-br ${badge.color}`
                    : theme === 'cyberpunk'
                      ? 'bg-slate-800/60 border border-cyan-400/20'
                      : 'bg-slate-100 border border-slate-200'
                )}
                title={badge.name}
              >
                {badge.earned ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Trophy className="w-6 h-6 md:w-8 md:h-8 text-white drop-shadow-lg" />
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Lock className={cn(
                      'w-4 h-4 md:w-6 md:h-6 opacity-50',
                      theme === 'cyberpunk' ? 'text-slate-600' : 'text-slate-400'
                    )} />
                  </div>
                )}

                {/* Tooltip on hover */}
                <div className={cn(
                  'absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none',
                  theme === 'cyberpunk'
                    ? 'bg-slate-800 border border-cyan-400/40'
                    : 'bg-slate-900 text-white'
                )}>
                  {badge.name}
                </div>
              </div>
            ))}
          </div>

          <div className={cn(
            'mt-6 text-center text-sm opacity-70',
            theme === 'cyberpunk' ? 'font-rajdhani' : 'font-poppins'
          )}>
            已解锁 {userStats.badgesEarned} / {badges.length} 徽章
          </div>
        </ThemedCard>
      </Section>

      {/* Rewards Info */}
      <Section title="奖励说明" subtitle="了解如何获得空投">
        <div className="grid gap-4 md:grid-cols-3">
          <ThemedCard hover className="p-6">
            <div className={cn(
              'text-4xl font-bold mb-2',
              theme === 'cyberpunk' ? 'font-orbitron text-cyan-300' : 'font-poppins text-blue-600'
            )}>
              1:1
            </div>
            <h4 className="font-bold mb-2">基础比例</h4>
            <p className="text-sm opacity-80">
              每 100 XP 可兑换 100 POI 代币
            </p>
          </ThemedCard>

          <ThemedCard hover className="p-6">
            <div className={cn(
              'text-4xl font-bold mb-2',
              theme === 'cyberpunk' ? 'font-orbitron text-pink-300' : 'font-poppins text-green-600'
            )}>
              2x
            </div>
            <h4 className="font-bold mb-2">早鸟加成</h4>
            <p className="text-sm opacity-80">
              早鸟用户获得双倍奖励
            </p>
          </ThemedCard>

          <ThemedCard hover className="p-6">
            <div className={cn(
              'text-4xl font-bold mb-2',
              theme === 'cyberpunk' ? 'font-orbitron text-purple-300' : 'font-poppins text-purple-600'
            )}>
              +50%
            </div>
            <h4 className="font-bold mb-2">徽章奖励</h4>
            <p className="text-sm opacity-80">
              收集全部徽章额外获得 50% 奖励
            </p>
          </ThemedCard>
        </div>
      </Section>

      {/* CTA Section */}
      <Section>
        <ThemedCard className="p-8 text-center">
          <Gift className={cn(
            'w-12 h-12 mx-auto mb-4',
            theme === 'cyberpunk' ? 'text-cyan-400' : 'text-blue-600'
          )} />
          <h3 className={cn(
            'text-2xl font-bold mb-2',
            theme === 'cyberpunk' ? 'font-orbitron' : 'font-fredoka'
          )}>
            准备好开始了吗？
          </h3>
          <p className="text-sm opacity-80 mb-6 max-w-2xl mx-auto">
            完成任务，收集徽章，获取独家空投奖励
          </p>
          <div className="flex justify-center gap-3">
            <ThemedButton emphasis size="lg">
              开始第一个任务
            </ThemedButton>
            <ThemedButton variant="outline" size="lg">
              查看排行榜
            </ThemedButton>
          </div>
        </ThemedCard>
      </Section>
    </PageLayout>
  );
}
