import React from "react";
import { useQuery } from "@tanstack/react-query";
import { PageLayout } from "@/components/layout/PageLayout";
import { Section } from "@/components/layout/Section";
import { ThemedCard, ThemedButton } from "@/components/themed";
import { StakingCard } from "@/components/StakingCard";
import { VestingCard } from "@/components/VestingCard";
import { AirdropCard } from "@/components/AirdropCard";
import { AllowlistCard } from "@/components/AllowlistCard";
import { ReferralCard } from "@/components/ReferralCard";
import { BadgeCard } from "@/components/BadgeCard";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { ROUTES } from "@/routes";
import {
  Wallet,
  TrendingUp,
  Star,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  DollarSign,
  CheckCircle2,
} from "lucide-react";
import type { User } from "@shared/schema";

export default function Dashboard() {
  const { theme } = useTheme();

  // Fetch user data (keeping existing API integration)
  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
  });

  // Mock data for demonstration
  const stats = {
    totalBalance: "$128,431",
    pnl24h: "+$1,230",
    pnlPercentage: "+2.4%",
    xpLevel: 4,
    trend: "up" as const,
  };

  const recentActivities = [
    { action: "Staked POI", amount: "1,000 POI", time: "2 hours ago", type: "stake" },
    { action: "Claimed Rewards", amount: "+50 POI", time: "5 hours ago", type: "reward" },
    { action: "Referral Bonus", amount: "+25 POI", time: "1 day ago", type: "bonus" },
  ];

  const tasks = [
    { id: 1, label: "每日签到", reward: "+5 XP", completed: true },
    { id: 2, label: "完成充值", reward: "+30 XP", completed: false },
    { id: 3, label: "邀请 1 位好友", reward: "+20 XP", completed: false },
  ];

  if (userLoading) {
    return (
      <PageLayout>
        <Section>
          <div className="text-center py-12">Loading...</div>
        </Section>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      {/* Welcome Section */}
      <Section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className={cn(
              'text-2xl font-bold',
              theme === 'cyberpunk' ? 'font-orbitron text-cyan-100' : 'font-fredoka text-slate-900'
            )}>
              Welcome back{user?.username ? `, ${user.username}` : ''}!
            </h1>
            <p className="text-sm opacity-70 mt-1">
              {theme === 'cyberpunk' ? 'LIVE • Trading Dashboard' : 'Your Dashboard Overview'}
            </p>
          </div>
          <Link href={ROUTES.APP_TRADE}>
            <ThemedButton emphasis>
              {theme === 'cyberpunk' ? '前往现货交易' : 'Go to Spot Trade'}
            </ThemedButton>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <ThemedCard hover className="p-5">
            <div className="flex items-start justify-between mb-3">
              <Wallet className={cn(
                'w-8 h-8',
                theme === 'cyberpunk' ? 'text-cyan-400' : 'text-blue-600'
              )} />
              <DollarSign className={cn(
                'w-5 h-5',
                theme === 'cyberpunk' ? 'text-slate-600' : 'text-slate-400'
              )} />
            </div>
            <div className="text-sm opacity-70 mb-1">Total Balance</div>
            <div className={cn(
              'text-2xl font-bold',
              theme === 'cyberpunk' ? 'font-orbitron text-cyan-300' : 'font-poppins text-blue-600'
            )}>
              {stats.totalBalance}
            </div>
          </ThemedCard>

          <ThemedCard hover className="p-5">
            <div className="flex items-start justify-between mb-3">
              <TrendingUp className={cn(
                'w-8 h-8',
                theme === 'cyberpunk' ? 'text-pink-400' : 'text-green-600'
              )} />
              {stats.trend === 'up' ? (
                <ArrowUpRight className="w-5 h-5 text-green-500" />
              ) : (
                <ArrowDownRight className="w-5 h-5 text-red-500" />
              )}
            </div>
            <div className="text-sm opacity-70 mb-1">24h PnL</div>
            <div className={cn(
              'text-2xl font-bold',
              stats.trend === 'up' ? 'text-green-500' : 'text-red-500'
            )}>
              {stats.pnl24h}
            </div>
            <div className="text-xs opacity-70 mt-1">{stats.pnlPercentage}</div>
          </ThemedCard>

          <ThemedCard hover className="p-5">
            <div className="flex items-start justify-between mb-3">
              <Star className={cn(
                'w-8 h-8',
                theme === 'cyberpunk' ? 'text-purple-400' : 'text-purple-600'
              )} />
              <Activity className={cn(
                'w-5 h-5',
                theme === 'cyberpunk' ? 'text-slate-600' : 'text-slate-400'
              )} />
            </div>
            <div className="text-sm opacity-70 mb-1">XP Level</div>
            <div className={cn(
              'text-2xl font-bold',
              theme === 'cyberpunk' ? 'font-orbitron text-purple-300' : 'font-poppins text-purple-600'
            )}>
              Lv. {stats.xpLevel}
            </div>
          </ThemedCard>
        </div>
      </Section>

      {/* Staking Section */}
      <Section title="Staking" subtitle="Stake POI to earn rewards">
        <StakingCard />
      </Section>

      {/* Contract Features Section */}
      <Section title="Token Management" subtitle="Manage your vesting, airdrops, and allowlist">
        <div className="grid gap-6 lg:grid-cols-3">
          <VestingCard />
          <AirdropCard />
          <AllowlistCard />
        </div>
      </Section>

      {/* Referral Section */}
      <Section title="Referral Program" subtitle="Invite friends and earn rewards">
        <div className="max-w-2xl mx-auto">
          <ReferralCard />
        </div>
      </Section>

      {/* Badges Section */}
      <Section title="Achievement Badges" subtitle="Collect badges by completing achievements">
        <div className="max-w-2xl mx-auto">
          <BadgeCard />
        </div>
      </Section>

      {/* Main Content Grid */}
      <Section>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Assets Chart */}
          <ThemedCard className="lg:col-span-2 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className={cn(
                'text-lg font-bold',
                theme === 'cyberpunk' ? 'font-rajdhani text-cyan-200' : 'font-poppins text-slate-900'
              )}>
                Assets Overview
              </h3>
              <BarChart3 className={cn(
                'w-5 h-5',
                theme === 'cyberpunk' ? 'text-cyan-400' : 'text-blue-600'
              )} />
            </div>

            {/* Placeholder for chart */}
            <div className={cn(
              'h-48 rounded-lg flex items-center justify-center',
              theme === 'cyberpunk'
                ? 'bg-slate-900/60 border border-cyan-400/20'
                : 'bg-slate-50 border border-slate-200'
            )}>
              <div className="text-center">
                <BarChart3 className={cn(
                  'w-12 h-12 mx-auto mb-2 opacity-50',
                  theme === 'cyberpunk' ? 'text-cyan-400' : 'text-blue-600'
                )} />
                <div className="text-sm opacity-70">
                  Chart visualization will be displayed here
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-4 flex gap-2">
              <Link href={ROUTES.APP_RECHARGE}>
                <ThemedButton size="sm">Deposit</ThemedButton>
              </Link>
              <ThemedButton size="sm" variant="outline">Withdraw</ThemedButton>
              <Link href={ROUTES.APP_TRADE}>
                <ThemedButton size="sm" variant="outline">
                  {theme === 'cyberpunk' ? '交易' : 'Trade'}
                </ThemedButton>
              </Link>
            </div>
          </ThemedCard>

          {/* Today's Tasks */}
          <ThemedCard className="p-6">
            <h3 className={cn(
              'text-lg font-bold mb-4',
              theme === 'cyberpunk' ? 'font-rajdhani text-cyan-200' : 'font-poppins text-slate-900'
            )}>
              Today's Tasks
            </h3>

            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-lg',
                    theme === 'cyberpunk'
                      ? 'bg-slate-900/60 border border-cyan-400/10'
                      : 'bg-slate-50 border border-slate-100'
                  )}
                >
                  <div className="flex items-center gap-2">
                    {task.completed ? (
                      <CheckCircle2 className={cn(
                        'w-5 h-5',
                        theme === 'cyberpunk' ? 'text-green-400' : 'text-green-600'
                      )} />
                    ) : (
                      <div className={cn(
                        'w-5 h-5 rounded-full border-2',
                        theme === 'cyberpunk' ? 'border-cyan-400/40' : 'border-slate-300'
                      )} />
                    )}
                    <div>
                      <div className={cn(
                        'text-sm font-medium',
                        task.completed && 'line-through opacity-60'
                      )}>
                        {task.label}
                      </div>
                      <div className="text-xs opacity-70">{task.reward}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Link href={ROUTES.AIRDROP}>
              <ThemedButton className="w-full mt-4" variant="outline">
                View All Tasks
              </ThemedButton>
            </Link>
          </ThemedCard>
        </div>
      </Section>

      {/* Recent Activity */}
      <Section title="Recent Activity" subtitle="Your latest transactions">
        <ThemedCard className="p-6">
          <div className="space-y-3">
            {recentActivities.map((activity, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-center justify-between p-4 rounded-lg transition-colors',
                  theme === 'cyberpunk'
                    ? 'hover:bg-cyan-400/5 border border-cyan-400/10'
                    : 'hover:bg-slate-50 border border-slate-100'
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center',
                    activity.type === 'stake'
                      ? theme === 'cyberpunk'
                        ? 'bg-cyan-400/20'
                        : 'bg-blue-100'
                      : activity.type === 'reward'
                        ? theme === 'cyberpunk'
                          ? 'bg-green-400/20'
                          : 'bg-green-100'
                        : theme === 'cyberpunk'
                          ? 'bg-pink-400/20'
                          : 'bg-purple-100'
                  )}>
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-medium">{activity.action}</div>
                    <div className="text-xs opacity-70">{activity.time}</div>
                  </div>
                </div>
                <div className={cn(
                  'font-bold',
                  activity.type === 'reward' || activity.type === 'bonus'
                    ? theme === 'cyberpunk'
                      ? 'text-green-400'
                      : 'text-green-600'
                    : ''
                )}>
                  {activity.amount}
                </div>
              </div>
            ))}
          </div>
        </ThemedCard>
      </Section>

      {/* Quick Links */}
      <Section>
        <div className="grid gap-4 md:grid-cols-4">
          <Link href={ROUTES.REFERRAL}>
            <ThemedCard hover className="p-5 cursor-pointer">
              <h4 className="font-semibold mb-1">Referral Program</h4>
              <p className="text-xs opacity-70">Invite friends & earn</p>
            </ThemedCard>
          </Link>
          <Link href={ROUTES.TGE}>
            <ThemedCard hover className="p-5 cursor-pointer">
              <h4 className="font-semibold mb-1">TGE Launch</h4>
              <p className="text-xs opacity-70">Join token sale</p>
            </ThemedCard>
          </Link>
          <Link href={ROUTES.APP_SETTINGS}>
            <ThemedCard hover className="p-5 cursor-pointer">
              <h4 className="font-semibold mb-1">Settings</h4>
              <p className="text-xs opacity-70">Manage your account</p>
            </ThemedCard>
          </Link>
          <Link href={ROUTES.TOKEN}>
            <ThemedCard hover className="p-5 cursor-pointer">
              <h4 className="font-semibold mb-1">Token Info</h4>
              <p className="text-xs opacity-70">Learn about $POI</p>
            </ThemedCard>
          </Link>
        </div>
      </Section>
    </PageLayout>
  );
}
