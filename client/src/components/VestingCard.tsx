import { useState, useMemo } from "react";
import { formatUnits } from "viem";
import { useAccount } from "wagmi";
import { ThemedCard, ThemedButton } from "@/components/themed";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useVestingVault } from "@/hooks/useVestingVault";
import { Loader2, Lock, Unlock, Calendar, Clock } from "lucide-react";

export function VestingCard() {
  const { theme } = useTheme();
  const { toast } = useToast();
  const { address, isConnected } = useAccount();

  const {
    schedules,
    scheduleData,
    releasableAmounts,
    release,
    isReleasing,
    isLoading,
    isConfigured,
  } = useVestingVault();

  const handleRelease = async (scheduleId: number) => {
    if (!isConnected) {
      toast({
        title: "请先连接钱包",
        description: "需要连接钱包才能释放代币",
        variant: "destructive",
      });
      return;
    }

    try {
      await release(scheduleId);
      toast({
        title: "释放成功",
        description: "代币已成功释放到您的钱包",
      });
    } catch (error: any) {
      toast({
        title: "释放失败",
        description: error?.message ?? "请重试",
        variant: "destructive",
      });
    }
  };

  if (!isConfigured) {
    return (
      <ThemedCard className="p-6">
        <Alert>
          <AlertDescription>
            VestingVault 合约未配置。请检查环境变量。
          </AlertDescription>
        </Alert>
      </ThemedCard>
    );
  }

  if (isLoading) {
    return (
      <ThemedCard className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="ml-2">加载中...</span>
        </div>
      </ThemedCard>
    );
  }

  if (schedules.length === 0) {
    return (
      <ThemedCard className="p-6">
        <div className="text-center py-8">
          <Lock className={cn(
            "w-12 h-12 mx-auto mb-4",
            theme === "cyberpunk" ? "text-cyan-400" : "text-slate-400"
          )} />
          <h3 className={cn(
            "text-lg font-bold mb-2",
            theme === "cyberpunk" ? "font-rajdhani" : "font-poppins"
          )}>
            暂无锁仓计划
          </h3>
          <p className="text-sm opacity-70">
            您目前没有活跃的锁仓计划
          </p>
        </div>
      </ThemedCard>
    );
  }

  return (
    <ThemedCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className={cn(
          "text-xl font-bold",
          theme === "cyberpunk" ? "font-rajdhani text-cyan-200" : "font-poppins text-slate-900"
        )}>
          锁仓计划
        </h3>
        <div className={cn(
          "text-sm px-3 py-1 rounded-full",
          theme === "cyberpunk"
            ? "bg-cyan-400/20 text-cyan-300"
            : "bg-blue-100 text-blue-700"
        )}>
          {schedules.length} 个计划
        </div>
      </div>

      <div className="space-y-4">
        {schedules.map((scheduleId) => {
          const schedule = scheduleData.get(Number(scheduleId));
          const releasable = releasableAmounts.get(Number(scheduleId)) || 0n;
          const scheduleIdNum = Number(scheduleId);

          if (!schedule) {
            return (
              <div key={scheduleIdNum} className="p-4 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">加载计划 {scheduleIdNum}...</span>
                </div>
              </div>
            );
          }

          const totalAmount = formatUnits(schedule.totalAmount, 18);
          const released = formatUnits(schedule.released, 18);
          const releasableFormatted = formatUnits(releasable, 18);
          const remaining = formatUnits(schedule.totalAmount - schedule.released, 18);
          const progress = schedule.totalAmount > 0n
            ? (Number(schedule.released) / Number(schedule.totalAmount)) * 100
            : 0;

          const startDate = new Date(Number(schedule.start) * 1000);
          const endDate = new Date(Number(schedule.start + schedule.duration) * 1000);
          const now = Date.now();
          const isCliffPassed = now >= Number(schedule.start + schedule.cliff) * 1000;
          const isFullyVested = now >= endDate.getTime();

          return (
            <div
              key={scheduleIdNum}
              className={cn(
                "p-4 rounded-lg border",
                theme === "cyberpunk"
                  ? "bg-slate-900/60 border-cyan-400/20"
                  : "bg-slate-50 border-slate-200"
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className={cn(
                      "w-4 h-4",
                      theme === "cyberpunk" ? "text-cyan-400" : "text-blue-600"
                    )} />
                    <span className={cn(
                      "font-semibold",
                      theme === "cyberpunk" ? "font-rajdhani" : "font-poppins"
                    )}>
                      计划 #{scheduleIdNum}
                    </span>
                    {schedule.revoked && (
                      <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400">
                        已撤销
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="opacity-70">总金额:</span>
                      <span className="font-semibold">{totalAmount} POI</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-70">已释放:</span>
                      <span className="font-semibold text-green-500">{released} POI</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-70">可释放:</span>
                      <span className={cn(
                        "font-semibold",
                        releasable > 0n
                          ? theme === "cyberpunk" ? "text-cyan-300" : "text-blue-600"
                          : "opacity-50"
                      )}>
                        {releasableFormatted} POI
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-70">剩余:</span>
                      <span className="font-semibold">{remaining} POI</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="opacity-70">解锁进度</span>
                      <span>{progress.toFixed(1)}%</span>
                    </div>
                    <div className={cn(
                      "w-full h-2 rounded-full overflow-hidden",
                      theme === "cyberpunk" ? "bg-slate-800" : "bg-slate-200"
                    )}>
                      <div
                        className={cn(
                          "h-full transition-all",
                          theme === "cyberpunk"
                            ? "bg-gradient-to-r from-cyan-400 to-blue-500"
                            : "bg-gradient-to-r from-blue-500 to-blue-600"
                        )}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Schedule Info */}
                  <div className="mt-3 pt-3 border-t border-slate-700/50">
                    <div className="flex items-center gap-4 text-xs opacity-70">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          {isCliffPassed ? "Cliff 已过" : `Cliff: ${startDate.toLocaleDateString()}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>结束: {endDate.toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Release Button */}
              {releasable > 0n && !schedule.revoked && (
                <div className="mt-4">
                  <ThemedButton
                    onClick={() => handleRelease(scheduleIdNum)}
                    disabled={isReleasing || !isConnected}
                    className="w-full"
                    emphasis
                  >
                    {isReleasing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        释放中...
                      </>
                    ) : (
                      <>
                        <Unlock className="w-4 h-4 mr-2" />
                        释放 {releasableFormatted} POI
                      </>
                    )}
                  </ThemedButton>
                </div>
              )}

              {releasable === 0n && !isFullyVested && !schedule.revoked && (
                <div className="mt-4">
                  <Alert>
                    <AlertDescription className="text-xs">
                      {isCliffPassed
                        ? "当前没有可释放的代币，请稍后再试"
                        : `Cliff 期未过，解锁开始时间: ${startDate.toLocaleDateString()}`}
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {isFullyVested && releasable === 0n && (
                <div className="mt-4">
                  <Alert>
                    <AlertDescription className="text-xs text-green-500">
                      ✓ 所有代币已完全解锁并释放
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!isConnected && (
        <Alert className="mt-4">
          <AlertDescription>
            请连接钱包以查看和释放您的锁仓代币
          </AlertDescription>
        </Alert>
      )}
    </ThemedCard>
  );
}

