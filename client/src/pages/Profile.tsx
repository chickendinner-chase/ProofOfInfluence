import React, { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { PageLayout } from "@/components/layout/PageLayout";
import { Section } from "@/components/layout/Section";
import { ThemedCard, ThemedButton, ThemedInput } from "@/components/themed";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Palette, Bell, Shield, Wallet, Save, LogOut, Brain, Lock, Link as LinkIcon, CheckCircle2 } from "lucide-react";
import type { User as UserType } from "@shared/schema";
import { useAccount, useWalletClient } from "wagmi";

interface PersonalityProfile {
  mbtiType?: string | null;
  mbtiScores?: Record<string, number> | null;
  values?: Record<string, number> | null;
}

export default function Profile() {
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  // Fetch user data (keeping existing API integration)
  const { data: user } = useQuery<UserType>({
    queryKey: ["/api/auth/user"],
  });

  const { data: identities, refetch: refetchIdentities } = useQuery<any>({
    queryKey: ["/api/auth/identities"],
  });

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [notifications, setNotifications] = useState(true);
  const [mbtiType, setMbtiType] = useState("");
  const [exploration, setExploration] = useState(0.5);
  const [safety, setSafety] = useState(0.5);

  useEffect(() => {
    if (user) {
      setUsername(user.username ?? "");
      setEmail(user.email ?? "");
    }
  }, [user]);

  const { data: personality } = useQuery<PersonalityProfile>({
    queryKey: ["/api/me/personality"],
  });

  useEffect(() => {
    if (personality) {
      setMbtiType(personality.mbtiType ?? "");
      setExploration(personality.values?.exploration ?? 0.5);
      setSafety(personality.values?.safety ?? 0.5);
    }
  }, [personality]);

  const personalityMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        mbtiType: mbtiType || null,
        values: {
          exploration,
          safety,
        },
      };
      const res = await fetch("/api/me/personality", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error("Failed to save personality");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "人格档案已更新" });
    },
    onError: () => {
      toast({ title: "保存失败", description: "请稍后再试", variant: "destructive" });
    },
  });

  const handleSave = () => {
    toast({
      title: "保存成功",
      description: "您的设置已更新",
    });
  };

  const handleLogout = () => {
    // Logout logic would go here
    toast({
      title: "已退出登录",
      description: "您已安全退出",
    });
  };

  const bindWallet = async () => {
    if (!isConnected || !address) {
      toast({ title: "请先连接钱包", variant: "destructive" });
      return;
    }
    const res = await fetch("/api/auth/identities/bind", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ provider: "wallet", walletAddress: address }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast({ title: "绑定失败", description: err?.message ?? "稍后再试", variant: "destructive" });
      return;
    }
    toast({ title: "钱包已绑定" });
    refetchIdentities();
  };

  return (
    <PageLayout>
      <Section>
        <div className="max-w-3xl mx-auto">
          <h1 className={cn(
            'text-2xl font-bold mb-2',
            theme === 'cyberpunk' ? 'font-orbitron text-cyan-100' : 'font-fredoka text-slate-900'
          )}>
            Profile Settings
          </h1>
          <p className="text-sm opacity-70 mb-8">
            管理您的账户信息和偏好设置
          </p>

          {/* Basic Info */}
          <ThemedCard className="p-6 mb-6">
            <h3 className={cn(
              'text-lg font-bold mb-4 flex items-center gap-2',
              theme === 'cyberpunk' ? 'font-rajdhani text-cyan-200' : 'font-poppins text-slate-900'
            )}>
              <User className="w-5 h-5" />
              基础信息
            </h3>

            <div className="space-y-4">
              <ThemedInput
                label="用户名"
                placeholder="chase"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />

              <ThemedInput
                label="邮箱地址"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <ThemedButton emphasis onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                保存更改
              </ThemedButton>
            </div>
          </ThemedCard>

          {/* Personality Profile */}
          <ThemedCard className="p-6 mb-6">
            <h3
              className={cn(
                "text-lg font-bold mb-4 flex items-center gap-2",
                theme === "cyberpunk" ? "font-rajdhani text-cyan-200" : "font-poppins text-slate-900",
              )}
            >
              <Brain className="w-5 h-5" />
              赛博人格档案
            </h3>
            <div className="space-y-4">
              <ThemedInput
                label="MBTI 类型"
                placeholder="例如 INFJ"
                value={mbtiType}
                onChange={(e) => setMbtiType(e.target.value.toUpperCase())}
              />
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>探索欲</span>
                  <span>{Math.round(exploration * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={exploration}
                  onChange={(e) => setExploration(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>安全感</span>
                  <span>{Math.round(safety * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={safety}
                  onChange={(e) => setSafety(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <ThemedButton
                emphasis
                onClick={() => personalityMutation.mutate()}
                disabled={personalityMutation.status === "pending"}
              >
                {personalityMutation.status === "pending" ? "保存中..." : "保存人格档案"}
              </ThemedButton>
            </div>
          </ThemedCard>

          {/* Theme Preference */}
          <ThemedCard className="p-6 mb-6">
            <h3 className={cn(
              'text-lg font-bold mb-4 flex items-center gap-2',
              theme === 'cyberpunk' ? 'font-rajdhani text-cyan-200' : 'font-poppins text-slate-900'
            )}>
              <Palette className="w-5 h-5" />
              主题偏好
            </h3>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium mb-1">当前主题</div>
                <div className="text-sm opacity-70">
                  {theme === 'cyberpunk' ? 'Cyberpunk (赛博朋克)' : 'Playful (年轻风格)'}
                </div>
              </div>
              <ThemedButton onClick={toggleTheme}>
                切换主题
              </ThemedButton>
            </div>

            <div className={cn(
              'mt-4 p-3 rounded-lg text-xs',
              theme === 'cyberpunk'
                ? 'bg-cyan-400/10 border border-cyan-400/30'
                : 'bg-blue-50 border border-blue-200'
            )}>
              主题设置会自动保存，刷新页面后保持不变
            </div>
          </ThemedCard>

          {/* Notifications */}
          <ThemedCard className="p-6 mb-6">
            <h3 className={cn(
              'text-lg font-bold mb-4 flex items-center gap-2',
              theme === 'cyberpunk' ? 'font-rajdhani text-cyan-200' : 'font-poppins text-slate-900'
            )}>
              <Bell className="w-5 h-5" />
              通知设置
            </h3>

            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <div className="font-medium">邮件通知</div>
                  <div className="text-sm opacity-70">接收重要更新和活动通知</div>
                </div>
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                  className={cn(
                    'w-5 h-5 rounded',
                    theme === 'cyberpunk'
                      ? 'border-cyan-400/30'
                      : 'border-slate-300'
                  )}
                />
              </label>
            </div>
          </ThemedCard>

          {/* Security */}
          <ThemedCard className="p-6 mb-6">
            <h3 className={cn(
              'text-lg font-bold mb-4 flex items-center gap-2',
              theme === 'cyberpunk' ? 'font-rajdhani text-cyan-200' : 'font-poppins text-slate-900'
            )}>
              <Shield className="w-5 h-5" />
              安全设置
            </h3>

            <div className="space-y-3">
              <div className="p-4 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      <Wallet className="w-4 h-4" /> 已绑定钱包
                    </div>
                    <div className="text-xs opacity-70 mt-1">
                      {identities?.identities?.filter((i: any) => i.provider === "wallet")?.length
                        ? identities.identities
                            .filter((i: any) => i.provider === "wallet")
                            .map((i: any) => i.walletAddress)
                            .join(", ")
                        : "暂无绑定"}
                    </div>
                  </div>
                  <ThemedButton variant="outline" onClick={bindWallet}>
                    <LinkIcon className="w-4 h-4 mr-2" />
                    一键绑定当前钱包
                  </ThemedButton>
                </div>
                <div className="text-xs opacity-70 mt-2">
                  当前钱包：{isConnected && address ? address : "未连接"}
                </div>
              </div>

              <ThemedButton variant="outline" className="w-full justify-start">
                <Lock className="w-4 h-4 mr-2" />
                修改密码
              </ThemedButton>

            </div>
          </ThemedCard>

          {/* Logout */}
          <ThemedCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium mb-1">退出登录</div>
                <div className="text-sm opacity-70">退出当前账户</div>
              </div>
              <ThemedButton variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                退出
              </ThemedButton>
            </div>
          </ThemedCard>
        </div>
      </Section>
    </PageLayout>
  );
}
