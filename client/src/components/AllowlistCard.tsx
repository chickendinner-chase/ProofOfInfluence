import { useState, useEffect } from "react";
import { formatUnits } from "viem";
import { useAccount } from "wagmi";
import { ThemedCard, ThemedButton } from "@/components/themed";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAllowlist } from "@/hooks/useAllowlist";
import { Loader2, CheckCircle2, Lock, Users, AlertCircle } from "lucide-react";

export function AllowlistCard() {
  const { theme } = useTheme();
  const { toast } = useToast();
  const { address, isConnected } = useAccount();

  const {
    merkleRoot,
    rootVersion,
    remaining,
    isLoading,
    isConfigured,
  } = useAllowlist();

  const [isVerified, setIsVerified] = useState(false);
  const [checkingVerification, setCheckingVerification] = useState(false);

  // Check verification from backend
  useEffect(() => {
    if (!isConnected || !address || !isConfigured) return;

    const checkVerification = async () => {
      setCheckingVerification(true);
      try {
        // This would typically come from backend API
        // For now, we'll check if remaining > 0 as a proxy for verification
        if (remaining !== null && remaining > 0n) {
          setIsVerified(true);
        }
      } catch (error) {
        console.error("Failed to check verification:", error);
      } finally {
        setCheckingVerification(false);
      }
    };

    checkVerification();
  }, [isConnected, address, isConfigured, remaining]);

  if (!isConfigured) {
    return (
      <ThemedCard className="p-6">
        <Alert>
          <AlertDescription>
            EarlyBirdAllowlist 合约未配置。请检查环境变量。
          </AlertDescription>
        </Alert>
      </ThemedCard>
    );
  }

  if (isLoading || checkingVerification) {
    return (
      <ThemedCard className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="ml-2">加载中...</span>
        </div>
      </ThemedCard>
    );
  }

  const remainingFormatted = remaining !== null ? formatUnits(remaining, 18) : "0";

  return (
    <ThemedCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className={cn(
          "text-xl font-bold",
          theme === "cyberpunk" ? "font-rajdhani text-cyan-200" : "font-poppins text-slate-900"
        )}>
          早鸟白名单
        </h3>
        {rootVersion !== null && (
          <div className={cn(
            "text-sm px-3 py-1 rounded-full",
            theme === "cyberpunk"
              ? "bg-cyan-400/20 text-cyan-300"
              : "bg-blue-100 text-blue-700"
          )}>
            v{rootVersion.toString()}
          </div>
        )}
      </div>

      {merkleRoot && merkleRoot !== "0x0000000000000000000000000000000000000000000000000000000000000000" ? (
        <div className="space-y-4">
          {isVerified || (remaining !== null && remaining > 0n) ? (
            <>
              <div className={cn(
                "p-4 rounded-lg border",
                theme === "cyberpunk"
                  ? "bg-slate-900/60 border-cyan-400/20"
                  : "bg-slate-50 border-slate-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle2 className={cn(
                    "w-8 h-8",
                    theme === "cyberpunk" ? "text-green-400" : "text-green-600"
                  )} />
                  <div>
                    <div className={cn(
                      "text-lg font-bold",
                      theme === "cyberpunk" ? "font-rajdhani" : "font-poppins"
                    )}>
                      您在白名单中
                    </div>
                    <div className="text-sm opacity-70">
                      您有资格参与早鸟计划
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm opacity-70">剩余分配:</span>
                    <span className={cn(
                      "text-lg font-bold",
                      remaining !== null && remaining > 0n
                        ? theme === "cyberpunk" ? "text-cyan-300" : "text-blue-600"
                        : "opacity-50"
                    )}>
                      {remainingFormatted} POI
                    </span>
                  </div>
                  {rootVersion !== null && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="opacity-70">白名单版本:</span>
                      <span className="font-mono">v{rootVersion.toString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {remaining !== null && remaining > 0n && (
                <Alert>
                  <AlertDescription className="text-xs">
                    <Users className="w-4 h-4 inline mr-2" />
                    您可以使用此白名单资格参与 TGE 销售或其他活动
                  </AlertDescription>
                </Alert>
              )}

              {remaining !== null && remaining === 0n && (
                <Alert>
                  <AlertDescription className="text-xs">
                    <CheckCircle2 className="w-4 h-4 inline mr-2" />
                    您的分配额度已全部使用
                  </AlertDescription>
                </Alert>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <Lock className={cn(
                "w-12 h-12 mx-auto mb-4",
                theme === "cyberpunk" ? "text-cyan-400" : "text-slate-400"
              )} />
              <h3 className={cn(
                "text-lg font-bold mb-2",
                theme === "cyberpunk" ? "font-rajdhani" : "font-poppins"
              )}>
                未在白名单中
              </h3>
              <p className="text-sm opacity-70 mb-4">
                {isConnected
                  ? "您当前不在早鸟白名单中"
                  : "请连接钱包以检查白名单状态"}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <AlertCircle className={cn(
            "w-12 h-12 mx-auto mb-4",
            theme === "cyberpunk" ? "text-yellow-400" : "text-yellow-600"
          )} />
          <h3 className={cn(
            "text-lg font-bold mb-2",
            theme === "cyberpunk" ? "font-rajdhani" : "font-poppins"
          )}>
            白名单未设置
          </h3>
          <p className="text-sm opacity-70">
            白名单 Merkle root 尚未配置
          </p>
        </div>
      )}

      {!isConnected && (
        <Alert className="mt-4">
          <AlertDescription>
            请连接钱包以查看您的白名单状态
          </AlertDescription>
        </Alert>
      )}
    </ThemedCard>
  );
}

