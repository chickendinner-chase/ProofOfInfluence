import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { ThemedCard, ThemedButton } from "@/components/themed";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { useBadge } from "@/hooks/useBadge";
import { Loader2, Award, Trophy, AlertCircle } from "lucide-react";

export function BadgeCard() {
  const { theme } = useTheme();
  const { address, isConnected } = useAccount();

  const {
    balance,
    badges,
    isLoading,
    isConfigured,
    refetch,
  } = useBadge();

  const [tokenIds, setTokenIds] = useState<bigint[]>([]);

  // Fetch token IDs from backend or events
  useEffect(() => {
    if (!isConnected || !address || !isConfigured || !balance || balance === 0n) return;

    // TODO: Fetch token IDs from backend API or events
    // For now, we'll just show the balance
    const fetchTokenIds = async () => {
      try {
        const response = await fetch(`/api/badges/tokens?address=${address}`, {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          if (data.tokenIds && Array.isArray(data.tokenIds)) {
            setTokenIds(data.tokenIds.map((id: string) => BigInt(id)));
          }
        }
      } catch (error) {
        console.error("Failed to fetch badge token IDs:", error);
      }
    };

    fetchTokenIds();
  }, [isConnected, address, isConfigured, balance]);

  if (!isConfigured) {
    return (
      <ThemedCard className="p-6">
        <Alert>
          <AlertDescription>
            AchievementBadges 合约未配置。请检查环境变量。
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

  return (
    <ThemedCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className={cn(
          "text-xl font-bold",
          theme === "cyberpunk" ? "font-rajdhani text-cyan-200" : "font-poppins text-slate-900"
        )}>
          成就徽章
        </h3>
        <div className={cn(
          "text-sm px-3 py-1 rounded-full",
          theme === "cyberpunk"
            ? "bg-purple-400/20 text-purple-300"
            : "bg-purple-100 text-purple-700"
        )}>
          {balance?.toString() || "0"} 个徽章
        </div>
      </div>

      {!isConnected ? (
        <div className="text-center py-8">
          <Trophy className={cn(
            "w-12 h-12 mx-auto mb-4",
            theme === "cyberpunk" ? "text-purple-400" : "text-slate-400"
          )} />
          <p className="text-sm opacity-70 mb-4">
            请连接钱包以查看您的成就徽章
          </p>
        </div>
      ) : balance === null || balance === 0n ? (
        <div className="text-center py-8">
          <Award className={cn(
            "w-12 h-12 mx-auto mb-4",
            theme === "cyberpunk" ? "text-purple-400" : "text-slate-400"
          )} />
          <h3 className={cn(
            "text-lg font-bold mb-2",
            theme === "cyberpunk" ? "font-rajdhani" : "font-poppins"
          )}>
            还没有徽章
          </h3>
          <p className="text-sm opacity-70 mb-4">
            完成成就任务以获得徽章奖励
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Badge count display */}
          <div className={cn(
            "p-4 rounded-lg border text-center",
            theme === "cyberpunk"
              ? "bg-slate-900/60 border-purple-400/20"
              : "bg-slate-50 border-slate-200"
          )}>
            <Trophy className={cn(
              "w-8 h-8 mx-auto mb-2",
              theme === "cyberpunk" ? "text-purple-400" : "text-purple-600"
            )} />
            <div className="text-sm opacity-70 mb-1">总徽章数</div>
            <div className={cn(
              "text-2xl font-bold",
              theme === "cyberpunk" ? "text-purple-300" : "text-purple-600"
            )}>
              {balance?.toString() || "0"}
            </div>
          </div>

          {/* Badge list placeholder */}
          {badges.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {badges.map((badge) => (
                <div
                  key={badge.tokenId.toString()}
                  className={cn(
                    "p-3 rounded-lg border",
                    theme === "cyberpunk"
                      ? "bg-slate-900/60 border-purple-400/20"
                      : "bg-slate-50 border-slate-200"
                  )}
                >
                  <Award className={cn(
                    "w-6 h-6 mb-2",
                    theme === "cyberpunk" ? "text-purple-400" : "text-purple-600"
                  )} />
                  <div className="text-sm font-medium">
                    徽章 #{badge.tokenId.toString()}
                  </div>
                  <div className="text-xs opacity-70">
                    类型: {badge.badgeType.toString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm opacity-70">
                徽章详情加载中...
              </p>
              <p className="text-xs opacity-50 mt-2">
                提示: 完整徽章列表需要从后端或事件索引获取
              </p>
            </div>
          )}

          <ThemedButton
            onClick={() => refetch()}
            variant="outline"
            className="w-full"
          >
            刷新
          </ThemedButton>
        </div>
      )}
    </ThemedCard>
  );
}

