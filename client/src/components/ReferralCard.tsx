import { useState } from "react";
import { useAccount } from "wagmi";
import { ThemedCard, ThemedButton, ThemedInput } from "@/components/themed";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useReferral } from "@/hooks/useReferral";
import { Loader2, Users, Gift, UserPlus, CheckCircle2, AlertCircle } from "lucide-react";

export function ReferralCard() {
  const { theme } = useTheme();
  const { toast } = useToast();
  const { address, isConnected } = useAccount();

  const {
    referral,
    hasReferral,
    referralCount,
    totalRewardsEarned,
    formattedRewards,
    selfRegister,
    isRegistering,
    isLoading,
    isConfigured,
  } = useReferral();

  const [inviterAddress, setInviterAddress] = useState("");
  const [referralCode, setReferralCode] = useState("");

  const handleSelfRegister = async () => {
    if (!isConnected) {
      toast({
        title: "请先连接钱包",
        description: "需要连接钱包才能注册推荐关系",
        variant: "destructive",
      });
      return;
    }

    if (!inviterAddress || !/^0x[a-fA-F0-9]{40}$/.test(inviterAddress)) {
      toast({
        title: "无效的推荐人地址",
        description: "请输入有效的以太坊地址",
        variant: "destructive",
      });
      return;
    }

    try {
      await selfRegister(inviterAddress as `0x${string}`, referralCode || "");
      toast({
        title: "注册成功",
        description: "推荐关系已成功注册",
      });
      setInviterAddress("");
      setReferralCode("");
    } catch (error: any) {
      toast({
        title: "注册失败",
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
            ReferralRegistry 合约未配置。请检查环境变量。
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
          推荐系统
        </h3>
        <div className={cn(
          "text-sm px-3 py-1 rounded-full",
          theme === "cyberpunk"
            ? "bg-cyan-400/20 text-cyan-300"
            : "bg-blue-100 text-blue-700"
        )}>
          {referralCount?.toString() || "0"} 推荐
        </div>
      </div>

      {hasReferral && referral ? (
        <div className="space-y-4">
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
                  已注册推荐关系
                </div>
                <div className="text-sm opacity-70">
                  您的推荐人
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm opacity-70">推荐人地址:</span>
                <span className="font-mono text-xs break-all">{referral.inviter}</span>
              </div>
              {referral.timestamp > 0n && (
                <div className="flex justify-between items-center text-sm">
                  <span className="opacity-70">注册时间:</span>
                  <span>{new Date(Number(referral.timestamp) * 1000).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className={cn(
              "p-4 rounded-lg border text-center",
              theme === "cyberpunk"
                ? "bg-slate-900/60 border-cyan-400/20"
                : "bg-slate-50 border-slate-200"
            )}>
              <Users className={cn(
                "w-6 h-6 mx-auto mb-2",
                theme === "cyberpunk" ? "text-cyan-400" : "text-blue-600"
              )} />
              <div className="text-sm opacity-70 mb-1">推荐人数</div>
              <div className={cn(
                "text-lg font-bold",
                theme === "cyberpunk" ? "text-cyan-300" : "text-blue-600"
              )}>
                {referralCount?.toString() || "0"}
              </div>
            </div>

            <div className={cn(
              "p-4 rounded-lg border text-center",
              theme === "cyberpunk"
                ? "bg-slate-900/60 border-cyan-400/20"
                : "bg-slate-50 border-slate-200"
            )}>
              <Gift className={cn(
                "w-6 h-6 mx-auto mb-2",
                theme === "cyberpunk" ? "text-green-400" : "text-green-600"
              )} />
              <div className="text-sm opacity-70 mb-1">总奖励</div>
              <div className={cn(
                "text-lg font-bold",
                theme === "cyberpunk" ? "text-green-300" : "text-green-600"
              )}>
                {formattedRewards} POI
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-center py-4">
            <UserPlus className={cn(
              "w-12 h-12 mx-auto mb-4",
              theme === "cyberpunk" ? "text-cyan-400" : "text-slate-400"
            )} />
            <h3 className={cn(
              "text-lg font-bold mb-2",
              theme === "cyberpunk" ? "font-rajdhani" : "font-poppins"
            )}>
              注册推荐关系
            </h3>
            <p className="text-sm opacity-70 mb-4">
              输入推荐人地址以建立推荐关系
            </p>
          </div>

          <div className="space-y-3">
            <ThemedInput
              label="推荐人地址"
              placeholder="0x..."
              value={inviterAddress}
              onChange={(e) => setInviterAddress(e.target.value)}
              helperText="输入推荐您的钱包地址"
            />

            <ThemedInput
              label="推荐码（可选）"
              placeholder="REF123"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              helperText="可选的推荐码"
            />

            <ThemedButton
              onClick={handleSelfRegister}
              disabled={isRegistering || !isConnected || !inviterAddress}
              className="w-full"
              emphasis
            >
              {isRegistering ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  注册中...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  注册推荐关系
                </>
              )}
            </ThemedButton>
          </div>

          {!isConnected && (
            <Alert>
              <AlertDescription>
                请连接钱包以注册推荐关系
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </ThemedCard>
  );
}

