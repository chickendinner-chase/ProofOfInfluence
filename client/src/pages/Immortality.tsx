import React, { useState } from "react";
import { Link } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { PageLayout } from "@/components/layout/PageLayout";
import { Section } from "@/components/layout/Section";
import { ThemedCard, ThemedButton, ThemedBadge } from "@/components/themed";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { AlertCircle, Brain, Zap, Coins, Activity, ArrowRight, Shield, Award, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ImmortalityChat } from "@/components/ImmortalityChat";
import { useMintBadge, useTgePurchase, useStakePoi, useUnstakePoi, useClaimReward } from "@/hooks/useContractAction";
import { ROUTES } from "@/routes";

interface ImmortalityBalanceResponse {
  credits: number;
  poiCredits: number;
}

interface UserMemory {
  id: number;
  text: string;
  emotion?: string | null;
  createdAt: string;
}

const mockHistory = [
  {
    id: "mint_2031",
    title: "意识上链 #3",
    date: "2025-11-16",
    credits: 50,
    status: "completed",
    txHash: "0x1234...beef",
  },
  {
    id: "mint_2030",
    title: "意识上链 #2",
    date: "2025-11-10",
    credits: 50,
    status: "queued",
    txHash: null,
  },
];

export default function Immortality() {
  const { theme } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [memoryText, setMemoryText] = useState("");
  const [emotion, setEmotion] = useState("");

  // Agent Actions (executed by backend/AgentKit)
  const mintBadge = useMintBadge();

  // User Actions (require user wallet signature)
  const tgePurchase = useTgePurchase();
  const stakePoi = useStakePoi();
  const unstakePoi = useUnstakePoi();
  const claimReward = useClaimReward();

  // TGE & Staking local states
  const [usdcAmount, setUsdcAmount] = useState<string>("");
  const [stakeAmount, setStakeAmount] = useState<string>("");
  const [unstakeAmount, setUnstakeAmount] = useState<string>("");

  const { data: balance, isFetching } = useQuery<ImmortalityBalanceResponse>({
    queryKey: ["/api/immortality/balance"],
    enabled: isAuthenticated,
  });

  const { data: memories, refetch: refetchMemories } = useQuery<UserMemory[]>({
    queryKey: ["/api/me/memories"],
    enabled: isAuthenticated,
  });

  const memoryMutation = useMutation({
    mutationFn: async (payload: { text: string; emotion?: string }) => {
      const res = await fetch("/api/me/memories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error("Failed to create memory");
      }
      return res.json();
    },
    onSuccess: () => {
      setMemoryText("");
      setEmotion("");
      refetchMemories();
      toast({ title: "记忆已保存", description: "赛博档案已更新" });
    },
    onError: () => {
      toast({ title: "保存失败", description: "请稍后再试", variant: "destructive" });
    },
  });
  const memoryPending = memoryMutation.status === "pending";

  const credits = balance?.credits ?? 0;
  const poiCredits = balance?.poiCredits ?? 0;

  const heroTitle =
    theme === "cyberpunk"
      ? "Immortality Control Room"
      : "Immortality Playground";

  const heroSubtitle =
    theme === "cyberpunk"
      ? "掌控 AI Agent、法币 Credits 与链上身份，一切尽在同一面板。"
      : "充值 Credits、升级你的 AI Agent、随时把记忆和社交证明上链。";

  const consciousnessCTA = (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-widest opacity-70">
        <Brain className="w-4 h-4" />
        Consciousness Upload
      </div>
      <p className="text-sm opacity-80">
        将你的社交链接、互动记忆和 Agent 状态写入链上存证。操作会扣除 50 Credits，并生成可分享的
        Immortality 证书。
      </p>
      <div className="text-xs opacity-60">
        下一步：完成 Ledger 打通后，即可调用链上存证合约。
      </div>
      <div className="flex flex-wrap gap-2">
        <ThemedBadge>社交凭据</ThemedBadge>
        <ThemedBadge>AI 互动日志</ThemedBadge>
        <ThemedBadge>链上签名</ThemedBadge>
      </div>
      <div className="flex gap-3 flex-wrap">
        <ThemedButton emphasis disabled>
          意识上链（即将开放）
        </ThemedButton>
        <ThemedButton variant="outline" asChild>
          <Link href={ROUTES.APP_RECHARGE}>充值 Credits</Link>
        </ThemedButton>
      </div>
    </div>
  );

  return (
    <PageLayout>
      <Section className="pt-12">
        <div className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
          <ThemedCard className="p-6 space-y-5">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs uppercase tracking-widest opacity-70">
                  {theme === "cyberpunk" ? "Layer 3 • Immortality Plan" : "Layer 3 · Immortality"}
                </p>
                <h1
                  className={cn(
                    "text-3xl font-bold",
                    theme === "cyberpunk" ? "font-orbitron text-cyan-100" : "font-fredoka text-slate-900",
                  )}
                >
                  {heroTitle}
                </h1>
              </div>
              <button
                type="button"
                className={cn(
                  "px-3 py-1 rounded-full text-xs flex items-center gap-1",
                  theme === "cyberpunk" ? "bg-cyan-400/15 text-cyan-200" : "bg-blue-100 text-blue-600",
                )}
              >
                <Activity className="w-3 h-3" />
                Agent {user?.username ?? "Guest"}{" "}
              </button>
            </div>
            <p className="text-sm opacity-80">{heroSubtitle}</p>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs uppercase opacity-70">Immortality Credits</p>
                <p className="text-2xl font-bold">{credits.toLocaleString()}</p>
                {isFetching && <p className="text-xs opacity-50">刷新中…</p>}
              </div>
              <div>
                <p className="text-xs uppercase opacity-70">POI Credits</p>
                <p className="text-2xl font-bold">{poiCredits.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs uppercase opacity-70">AI Agent Status</p>
                <p className="text-sm font-semibold text-green-400">Online · Mining</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <ThemedButton emphasis asChild>
                <Link href={ROUTES.APP_RECHARGE}>
                  充值 Credits
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </ThemedButton>
              <ThemedButton variant="outline" asChild>
                <Link href={ROUTES.APP_TRADE}>链上购买 POI</Link>
              </ThemedButton>
            </div>
          </ThemedCard>

          <ThemedCard className="p-6 space-y-4">{consciousnessCTA}</ThemedCard>
        </div>
      </Section>

      <Section 
        title="POI 购买（TGE）" 
        subtitle="输入 USDC 金额并进行购买；需要用户钱包签名；未部署或未开放将返回错误提示"
      >
        <ThemedCard className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <input
              className={cn(
                "flex-1 rounded-xl border bg-transparent p-2 text-sm outline-none",
                theme === "cyberpunk" ? "border-cyan-500/40" : "border-slate-200",
              )}
              placeholder="USDC 数量（如 50）"
              value={usdcAmount}
              onChange={(e) => setUsdcAmount(e.target.value)}
            />
            <ThemedButton
              emphasis
              disabled={tgePurchase.isPending || !usdcAmount.trim()}
              onClick={() => {
                // usdcAmount 以 6 位小数最小单位传入（后端会编码）
                const amount6 = String(Math.round(Number(usdcAmount) * 1e6));
                tgePurchase.execute({ args: { usdcAmount: amount6, proof: [] } });
              }}
            >
              {tgePurchase.isPending ? "购买中..." : "购买 POI"}
            </ThemedButton>
          </div>
          {tgePurchase.isError && <div className="text-xs text-red-400">购买失败：请检查是否已部署或是否在销售窗口内</div>}
        </ThemedCard>
      </Section>

      <Section 
        title="POI 质押（Staking）" 
        subtitle="质押/解押/领取奖励；需要用户钱包签名；如未部署将返回错误提示"
      >
        <ThemedCard className="p-6 space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex items-center gap-3">
              <input
                className={cn(
                  "flex-1 rounded-xl border bg-transparent p-2 text-sm outline-none",
                  theme === "cyberpunk" ? "border-cyan-500/40" : "border-slate-200",
                )}
                placeholder="质押数量（POI）如 100"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
              />
              <ThemedButton
                emphasis
                disabled={stakePoi.isPending || !stakeAmount.trim()}
                onClick={() => {
                  const amount18 = String(BigInt(Math.round(Number(stakeAmount) * 1e18)));
                  stakePoi.execute({ args: { amount: amount18 } });
                }}
              >
                {stakePoi.isPending ? "质押中..." : "质押"}
              </ThemedButton>
            </div>
            <div className="flex items-center gap-3">
              <input
                className={cn(
                  "flex-1 rounded-xl border bg-transparent p-2 text-sm outline-none",
                  theme === "cyberpunk" ? "border-cyan-500/40" : "border-slate-200",
                )}
                placeholder="解押数量（POI）如 50"
                value={unstakeAmount}
                onChange={(e) => setUnstakeAmount(e.target.value)}
              />
              <ThemedButton
                variant="outline"
                disabled={unstakePoi.isPending || !unstakeAmount.trim()}
                onClick={() => {
                  const amount18 = String(BigInt(Math.round(Number(unstakeAmount) * 1e18)));
                  unstakePoi.execute({ args: { amount: amount18 } });
                }}
              >
                {unstakePoi.isPending ? "解押中..." : "解押"}
              </ThemedButton>
            </div>
          </div>
          <div>
            <ThemedButton
              size="sm"
              disabled={claimReward.isPending}
              onClick={() => claimReward.execute({ args: {} })}
            >
              {claimReward.isPending ? "领取中..." : "领取奖励"}
            </ThemedButton>
          </div>
          {(stakePoi.isError || unstakePoi.isError || claimReward.isError) && (
            <div className="text-xs text-red-400">操作失败：请检查是否已部署或额度是否足够</div>
          )}
        </ThemedCard>
      </Section>

      <Section title="今日记忆" subtitle="写下此刻的情绪与片段，赛博分身会记住它们">
        <div className="grid gap-6 lg:grid-cols-2">
          <ThemedCard className="p-6 space-y-4">
            <textarea
              className={cn(
                "w-full rounded-xl border bg-transparent p-3 text-sm outline-none focus:ring-2",
                theme === "cyberpunk"
                  ? "border-cyan-500/40 focus:ring-cyan-400/40"
                  : "border-slate-200 focus:ring-blue-200",
              )}
              rows={4}
              placeholder="记录今天让你印象深刻的一件事..."
              value={memoryText}
              onChange={(e) => setMemoryText(e.target.value)}
            />
            <div className="flex items-center gap-3">
              <label className="text-sm opacity-70">情绪</label>
              <select
                className={cn(
                  "flex-1 rounded-xl border bg-transparent p-2 text-sm",
                  theme === "cyberpunk" ? "border-cyan-500/40" : "border-slate-200",
                )}
                value={emotion}
                onChange={(e) => setEmotion(e.target.value)}
              >
                <option value="">选择情绪</option>
                <option value="joy">喜悦</option>
                <option value="calm">平静</option>
                <option value="tired">疲惫</option>
                <option value="stressed">压力</option>
              </select>
              <ThemedButton
                emphasis
                disabled={!memoryText.trim() || memoryPending}
                onClick={() =>
                  memoryMutation.mutate({
                    text: memoryText.trim(),
                    emotion: emotion || undefined,
                  })
                }
              >
                {memoryPending ? "保存中..." : "保存"}
              </ThemedButton>
            </div>
          </ThemedCard>

          <ThemedCard className="p-6 space-y-4">
            {memories && memories.length > 0 ? (
              <div className="space-y-4">
                {memories.slice(0, 6).map((memo) => (
                  <div
                    key={memo.id}
                    className={cn(
                      "rounded-xl border p-4 text-sm",
                      theme === "cyberpunk" ? "border-cyan-500/20" : "border-slate-200",
                    )}
                  >
                    <div className="flex items-center justify-between text-xs opacity-60">
                      <span>{new Date(memo.createdAt).toLocaleString()}</span>
                      {memo.emotion && <span>{memo.emotion}</span>}
                    </div>
                    <p className="mt-2 whitespace-pre-wrap leading-relaxed">{memo.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm opacity-70">写下第一条记忆后，这里会展示最近的片段。</p>
            )}
          </ThemedCard>
        </div>
      </Section>

      <Section 
        title="测试徽章" 
        subtitle="让赛博分身在 Base Sepolia 上为你铸下一枚纪念徽章（由后端 AgentKit 执行，无需用户签名）"
      >
        <ThemedCard className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            <span className="font-semibold">Test Immortality Badge</span>
          </div>
          <p className="text-sm opacity-80">
            点击下方按钮即可触发链上动作（Base Sepolia），铸造一枚仅属于你的测试徽章。需要先在“钱包”里绑定 Base
            地址。
          </p>
          <div className="flex items-center gap-3">
            <ThemedButton
              emphasis
              disabled={mintBadge.isPending}
              onClick={() => mintBadge.execute({ args: {} })}
            >
              {mintBadge.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {mintBadge.isPending ? "处理中..." : "铸造徽章"}
            </ThemedButton>
            {mintBadge.isSuccess && mintBadge.data?.txHash && (
              <a
                href={`https://sepolia.basescan.org/tx/${mintBadge.data.txHash}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-primary hover:underline"
              >
                查看交易
              </a>
            )}
            {mintBadge.isError && <span className="text-xs text-red-400">请稍后重试</span>}
          </div>
        </ThemedCard>
      </Section>

      <Section title="与赛博分身对话" subtitle="分身会结合人格档案和最近记忆，给予建议与陪伴">
        <ImmortalityChat />
      </Section>

      <Section title="账本与上链记录" subtitle="Ledger、Credits、以及每一次意识上链的足迹">
        <div className="grid gap-6 lg:grid-cols-3">
          <ThemedCard className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4" />
              <span className="font-semibold text-sm">中心化账本</span>
            </div>
            <p className="text-sm opacity-80">
              Stripe 充值成功后会立即写入 `fiat_transactions`、`user_balances` 与 `immortality_ledger`。
              所有 Credits 增减都可追溯。
            </p>
            <Link href={ROUTES.APP_RECHARGE}>
              <a className="text-xs font-semibold text-primary hover:underline">查看账本指南 →</a>
            </Link>
          </ThemedCard>

          <ThemedCard className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="font-semibold text-sm">合规安全</span>
            </div>
            <p className="text-sm opacity-80">
              我们在 Layer 2 记录 Credits，待取得牌照后再映射到链上。这让法币 inflow 更安全、更可控。
            </p>
            <span className="text-xs opacity-60">MSB / MTL 准备中</span>
          </ThemedCard>

          <ThemedCard className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span className="font-semibold text-sm">Layer 1 入口</span>
            </div>
            <p className="text-sm opacity-80">
              如果你已有 Base 网络的钱包，可以直接使用 TGESale 合约购买 POI。Credits 与 POI 会共享同一经济体系。
            </p>
            <ThemedButton asChild size="sm" className="mt-2">
              <Link href={ROUTES.APP_TRADE}>前往 TGESale</Link>
            </ThemedButton>
          </ThemedCard>
        </div>
      </Section>

      <Section title="意识上链历史" subtitle="最近的 Consciousness Upload 记录">
        <ThemedCard className="p-6 space-y-4">
          {!mockHistory.length && (
            <div className="flex items-center gap-2 text-sm opacity-70">
              <AlertCircle className="w-4 h-4" />
              还没有历史记录。完成第一笔上链后，这里会显示详细信息。
            </div>
          )}
          {mockHistory.length > 0 && (
            <div className="space-y-4">
              {mockHistory.map((entry) => (
                <div
                  key={entry.id}
                  className={cn(
                    "p-4 rounded-lg border flex flex-col gap-1 md:flex-row md:items-center md:justify-between",
                    theme === "cyberpunk"
                      ? "border-cyan-400/20 bg-cyan-400/5"
                      : "border-slate-200 bg-white",
                  )}
                >
                  <div>
                    <div className="font-semibold">{entry.title}</div>
                    <div className="text-xs opacity-60">{entry.date}</div>
                  </div>
                  <div className="text-sm font-semibold">消耗 {entry.credits} Credits</div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "px-2 py-1 rounded-full text-xs",
                        entry.status === "completed"
                          ? "bg-green-500/10 text-green-400"
                          : entry.status === "queued"
                          ? "bg-yellow-500/10 text-yellow-400"
                          : "bg-red-500/10 text-red-400",
                      )}
                    >
                      {entry.status === "completed" ? "已上链" : "排队中"}
                    </span>
                    {entry.txHash ? (
                      <a
                        href={`https://basescan.org/tx/${entry.txHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        {entry.txHash}
                      </a>
                    ) : (
                      <span className="text-xs opacity-60">等待上链</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ThemedCard>
      </Section>
    </PageLayout>
  );
}


