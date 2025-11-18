import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageLayout } from "@/components/layout/PageLayout";
import { Section } from "@/components/layout/Section";
import { ThemedCard, ThemedButton } from "@/components/themed";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import StripePayment from "@/components/StripePayment";
import { Shield, Wallet, Coins, ArrowRight } from "lucide-react";
import { ROUTES } from "@/routes";

interface ImmortalityBalanceResponse {
  credits: number;
  poiCredits: number;
}

export default function Recharge() {
  const { theme } = useTheme();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  const { data: balance, refetch, isFetching } = useQuery<ImmortalityBalanceResponse>({
    queryKey: ["/api/immortality/balance"],
    enabled: isAuthenticated,
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (sessionId) {
      toast({
        title: "充值处理中",
        description: "Stripe 支付已完成，余额即将更新。",
      });
      refetch();
      params.delete("session_id");
      const newUrl =
        window.location.pathname + (params.toString() ? `?${params.toString()}` : "");
      window.history.replaceState({}, "", newUrl);
    }
  }, [refetch, toast]);

  const credits = balance?.credits ?? 0;

  return (
    <PageLayout>
      <Section>
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <p className={cn(
            "text-xs uppercase tracking-widest opacity-70",
            theme === "cyberpunk" ? "text-cyan-300" : "text-slate-500"
          )}>
            Immortality Plan · Layer 2
          </p>
          <h1 className={cn(
            "text-3xl font-bold",
            theme === "cyberpunk" ? "font-orbitron text-cyan-100" : "font-fredoka text-slate-900"
          )}>
            Recharge Immortality Credits
          </h1>
          <p className="text-sm opacity-80">
            使用法币充值，获得 Immortality Credits。Credits 会记录在中心化账本中，
            可在 Roblox / AgentKit / ProjectX 中消费或兑换成 POI。
          </p>
                  </div>
      </Section>

      <Section title="Immortality Balance" subtitle="中心化账本用于记录法币 inflow，未来可兑换 POI">
        <div className="grid gap-4 lg:grid-cols-2">
          <ThemedCard className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest opacity-70">Current Balance</p>
                <div className="text-3xl font-bold">
                  {credits.toLocaleString()} 点
                  {isFetching && <span className="ml-2 text-xs opacity-70">刷新中…</span>}
                </div>
          </div>
              <Coins className="w-10 h-10 text-primary" />
                  </div>
            <p className="text-sm opacity-80">
              Credits = Layer 2 余额。它们暂存在中心化账本，方便对账 / 合规，也能在未来转换成 POI 或直接用于
              Immortality 服务。
            </p>
            <p className="text-xs opacity-60">
              未取得牌照之前我们不会直接发 POI。Credits 可审计、可退款，也能在法币/链上之间灵活切换。
            </p>
                </ThemedCard>

          <ThemedCard className="p-6 space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Ledger 原则
            </h3>
            <p className="text-sm opacity-80">
              1) 每笔 Stripe 充值都会写入 `fiat_transactions` 与 `user_balances`；<br />
              2) Ledger 是审计与退款的唯一来源；<br />
              3) 未来兑换 POI 时，会参考 Ledger 数据进行结算。
            </p>
          </ThemedCard>
                </div>
      </Section>

      <Section title="使用 Stripe 充值" subtitle="信用卡 / Apple Pay / Google Pay">
        <div className="grid gap-6 lg:grid-cols-2">
          <ThemedCard className="p-6">
            <StripePayment disabled={!isAuthenticated} />
            {!isAuthenticated && (
              <p className="text-xs text-center text-red-500 mt-3">请先登录账户再进行充值。</p>
            )}
          </ThemedCard>

          <ThemedCard className="p-6 space-y-3">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              <h3 className="font-semibold">操作步骤</h3>
              </div>
            <ol className="list-decimal list-inside space-y-2 text-sm opacity-80">
              <li>输入金额并跳转 Stripe Checkout（当前可使用测试卡）。</li>
              <li>支付完成返回 `/recharge`，系统根据 session_id 自动刷新余额。</li>
              <li>Credits 立即可用：可在 Immortality 体验中消费，或稍后兑换 POI。</li>
            </ol>
            <div className="text-xs opacity-60">
              Webhook 会把每笔 session 写入 `fiat_transactions`、`user_balances`、`immortality_ledger`，方便审计。
            </div>
          </ThemedCard>
        </div>
      </Section>

      <Section title="链上购买（Layer 1）">
        <ThemedCard className="p-6 flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex-1 space-y-2">
            <h3 className="text-lg font-semibold">已经有钱包和 USDC？</h3>
            <p className="text-sm opacity-80">
              前往 <span className="font-semibold">Market → TGE Purchase</span> 使用 Base 网络上的
              USDC 直接购买 POI。链上用户无需经过中心化账本。
            </p>
          </div>
          <ThemedButton asChild emphasis>
            <a href={ROUTES.APP_TRADE}>
              去购买 POI
              <ArrowRight className="w-4 h-4 ml-2" />
            </a>
          </ThemedButton>
        </ThemedCard>
      </Section>

      <Section title="常见问题" subtitle="Immortality Credits 与法币路径">
        <div className="grid gap-4 md:grid-cols-2 max-w-4xl mx-auto">
          <ThemedCard className="p-5 space-y-2">
            <h4 className="font-bold">Stripe 测试模式</h4>
            <p className="text-sm opacity-80">
              在 `.env` 中设置 `STRIPE_SECRET_KEY`（test）和 `STRIPE_WEBHOOK_SECRET`，使用
              4242 4242 4242 4242 卡号即可跑通全流程。
            </p>
          </ThemedCard>
          <ThemedCard className="p-5 space-y-2">
            <h4 className="font-bold">Credits 与 POI 的兑换</h4>
            <p className="text-sm opacity-80">
              MVP 阶段 1 Credit ≈ 1 USD。未来会提供“兑换 POI”按钮，或在 Immortality 服务内直接扣减。
            </p>
          </ThemedCard>
          <ThemedCard className="p-5 space-y-2">
            <h4 className="font-bold">数据如何导出？</h4>
            <p className="text-sm opacity-80">
              数据保存在 `fiat_transactions`、`user_balances`、`immortality_ledger` 表，可直接用 SQL 或 BI 工具分析。
            </p>
          </ThemedCard>
          <ThemedCard className="p-5 space-y-2">
            <h4 className="font-bold">支付失败怎么办？</h4>
            <p className="text-sm opacity-80">
              失败 / 过期的 session 会被标记为 failed，不会增加 Credits。可直接重新发起一次支付。
            </p>
          </ThemedCard>
        </div>
      </Section>
    </PageLayout>
  );
}
