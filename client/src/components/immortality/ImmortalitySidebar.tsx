import React, { useState } from "react";
import { Link } from "wouter";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { ThemedCard, ThemedButton } from "@/components/themed";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronDown,
  ChevronUp,
  Coins,
  History,
  FileText,
} from "lucide-react";
import { ROUTES } from "@/routes";
import { useTgePurchase, useStakePoi, useUnstakePoi, useClaimReward } from "@/hooks/useContractAction";

interface ImmortalitySidebarProps {
  // Contract actions
  usdcAmount: string;
  setUsdcAmount: (amount: string) => void;
  stakeAmount: string;
  setStakeAmount: (amount: string) => void;
  unstakeAmount: string;
  setUnstakeAmount: (amount: string) => void;
}

export function ImmortalitySidebar({
  usdcAmount,
  setUsdcAmount,
  stakeAmount,
  setStakeAmount,
  unstakeAmount,
  setUnstakeAmount,
}: ImmortalitySidebarProps) {
  const { theme } = useTheme();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    poi: false,
    history: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Contract actions
  const tgePurchase = useTgePurchase();
  const stakePoi = useStakePoi();
  const unstakePoi = useUnstakePoi();
  const claimReward = useClaimReward();

  const handleTGEPurchase = () => {
    if (!usdcAmount.trim()) return;
    const amount6 = String(Math.round(Number(usdcAmount) * 1e6));
    tgePurchase.execute({ args: { usdcAmount: amount6, proof: [] } });
  };

  const handleStake = () => {
    if (!stakeAmount.trim()) return;
    const amount18 = String(BigInt(Math.round(Number(stakeAmount) * 1e18)));
    stakePoi.execute({ args: { amount: amount18 } });
  };

  const handleUnstake = () => {
    if (!unstakeAmount.trim()) return;
    const amount18 = String(BigInt(Math.round(Number(unstakeAmount) * 1e18)));
    unstakePoi.execute({ args: { amount: amount18 } });
  };

  return (
    <div className="h-full overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-slate-400/20 scrollbar-track-transparent">
      {/* POI Operations - Collapsible */}
      <Collapsible open={openSections.poi} onOpenChange={() => toggleSection("poi")}>
        <ThemedCard className="p-4 space-y-3">
          <CollapsibleTrigger className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className={cn("w-4 h-4", theme === "cyberpunk" ? "text-cyan-400" : "text-blue-600")} />
              <span className="text-sm font-semibold">POI 操作</span>
            </div>
            {openSections.poi ? (
              <ChevronUp className="w-4 h-4 opacity-50" />
            ) : (
              <ChevronDown className="w-4 h-4 opacity-50" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3">
            {/* TGE Purchase */}
            <div className="space-y-2">
              <p className="text-xs font-semibold opacity-80">购买 POI</p>
              <div className="flex gap-2">
                <input
                  className={cn(
                    "flex-1 rounded-lg border bg-transparent p-2 text-xs outline-none",
                    theme === "cyberpunk" ? "border-cyan-500/40" : "border-slate-200",
                  )}
                  placeholder="USDC 数量"
                  value={usdcAmount}
                  onChange={(e) => setUsdcAmount(e.target.value)}
                />
                <ThemedButton
                  emphasis
                  size="sm"
                  disabled={tgePurchase.isPending || !usdcAmount.trim()}
                  onClick={handleTGEPurchase}
                >
                  {tgePurchase.isPending ? "..." : "购买"}
                </ThemedButton>
              </div>
              {tgePurchase.isError && (
                <p className="text-xs text-red-400">购买失败</p>
              )}
            </div>

            {/* Staking */}
            <div className="space-y-2">
              <p className="text-xs font-semibold opacity-80">质押 POI</p>
              <div className="flex gap-2">
                <input
                  className={cn(
                    "flex-1 rounded-lg border bg-transparent p-2 text-xs outline-none",
                    theme === "cyberpunk" ? "border-cyan-500/40" : "border-slate-200",
                  )}
                  placeholder="数量"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                />
                <ThemedButton
                  emphasis
                  size="sm"
                  disabled={stakePoi.isPending || !stakeAmount.trim()}
                  onClick={handleStake}
                >
                  {stakePoi.isPending ? "..." : "质押"}
                </ThemedButton>
              </div>
            </div>

            {/* Unstake */}
            <div className="space-y-2">
              <p className="text-xs font-semibold opacity-80">解押 POI</p>
              <div className="flex gap-2">
                <input
                  className={cn(
                    "flex-1 rounded-lg border bg-transparent p-2 text-xs outline-none",
                    theme === "cyberpunk" ? "border-cyan-500/40" : "border-slate-200",
                  )}
                  placeholder="数量"
                  value={unstakeAmount}
                  onChange={(e) => setUnstakeAmount(e.target.value)}
                />
                <ThemedButton
                  variant="outline"
                  size="sm"
                  disabled={unstakePoi.isPending || !unstakeAmount.trim()}
                  onClick={handleUnstake}
                >
                  {unstakePoi.isPending ? "..." : "解押"}
                </ThemedButton>
              </div>
            </div>

            {/* Claim Reward */}
            <div>
              <ThemedButton
                size="sm"
                variant="outline"
                disabled={claimReward.isPending}
                onClick={() => claimReward.execute({ args: {} })}
                className="w-full"
              >
                {claimReward.isPending ? "领取中..." : "领取奖励"}
              </ThemedButton>
            </div>

            <div className="pt-2 border-t border-opacity-20">
              <ThemedButton variant="outline" size="sm" asChild className="w-full">
                <Link href={ROUTES.APP_TRADE}>查看更多 →</Link>
              </ThemedButton>
            </div>
          </CollapsibleContent>
        </ThemedCard>
      </Collapsible>

      {/* History & Info - Collapsible */}
      <Collapsible open={openSections.history} onOpenChange={() => toggleSection("history")}>
        <ThemedCard className="p-4 space-y-3">
          <CollapsibleTrigger className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className={cn("w-4 h-4", theme === "cyberpunk" ? "text-cyan-400" : "text-blue-600")} />
              <span className="text-sm font-semibold">历史记录</span>
            </div>
            {openSections.history ? (
              <ChevronUp className="w-4 h-4 opacity-50" />
            ) : (
              <ChevronDown className="w-4 h-4 opacity-50" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2">
            <p className="text-xs opacity-70">操作历史记录将显示在这里</p>
            <ThemedButton variant="outline" size="sm" asChild className="w-full">
              <Link href={ROUTES.APP_RECHARGE}>
                <FileText className="w-3 h-3 mr-2" />
                查看账本
              </Link>
            </ThemedButton>
          </CollapsibleContent>
        </ThemedCard>
      </Collapsible>
    </div>
  );
}

