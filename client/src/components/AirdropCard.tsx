import { useState, useEffect } from "react";
import { parseUnits, formatUnits } from "viem";
import { useAccount, useReadContract } from "wagmi";
import { ThemedCard, ThemedButton, ThemedInput } from "@/components/themed";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAirdrop, type AirdropEligibility } from "@/hooks/useAirdrop";
import { MERKLE_AIRDROP_ADDRESS } from "@/lib/baseConfig";
import { Loader2, Gift, CheckCircle2, Lock, AlertCircle } from "lucide-react";

const MERKLE_AIRDROP_ABI = [
  {
    inputs: [
      { internalType: "uint64", name: "roundId", type: "uint64" },
      { internalType: "uint256", name: "index", type: "uint256" },
    ],
    name: "isClaimed",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export function AirdropCard() {
  const { theme } = useTheme();
  const { toast } = useToast();
  const { address, isConnected } = useAccount();

  const {
    currentRound,
    isPaused,
    claim,
    isClaiming,
    isLoading,
    isConfigured,
  } = useAirdrop();

  const [eligibility, setEligibility] = useState<AirdropEligibility | null>(null);
  const [checkingEligibility, setCheckingEligibility] = useState(false);

  // Check if airdrop is already claimed on-chain
  const { data: isClaimedOnChain, refetch: refetchClaimed } = useReadContract({
    address: MERKLE_AIRDROP_ADDRESS,
    abi: MERKLE_AIRDROP_ABI,
    functionName: "isClaimed",
    args: eligibility
      ? [eligibility.roundId, BigInt(eligibility.index)]
      : undefined,
    query: {
      enabled: isConfigured && !!eligibility && !!address,
    },
  });

  // Check eligibility from backend
  useEffect(() => {
    if (!isConnected || !address || !isConfigured) return;

    const checkEligibility = async () => {
      setCheckingEligibility(true);
      try {
        const response = await fetch(`/api/airdrop/check?address=${address}`, {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          if (data.eligible && data.amount && data.index !== undefined) {
            setEligibility({
              index: data.index,
              amount: parseUnits(data.amount, 18),
              proof: data.proof || [],
              roundId: currentRound || 0n,
            });
          }
        }
      } catch (error) {
        console.error("Failed to check eligibility:", error);
      } finally {
        setCheckingEligibility(false);
      }
    };

    checkEligibility();
  }, [isConnected, address, isConfigured, currentRound]);

  const handleClaim = async () => {
    if (!isConnected) {
      toast({
        title: "请先连接钱包",
        description: "需要连接钱包才能领取空投",
        variant: "destructive",
      });
      return;
    }

    if (!eligibility) {
      toast({
        title: "无空投资格",
        description: "您当前没有可领取的空投",
        variant: "destructive",
      });
      return;
    }

    try {
      await claim(eligibility);
      toast({
        title: "领取成功",
        description: `${formatUnits(eligibility.amount, 18)} POI 已成功领取`,
      });
      // Refetch claim status after successful claim
      setTimeout(() => {
        refetchClaimed();
      }, 2000);
      setEligibility(null); // Clear after successful claim
    } catch (error: any) {
      toast({
        title: "领取失败",
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
            MerkleAirdropDistributor 合约未配置。请检查环境变量。
          </AlertDescription>
        </Alert>
      </ThemedCard>
    );
  }

  if (isLoading || checkingEligibility) {
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
          空投领取
        </h3>
        {currentRound !== null && (
          <div className={cn(
            "text-sm px-3 py-1 rounded-full",
            theme === "cyberpunk"
              ? "bg-cyan-400/20 text-cyan-300"
              : "bg-blue-100 text-blue-700"
          )}>
            Round {currentRound.toString()}
          </div>
        )}
      </div>

      {isPaused && (
        <Alert className="mb-4" variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>
            空投领取已暂停
          </AlertDescription>
        </Alert>
      )}

      {eligibility ? (
        <div className="space-y-4">
          {isClaimedOnChain && (
            <Alert className="mb-4">
              <CheckCircle2 className="w-4 h-4" />
              <AlertDescription>
                此空投已领取
              </AlertDescription>
            </Alert>
          )}
          <div className={cn(
            "p-4 rounded-lg border",
            theme === "cyberpunk"
              ? "bg-slate-900/60 border-cyan-400/20"
              : "bg-slate-50 border-slate-200"
          )}>
            <div className="flex items-center gap-3 mb-3">
              {isClaimedOnChain ? (
                <CheckCircle2 className={cn(
                  "w-8 h-8",
                  theme === "cyberpunk" ? "text-green-400" : "text-green-600"
                )} />
              ) : (
                <Gift className={cn(
                  "w-8 h-8",
                  theme === "cyberpunk" ? "text-cyan-400" : "text-blue-600"
                )} />
              )}
              <div>
                <div className={cn(
                  "text-lg font-bold",
                  theme === "cyberpunk" ? "font-rajdhani" : "font-poppins"
                )}>
                  {isClaimedOnChain ? "已领取空投" : "可领取空投"}
                </div>
                <div className="text-sm opacity-70">
                  {isClaimedOnChain
                    ? "此空投已在链上确认领取"
                    : "您有资格领取空投"}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm opacity-70">空投金额:</span>
                <span className={cn(
                  "text-lg font-bold",
                  theme === "cyberpunk" ? "text-cyan-300" : "text-blue-600"
                )}>
                  {formatUnits(eligibility.amount, 18)} POI
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="opacity-70">索引:</span>
                <span className="font-mono">{eligibility.index}</span>
              </div>
            </div>
          </div>

          <ThemedButton
            onClick={handleClaim}
            disabled={isClaiming || isPaused || !isConnected || isClaimedOnChain}
            className="w-full"
            emphasis
          >
            {isClaiming ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                领取中...
              </>
            ) : isClaimedOnChain ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                已领取
              </>
            ) : (
              <>
                <Gift className="w-4 h-4 mr-2" />
                领取空投
              </>
            )}
          </ThemedButton>
        </div>
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
            暂无空投
          </h3>
          <p className="text-sm opacity-70 mb-4">
            {isConnected
              ? "您当前没有可领取的空投，请稍后再试"
              : "请连接钱包以检查空投资格"}
          </p>
          {!isConnected && (
            <Alert>
              <AlertDescription>
                连接钱包以检查您的空投资格
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {currentRound !== null && (
        <div className="mt-4 pt-4 border-t border-slate-700/50">
          <div className="text-xs opacity-70 text-center">
            当前空投轮次: Round {currentRound.toString()}
          </div>
        </div>
      )}
    </ThemedCard>
  );
}

