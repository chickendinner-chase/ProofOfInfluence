import { useState, useMemo } from "react";
import { parseUnits, formatUnits } from "viem";
import { useAccount } from "wagmi";
import { ThemedCard, ThemedButton, ThemedInput } from "@/components/themed";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useStakingRewards } from "@/hooks/useStakingRewards";
import { usePoiToken } from "@/hooks/usePoiToken";
import { ERC20_ABI, POI_TOKEN_ADDRESS, STAKING_REWARDS_ADDRESS, BASE_CHAIN_ID } from "@/lib/baseConfig";
import { useReadContract, useWriteContract, usePublicClient } from "wagmi";
import { Loader2, TrendingUp, Wallet, Award, ArrowUpRight } from "lucide-react";

const POI_UNIT = 18;
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export function StakingCard() {
  const { theme } = useTheme();
  const { toast } = useToast();
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient({ chainId: BASE_CHAIN_ID });
  const { writeContractAsync } = useWriteContract();

  const [stakeAmount, setStakeAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isApproving, setIsApproving] = useState(false);

  const { balance: poiBalance, formattedBalance: poiFormatted, isLoading: poiLoading } = usePoiToken();
  const {
    stakedBalance,
    earned,
    formattedStaked,
    formattedEarned,
    rewardRate,
    periodFinish,
    stake,
    withdraw,
    claimReward,
    exit,
    isStaking,
    isWithdrawing,
    isClaiming,
    refetch,
    isConfigured,
  } = useStakingRewards();

  // Check allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: POI_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: [address!, STAKING_REWARDS_ADDRESS],
    query: { enabled: Boolean(address) && POI_TOKEN_ADDRESS !== ZERO_ADDRESS },
  });

  const parsedStakeAmount = useMemo(() => {
    if (!stakeAmount) return null;
    try {
      return parseUnits(stakeAmount, POI_UNIT);
    } catch {
      return null;
    }
  }, [stakeAmount]);

  const parsedWithdrawAmount = useMemo(() => {
    if (!withdrawAmount) return null;
    try {
      return parseUnits(withdrawAmount, POI_UNIT);
    } catch {
      return null;
    }
  }, [withdrawAmount]);

  const needsApproval = useMemo(() => {
    if (!parsedStakeAmount || parsedStakeAmount === 0n) return false;
    return !allowance || allowance < parsedStakeAmount;
  }, [allowance, parsedStakeAmount]);

  const handleApprove = async () => {
    if (!parsedStakeAmount || !isConnected) return;
    setIsApproving(true);
    try {
      const hash = await writeContractAsync({
        address: POI_TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [STAKING_REWARDS_ADDRESS, parsedStakeAmount],
      });
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash });
      }
      await refetchAllowance();
      toast({
        title: "授权成功",
        description: "POI 授权完成，可以进行质押。",
      });
    } catch (error: any) {
      toast({
        title: "授权失败",
        description: error?.message ?? "请重试。",
        variant: "destructive",
      });
    } finally {
      setIsApproving(false);
    }
  };

  const handleStake = async () => {
    if (!stakeAmount) return;
    try {
      const hash = await stake(stakeAmount);
      setStakeAmount("");
      await refetch();
      toast({
        title: "质押成功",
        description: `成功质押 ${stakeAmount} POI`,
      });
    } catch (error: any) {
      toast({
        title: "质押失败",
        description: error?.message ?? "请重试。",
        variant: "destructive",
      });
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount) return;
    try {
      const hash = await withdraw(withdrawAmount);
      setWithdrawAmount("");
      await refetch();
      toast({
        title: "提取成功",
        description: `成功提取 ${withdrawAmount} POI`,
      });
    } catch (error: any) {
      toast({
        title: "提取失败",
        description: error?.message ?? "请重试。",
        variant: "destructive",
      });
    }
  };

  const handleClaimReward = async () => {
    try {
      const hash = await claimReward();
      await refetch();
      toast({
        title: "领取成功",
        description: `成功领取 ${formattedEarned} POI 奖励`,
      });
    } catch (error: any) {
      toast({
        title: "领取失败",
        description: error?.message ?? "请重试。",
        variant: "destructive",
      });
    }
  };

  const handleExit = async () => {
    try {
      const hash = await exit();
      setWithdrawAmount("");
      await refetch();
      toast({
        title: "退出成功",
        description: "已提取所有质押并领取奖励",
      });
    } catch (error: any) {
      toast({
        title: "退出失败",
        description: error?.message ?? "请重试。",
        variant: "destructive",
      });
    }
  };

  if (!isConfigured) {
    return (
      <ThemedCard className="p-6">
        <Alert>
          <AlertDescription>
            质押合约未配置，请检查环境变量 VITE_STAKING_REWARDS_ADDRESS
          </AlertDescription>
        </Alert>
      </ThemedCard>
    );
  }

  if (!isConnected) {
    return (
      <ThemedCard className="p-6">
        <Alert>
          <AlertDescription>请先连接钱包</AlertDescription>
        </Alert>
      </ThemedCard>
    );
  }

  const stakeErrors: string[] = [];
  if (parsedStakeAmount && parsedStakeAmount > poiBalance) {
    stakeErrors.push("POI 余额不足");
  }
  if (parsedStakeAmount && parsedStakeAmount === 0n) {
    stakeErrors.push("质押金额必须大于 0");
  }

  const withdrawErrors: string[] = [];
  if (parsedWithdrawAmount && parsedWithdrawAmount > stakedBalance) {
    withdrawErrors.push("提取金额超过质押余额");
  }

  return (
    <ThemedCard className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className={cn(
          "text-xl font-bold",
          theme === 'cyberpunk' ? 'font-orbitron text-cyan-300' : 'font-poppins text-blue-600'
        )}>
          POI 质押奖励
        </h2>
        <TrendingUp className={cn(
          "w-5 h-5",
          theme === 'cyberpunk' ? 'text-cyan-400' : 'text-blue-500'
        )} />
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-1">
          <div className="text-sm opacity-70">POI 余额</div>
          <div className={cn(
            "text-2xl font-bold",
            theme === 'cyberpunk' ? 'font-orbitron text-cyan-300' : 'font-poppins text-blue-600'
          )}>
            {poiLoading ? "..." : poiFormatted}
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-sm opacity-70">已质押</div>
          <div className={cn(
            "text-2xl font-bold",
            theme === 'cyberpunk' ? 'font-orbitron text-cyan-300' : 'font-poppins text-blue-600'
          )}>
            {formattedStaked}
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-sm opacity-70">可领取奖励</div>
          <div className={cn(
            "text-2xl font-bold flex items-center gap-2",
            theme === 'cyberpunk' ? 'font-orbitron text-green-400' : 'font-poppins text-green-600'
          )}>
            <Award className="w-5 h-5" />
            {formattedEarned}
          </div>
        </div>
      </div>

      {/* Stake Section */}
      <div className="space-y-3 border-t pt-4">
        <h3 className={cn(
          "font-semibold",
          theme === 'cyberpunk' ? 'text-cyan-200' : 'text-slate-700'
        )}>
          质押 POI
        </h3>
        <div className="flex gap-2">
          <ThemedInput
            type="number"
            placeholder="输入质押数量"
            value={stakeAmount}
            onChange={(e) => setStakeAmount(e.target.value)}
            className="flex-1"
          />
          <ThemedButton
            onClick={() => setStakeAmount(poiFormatted.replace(/,/g, ""))}
            variant="outline"
            size="sm"
          >
            全部
          </ThemedButton>
        </div>
        {stakeErrors.length > 0 && (
          <Alert variant="destructive">
            <AlertDescription>{stakeErrors.join(", ")}</AlertDescription>
          </Alert>
        )}
        <div className="flex gap-2">
          {needsApproval ? (
            <ThemedButton
              onClick={handleApprove}
              disabled={!parsedStakeAmount || isApproving || stakeErrors.length > 0}
              className="flex-1"
            >
              {isApproving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  授权中...
                </>
              ) : (
                "授权 POI"
              )}
            </ThemedButton>
          ) : (
            <ThemedButton
              onClick={handleStake}
              disabled={!parsedStakeAmount || isStaking || stakeErrors.length > 0}
              className="flex-1"
            >
              {isStaking ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  质押中...
                </>
              ) : (
                "质押"
              )}
            </ThemedButton>
          )}
        </div>
      </div>

      {/* Withdraw Section */}
      <div className="space-y-3 border-t pt-4">
        <h3 className={cn(
          "font-semibold",
          theme === 'cyberpunk' ? 'text-cyan-200' : 'text-slate-700'
        )}>
          提取质押
        </h3>
        <div className="flex gap-2">
          <ThemedInput
            type="number"
            placeholder="输入提取数量"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            className="flex-1"
          />
          <ThemedButton
            onClick={() => setWithdrawAmount(formattedStaked.replace(/,/g, ""))}
            variant="outline"
            size="sm"
          >
            全部
          </ThemedButton>
        </div>
        {withdrawErrors.length > 0 && (
          <Alert variant="destructive">
            <AlertDescription>{withdrawErrors.join(", ")}</AlertDescription>
          </Alert>
        )}
        <ThemedButton
          onClick={handleWithdraw}
          disabled={!parsedWithdrawAmount || isWithdrawing || withdrawErrors.length > 0}
          variant="outline"
          className="w-full"
        >
          {isWithdrawing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              提取中...
            </>
          ) : (
            "提取"
          )}
        </ThemedButton>
      </div>

      {/* Actions */}
      <div className="space-y-2 border-t pt-4">
        {earned > 0n && (
          <ThemedButton
            onClick={handleClaimReward}
            disabled={isClaiming}
            className="w-full"
            variant="default"
          >
            {isClaiming ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                领取中...
              </>
            ) : (
              <>
                <Award className="w-4 h-4 mr-2" />
                领取奖励 ({formattedEarned} POI)
              </>
            )}
          </ThemedButton>
        )}
        {stakedBalance > 0n && (
          <ThemedButton
            onClick={handleExit}
            disabled={isWithdrawing}
            variant="outline"
            className="w-full"
          >
            {isWithdrawing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                退出中...
              </>
            ) : (
              <>
                <ArrowUpRight className="w-4 h-4 mr-2" />
                退出（提取全部 + 领取奖励）
              </>
            )}
          </ThemedButton>
        )}
      </div>
    </ThemedCard>
  );
}

