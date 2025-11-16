import React, { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Section } from "@/components/layout/Section";
import { ThemedCard, ThemedButton, ThemedInput } from "@/components/themed";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useAccount, useWalletClient, usePublicClient } from "wagmi";
import {
  Mail,
  Wallet as WalletIcon,
  CheckCircle2,
  Gift,
  Users,
  Rocket,
  Star,
} from "lucide-react";

export default function EarlyBird() {
  const { theme } = useTheme();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const wallet = (address as string | undefined) || "";

  // Example tasks
  const tasks = [
    { id: 1, label: "绑定钱包", reward: "+25 XP", completed: false, icon: WalletIcon },
    { id: 2, label: "验证邮箱", reward: "+15 XP", completed: false, icon: Mail },
    { id: 3, label: "加入社区", reward: "+30 XP", completed: false, icon: Users },
    { id: 4, label: "分享推荐链接", reward: "+50 XP", completed: false, icon: Gift },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!isConnected || !walletClient || !wallet) {
        throw new Error("请先连接钱包");
      }

      // 1) fetch nonce
      const nonceRes = await fetch(`/api/auth/wallet/nonce?address=${wallet}`, { credentials: "include" });
      if (!nonceRes.ok) {
        const err = await safeJson(nonceRes);
        throw new Error(err?.message ?? "获取签名消息失败");
      }
      const nonceData = await nonceRes.json();

      // 2) sign message
      const message = nonceData.message as string;
      const signature = await walletClient.signMessage({ account: address as `0x${string}`, message });

      // 3) submit register-and-claim
      const res = await fetch("/api/early-bird/register-and-claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, walletAddress: wallet, signature }),
        credentials: "include",
      });

      if (!res.ok) {
        const err = await safeJson(res);
        throw new Error(err?.message ?? "注册失败，请稍后重试");
      }

      const data = await res.json();

      // If logged in, claim (bind) immediately
      if (isAuthenticated && data?.token) {
        const claimRes = await fetch("/api/auth/identities/claim", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ token: data.token }),
        });
        if (!claimRes.ok) {
          const err = await safeJson(claimRes);
          throw new Error(err?.message ?? "绑定钱包失败");
        }
        toast({
          title: "已登记并完成绑定",
          description: "您的钱包已与账户关联",
        });
      } else {
        toast({
          title: "已登记",
          description: data?.confirmUrl
            ? `开发模式：确认链接 ${data.confirmUrl}`
            : "请稍后在登录后完成绑定",
        });
      }
      setEmail("");
    } catch (error: any) {
      toast({
        title: "提交失败",
        description: error?.message ?? "请稍后再试",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const iconStyles = theme === 'cyberpunk'
    ? 'text-cyan-400'
    : 'text-blue-600';

  return (
    <PageLayout>
      {/* Hero Section */}
      <Section
        title="Early-Bird Program"
        subtitle="加入早鸟计划，获取独家空投和奖励"
      >
        <div className="grid gap-6 md:grid-cols-3">
          <ThemedCard className="p-5 text-center">
            <Gift className={cn('w-10 h-10 mx-auto mb-3', iconStyles)} />
            <h4 className={cn(
              'text-lg font-bold mb-2',
              theme === 'cyberpunk' ? 'font-orbitron' : 'font-fredoka'
            )}>
              专属空投
            </h4>
            <p className="text-sm opacity-80">
              早鸟用户额外获得 10% 空投奖励
            </p>
          </ThemedCard>

          <ThemedCard className="p-5 text-center">
            <Star className={cn('w-10 h-10 mx-auto mb-3', iconStyles)} />
            <h4 className={cn(
              'text-lg font-bold mb-2',
              theme === 'cyberpunk' ? 'font-orbitron' : 'font-fredoka'
            )}>
              优先访问
            </h4>
            <p className="text-sm opacity-80">
              提前体验新功能和产品
            </p>
          </ThemedCard>

          <ThemedCard className="p-5 text-center">
            <Rocket className={cn('w-10 h-10 mx-auto mb-3', iconStyles)} />
            <h4 className={cn(
              'text-lg font-bold mb-2',
              theme === 'cyberpunk' ? 'font-orbitron' : 'font-fredoka'
            )}>
              推荐奖励
            </h4>
            <p className="text-sm opacity-80">
              每推荐 1 位好友获得 50 XP
            </p>
          </ThemedCard>
        </div>
      </Section>

      {/* Registration Form */}
      <Section title="绑定钱包参与早鸟" subtitle="填写邮箱并连接钱包，完成登记（不等于平台账号注册）">
        <ThemedCard className="p-6 md:p-8 max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <ThemedInput
              label="邮箱地址"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              helperText="我们将发送验证邮件到此地址"
            />

            <div>
              <div className={cn('text-sm mb-2', theme === 'cyberpunk' ? 'text-cyan-200' : 'text-slate-600')}>钱包</div>
              <div className="flex items-center justify-between gap-3">
                <div className={cn('text-xs break-all', theme === 'cyberpunk' ? 'text-cyan-300' : 'text-slate-700')}>
                  {wallet ? wallet : "未连接"}
                </div>
                <div>
                  {/* 复用现有钱包连接按钮 */}
                  {/* @ts-ignore */}
                  <ThemedButton type="button" variant="outline">
                    <span>{wallet ? "已连接" : "连接钱包"}</span>
                  </ThemedButton>
                </div>
              </div>
              <div className="mt-1 text-xs opacity-70">用于接收空投的 EVM 兼容钱包地址</div>
            </div>

            <div className={cn(
              'p-4 rounded-lg text-sm',
              theme === 'cyberpunk'
                ? 'bg-cyan-400/10 border border-cyan-400/30'
                : 'bg-blue-50 border border-blue-200'
            )}>
              <div className="flex items-start gap-2">
                <CheckCircle2 className={cn('w-5 h-5 mt-0.5 flex-shrink-0', iconStyles)} />
                <div>
                  <div className="font-semibold mb-1">提交后您将收到：</div>
                  <ul className="text-xs opacity-90 space-y-1 ml-4 list-disc">
                    <li>验证邮件（请在 24 小时内验证）</li>
                    <li>早鸟会员徽章</li>
                    <li>独家推荐链接</li>
                  </ul>
                </div>
              </div>
            </div>

            <ThemedButton
              type="submit"
              emphasis
              size="lg"
              className="w-full"
              disabled={loading || !wallet}
            >
              {loading ? '提交中...' : (isAuthenticated ? '提交并绑定' : '提交登记')}
            </ThemedButton>
          </form>
        </ThemedCard>
      </Section>

      {/* Tasks Section */}
      <Section title="完成任务" subtitle="获取更多 XP 和奖励">
        <div className="grid gap-4 md:grid-cols-2">
          {tasks.map((task) => {
            const Icon = task.icon;
            return (
              <ThemedCard
                key={task.id}
                hover
                className={cn(
                  'p-5 transition-all',
                  task.completed && 'opacity-60'
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0',
                    theme === 'cyberpunk'
                      ? 'bg-cyan-400/20'
                      : 'bg-blue-100'
                  )}>
                    <Icon className={cn('w-6 h-6', iconStyles)} />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={cn(
                        'font-semibold',
                        theme === 'cyberpunk' ? 'font-rajdhani' : 'font-poppins'
                      )}>
                        {task.label}
                      </h4>
                      <span className={cn(
                        'text-sm font-bold',
                        theme === 'cyberpunk' ? 'text-green-400' : 'text-green-600'
                      )}>
                        {task.reward}
                      </span>
                    </div>

                    {task.completed ? (
                      <div className="flex items-center gap-1 text-xs text-green-500">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>已完成</span>
                      </div>
                    ) : (
                      <ThemedButton size="sm" className="mt-2">
                        开始任务
                      </ThemedButton>
                    )}
                  </div>
                </div>
              </ThemedCard>
            );
          })}
        </div>
      </Section>

      {/* Statistics */}
      <Section>
        <ThemedCard className="p-6">
          <div className="text-center mb-4">
            <h3 className={cn(
              'text-xl font-bold',
              theme === 'cyberpunk' ? 'font-orbitron text-cyan-300' : 'font-fredoka text-blue-600'
            )}>
              早鸟计划进展
            </h3>
          </div>

          <div className="grid gap-6 md:grid-cols-3 max-w-3xl mx-auto">
            <div className="text-center">
              <div className={cn(
                'text-3xl font-bold mb-1',
                theme === 'cyberpunk' ? 'font-orbitron text-cyan-300' : 'font-poppins text-blue-600'
              )}>
                8,542
              </div>
              <div className="text-sm opacity-70">已注册用户</div>
            </div>

            <div className="text-center">
              <div className={cn(
                'text-3xl font-bold mb-1',
                theme === 'cyberpunk' ? 'font-orbitron text-pink-300' : 'font-poppins text-green-600'
              )}>
                $482k
              </div>
              <div className="text-sm opacity-70">累计奖励</div>
            </div>

            <div className="text-center">
              <div className={cn(
                'text-3xl font-bold mb-1',
                theme === 'cyberpunk' ? 'font-orbitron text-purple-300' : 'font-poppins text-purple-600'
              )}>
                15,682
              </div>
              <div className="text-sm opacity-70">推荐人数</div>
            </div>
          </div>
        </ThemedCard>
      </Section>
    </PageLayout>
  );
}

async function safeJson(res: Response): Promise<any | null> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}
