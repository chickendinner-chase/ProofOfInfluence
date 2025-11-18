import { useEffect, useMemo, useState } from "react";
import { parseUnits, formatUnits, maxUint256 } from "viem";
import { useAccount, useBalance, usePublicClient, useReadContract, useWriteContract } from "wagmi";
import { base } from "wagmi/chains";
import { ArrowDownUp, Loader2, AlertCircle, ExternalLink, RefreshCw } from "lucide-react";
import { useAppKit } from "@reown/appkit/react";
import { ThemedCard, ThemedButton } from "@/components/themed";
import { Input } from "./ui/input";
import { Alert, AlertDescription } from "./ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import {
  BASESWAP_ROUTER_ADDRESS,
  ERC20_ABI,
  UNISWAP_V2_ROUTER_ABI,
  USDC_ADDRESS,
  USDC_DECIMALS,
  WETH_ADDRESS,
} from "@/lib/baseConfig";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const SLIPPAGE_BPS = 100; // 1%

export default function CompactSwapCard() {
  const { toast } = useToast();
  const { theme } = useTheme();
  const { open } = useAppKit();
  const { address, isConnected, chain } = useAccount();
  const publicClient = usePublicClient({ chainId: base.id });
  const { writeContractAsync } = useWriteContract();

  const [fromToken, setFromToken] = useState<"ETH" | "USDC">("ETH");
  const toToken = fromToken === "ETH" ? "USDC" : "ETH";
  const [amountIn, setAmountIn] = useState("");
  const [amountOut, setAmountOut] = useState("");
  const [isSwapping, setIsSwapping] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  const isCorrectNetwork = chain?.id === base.id;

  const {
    data: ethBalance,
    refetch: refetchEthBalance,
  } = useBalance({
    address,
    chainId: base.id,
  });

  const {
    data: usdcBalance,
    refetch: refetchUsdcBalance,
  } = useBalance({
    address,
    chainId: base.id,
    token: USDC_ADDRESS,
  });

  const amountInWei = useMemo(() => {
    if (!amountIn) return null;
    try {
      return parseUnits(amountIn, fromToken === "ETH" ? 18 : USDC_DECIMALS);
    } catch {
      return null;
    }
  }, [amountIn, fromToken]);

  const swapPath = useMemo(
    () =>
      fromToken === "ETH"
        ? [WETH_ADDRESS, USDC_ADDRESS] as const
        : [USDC_ADDRESS, WETH_ADDRESS] as const,
    [fromToken]
  );

  const {
    data: allowance,
    refetch: refetchAllowance,
  } = useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: [address ?? ZERO_ADDRESS, BASESWAP_ROUTER_ADDRESS],
    query: {
      enabled: Boolean(address),
    },
  });

  const {
    data: quoteData,
    refetch: refetchQuote,
    isFetching: isFetchingQuote,
  } = useReadContract({
    address: BASESWAP_ROUTER_ADDRESS,
    abi: UNISWAP_V2_ROUTER_ABI,
    functionName: "getAmountsOut",
    args: [amountInWei ?? 0n, swapPath],
    query: {
      enabled: false,
    },
  });

  const amountOutWei = quoteData?.[1];
  const amountOutMin = amountOutWei ? (amountOutWei * (10000n - BigInt(SLIPPAGE_BPS))) / 10000n : undefined;

  const needsApproval =
    fromToken === "USDC" && !!amountInWei && (!allowance || allowance < amountInWei);

  useEffect(() => {
    if (!amountInWei || amountInWei <= 0n) {
      setAmountOut("");
      setQuoteError(null);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const result = await refetchQuote();
        if (cancelled) return;
        const output = result.data?.[1];
        if (!output) {
          setAmountOut("");
          return;
        }
        const formatted = formatUnits(output, toToken === "ETH" ? 18 : USDC_DECIMALS);
        setAmountOut(formatDisplayAmount(formatted, toToken));
        setQuoteError(null);
      } catch (error: any) {
        if (!cancelled) {
          setQuoteError(error?.message || "无法获取价格");
          setAmountOut("");
        }
      }
    }, 500);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [amountInWei, toToken, refetchQuote]);

  useEffect(() => {
    if (fromToken === "USDC" && address) {
      refetchAllowance();
    }
  }, [fromToken, address, refetchAllowance]);

  const handleApprove = async () => {
    if (!address) {
      toast({ title: "请先连接钱包", variant: "destructive" });
      return;
    }

    setIsApproving(true);
    try {
      const hash = await writeContractAsync({
        address: USDC_ADDRESS,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [BASESWAP_ROUTER_ADDRESS, maxUint256],
      });
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash });
      }
      await refetchAllowance();
      toast({ title: "授权成功", description: "USDC 授权已完成" });
    } catch (error: any) {
      toast({
        title: "授权失败",
        description: error?.shortMessage || error?.message || "请重试",
        variant: "destructive",
      });
    } finally {
      setIsApproving(false);
    }
  };

  const handleSwap = async () => {
    if (!address || !amountInWei || !amountOutMin) return;

    if (!isCorrectNetwork) {
      open?.({ view: "Networks" });
      return;
    }

    const deadline = BigInt(Math.floor(Date.now() / 1000) + 20 * 60);
    setIsSwapping(true);

    try {
      const functionName = fromToken === "ETH" ? "swapExactETHForTokens" : "swapExactTokensForETH";
      const args =
        fromToken === "ETH"
          ? [amountOutMin, swapPath, address, deadline]
          : [amountInWei, amountOutMin, swapPath, address, deadline];

      const txHash = await writeContractAsync({
        address: BASESWAP_ROUTER_ADDRESS,
        abi: UNISWAP_V2_ROUTER_ABI,
        functionName,
        args,
        value: fromToken === "ETH" ? amountInWei : undefined,
      });

      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash: txHash });
      }

      await Promise.all([refetchEthBalance(), refetchUsdcBalance()]);
      setAmountIn("");
      setAmountOut("");
      toast({ title: "兑换成功", description: "交易已在链上确认" });
    } catch (error: any) {
      toast({
        title: "兑换失败",
        description: error?.shortMessage || error?.message || "请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsSwapping(false);
    }
  };

  const insufficientBalance = useMemo(() => {
    if (!amountInWei || amountInWei <= 0n) return false;
    const balance = fromToken === "ETH" ? ethBalance?.value : usdcBalance?.value;
    if (!balance) return false;
    return balance < amountInWei;
  }, [amountInWei, fromToken, ethBalance, usdcBalance]);

  const buttonLabel = (() => {
    if (!isConnected) return "连接钱包以交易";
    if (!isCorrectNetwork) return "请切换到 Base 网络";
    if (!amountIn || !amountInWei) return "输入金额";
    if (insufficientBalance) return `余额不足`;
    if (needsApproval) return isApproving ? "授权中..." : "授权 USDC";
    if (isSwapping) return "交易中...";
    if (!amountOutWei || isFetchingQuote) return "获取报价中...";
    return "兑换";
  })();

  const actionDisabled = (() => {
    if (!isConnected) return false;
    if (!isCorrectNetwork) return false;
    if (!amountIn || !amountInWei) return true;
    if (insufficientBalance) return true;
    if (needsApproval) return isApproving;
    return isSwapping || !amountOutWei || isFetchingQuote;
  })();

  const handlePrimaryAction = () => {
    if (!isConnected) {
      open?.();
      return;
    }
    if (!isCorrectNetwork) {
      open?.({ view: "Networks" });
      return;
    }
    if (needsApproval) {
      handleApprove();
      return;
    }
    handleSwap();
  };

  const switchTokens = () => {
    setFromToken((prev) => (prev === "ETH" ? "USDC" : "ETH"));
    setAmountIn("");
    setAmountOut("");
    setQuoteError(null);
  };

  const setMaxAmount = () => {
    if (!address || !isCorrectNetwork) return;
    const balance = fromToken === "ETH" ? ethBalance : usdcBalance;
    if (balance) {
      setAmountIn(formatDisplayAmount(balance.formatted, fromToken));
    }
  };

  const fromBalanceFormatted = fromToken === "ETH"
    ? (ethBalance ? parseFloat(ethBalance.formatted).toFixed(6) : "0.0")
    : (usdcBalance ? parseFloat(usdcBalance.formatted).toFixed(2) : "0.0");

  const exchangeRate = useMemo(() => {
    if (!amountIn || !amountOut || parseFloat(amountIn) <= 0 || parseFloat(amountOut) <= 0) return null;
    return parseFloat(amountOut) / parseFloat(amountIn);
  }, [amountIn, amountOut]);

  const priceImpact = useMemo(() => {
    // Simple price impact calculation (can be improved with actual pool reserves)
    if (!exchangeRate) return "0";
    // Assuming ETH/USDC rate is around 2500
    const expectedRate = fromToken === "ETH" ? 2500 : 1 / 2500;
    const impact = Math.abs((exchangeRate - expectedRate) / expectedRate * 100);
    return impact.toFixed(2);
  }, [exchangeRate, fromToken]);

  return (
    <ThemedCard className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className={cn(
          "text-xl font-semibold",
          theme === 'cyberpunk' ? 'text-cyan-100' : 'text-slate-900'
        )}>
          兑换
        </h2>
        <ThemedButton
          variant="ghost"
          size="sm"
          onClick={() => {
            refetchEthBalance();
            refetchUsdcBalance();
          }}
          disabled={!address || !isCorrectNetwork}
        >
          <RefreshCw className="w-4 h-4" />
        </ThemedButton>
      </div>

      {!isConnected && (
        <Alert className={cn(
          "mb-4",
          theme === 'cyberpunk' 
            ? 'bg-slate-900/50 border-slate-700' 
            : 'bg-slate-50 border-slate-200'
        )}>
          <AlertCircle className={cn(
            "h-4 w-4",
            theme === 'cyberpunk' ? 'text-slate-400' : 'text-slate-600'
          )} />
          <AlertDescription className={cn(
            theme === 'cyberpunk' ? 'text-slate-300' : 'text-slate-700'
          )}>
            请先连接钱包以开始交易
          </AlertDescription>
        </Alert>
      )}

      {isConnected && !isCorrectNetwork && (
        <Alert className={cn(
          "mb-4",
          theme === 'cyberpunk' 
            ? 'bg-yellow-900/20 border-yellow-700' 
            : 'bg-yellow-50 border-yellow-200'
        )}>
          <AlertCircle className={cn(
            "h-4 w-4",
            theme === 'cyberpunk' ? 'text-yellow-500' : 'text-yellow-600'
          )} />
          <AlertDescription className={cn(
            "flex items-center justify-between",
            theme === 'cyberpunk' ? 'text-yellow-200' : 'text-yellow-800'
          )}>
            <span>请切换到 Base 网络</span>
            <ThemedButton size="sm" onClick={() => open?.({ view: "Networks" })} className="ml-2">
              切换网络
            </ThemedButton>
          </AlertDescription>
        </Alert>
      )}

      {/* From Token */}
      <div className="space-y-2 mb-2">
        <div className="flex justify-between text-sm">
          <label className={cn(
            theme === 'cyberpunk' ? 'text-slate-400' : 'text-slate-600'
          )}>
            卖出
          </label>
          {address && isCorrectNetwork && (
            <button
              onClick={setMaxAmount}
              className={cn(
                "transition-colors text-xs",
                theme === 'cyberpunk' 
                  ? 'text-slate-500 hover:text-slate-300' 
                  : 'text-slate-500 hover:text-slate-700'
              )}
            >
              余额: {fromBalanceFormatted} {fromToken}
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="0.0"
            value={amountIn}
            onChange={(e) => setAmountIn(e.target.value)}
            className={cn(
              "text-lg h-14 flex-1",
              theme === 'cyberpunk'
                ? 'bg-slate-900 border-slate-700 text-white'
                : 'bg-white border-slate-300 text-slate-900'
            )}
            disabled={!address || !isCorrectNetwork}
          />
          <ThemedButton
            variant="outline"
            className="min-w-[100px] h-14 text-lg"
            disabled
          >
            {fromToken}
          </ThemedButton>
        </div>
      </div>

      {/* Switch Button */}
      <div className="flex justify-center my-3">
        <ThemedButton
          variant="ghost"
          size="icon"
          onClick={switchTokens}
          className="rounded-full h-10 w-10"
          disabled={!address || !isCorrectNetwork}
        >
          <ArrowDownUp className="w-5 h-5" />
        </ThemedButton>
      </div>

      {/* To Token */}
      <div className="space-y-2 mb-6">
        <label className={cn(
          "text-sm",
          theme === 'cyberpunk' ? 'text-slate-400' : 'text-slate-600'
        )}>
          买入
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type="number"
              placeholder="0.0"
              value={amountOut || ""}
              readOnly
              className={cn(
                "text-lg h-14",
                theme === 'cyberpunk'
                  ? 'bg-slate-900 border-slate-700 text-white'
                  : 'bg-slate-50 border-slate-300 text-slate-900'
              )}
            />
            {isFetchingQuote && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className={cn(
                  "w-4 h-4 animate-spin",
                  theme === 'cyberpunk' ? 'text-slate-400' : 'text-slate-500'
                )} />
              </div>
            )}
          </div>
          <ThemedButton
            variant="outline"
            className="min-w-[100px] h-14 text-lg"
            disabled
          >
            {toToken}
          </ThemedButton>
        </div>
      </div>

      {/* Error Messages */}
      {quoteError && (
        <Alert className={cn(
          "mb-4",
          theme === 'cyberpunk' 
            ? 'bg-amber-900/20 border-amber-700' 
            : 'bg-amber-50 border-amber-200'
        )}>
          <AlertCircle className={cn(
            "h-4 w-4",
            theme === 'cyberpunk' ? 'text-amber-500' : 'text-amber-600'
          )} />
          <AlertDescription className={cn(
            "text-sm",
            theme === 'cyberpunk' ? 'text-amber-200' : 'text-amber-800'
          )}>
            {quoteError}
          </AlertDescription>
        </Alert>
      )}

      {insufficientBalance && (
        <Alert className={cn(
          "mb-4",
          theme === 'cyberpunk' 
            ? 'bg-red-900/20 border-red-700' 
            : 'bg-red-50 border-red-200'
        )}>
          <AlertCircle className={cn(
            "h-4 w-4",
            theme === 'cyberpunk' ? 'text-red-500' : 'text-red-600'
          )} />
          <AlertDescription className={cn(
            "text-sm",
            theme === 'cyberpunk' ? 'text-red-200' : 'text-red-800'
          )}>
            余额不足
          </AlertDescription>
        </Alert>
      )}

      {/* Swap Button */}
      <ThemedButton
        onClick={handlePrimaryAction}
        disabled={actionDisabled}
        className="w-full h-12 font-semibold"
        emphasis
      >
        {(isSwapping || isApproving) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {buttonLabel}
      </ThemedButton>

      {/* Transaction Info */}
      {amountIn && amountOut && isCorrectNetwork && exchangeRate && (
        <div className={cn(
          "mt-4 pt-4 space-y-2 text-sm",
          theme === 'cyberpunk' 
            ? 'border-t border-slate-700' 
            : 'border-t border-slate-200'
        )}>
          <div className={cn(
            "flex justify-between",
            theme === 'cyberpunk' ? 'text-slate-400' : 'text-slate-600'
          )}>
            <span>汇率</span>
            <span className={theme === 'cyberpunk' ? 'text-white' : 'text-slate-900'}>
              1 {fromToken} ≈ {exchangeRate.toFixed(6)} {toToken}
            </span>
          </div>
          <div className={cn(
            "flex justify-between",
            theme === 'cyberpunk' ? 'text-slate-400' : 'text-slate-600'
          )}>
            <span>预估 Gas</span>
            <span className={theme === 'cyberpunk' ? 'text-white' : 'text-slate-900'}>~$0.05</span>
          </div>
          <div className={cn(
            "flex justify-between",
            theme === 'cyberpunk' ? 'text-slate-400' : 'text-slate-600'
          )}>
            <span>价格影响</span>
            <span className={parseFloat(priceImpact) > 5 
              ? (theme === 'cyberpunk' ? "text-red-400" : "text-red-600")
              : (theme === 'cyberpunk' ? "text-white" : "text-slate-900")
            }>
              {priceImpact}%
            </span>
          </div>
          <div className={cn(
            "flex justify-between",
            theme === 'cyberpunk' ? 'text-slate-400' : 'text-slate-600'
          )}>
            <span>滑点容差</span>
            <span className={theme === 'cyberpunk' ? 'text-white' : 'text-slate-900'}>1%</span>
          </div>
          <div className={cn(
            "flex justify-between",
            theme === 'cyberpunk' ? 'text-slate-400' : 'text-slate-600'
          )}>
            <span>协议</span>
            <span className={cn(
              "flex items-center gap-1",
              theme === 'cyberpunk' ? 'text-white' : 'text-slate-900'
            )}>
              Uniswap V2 (BaseSwap)
              <ExternalLink className="w-3 h-3" />
            </span>
          </div>
          <div className={cn(
            "flex justify-between",
            theme === 'cyberpunk' ? 'text-slate-400' : 'text-slate-600'
          )}>
            <span>网络</span>
            <span className={theme === 'cyberpunk' ? 'text-white' : 'text-slate-900'}>Base</span>
          </div>
        </div>
      )}
    </ThemedCard>
  );
}

function formatDisplayAmount(value: string, token: "ETH" | "USDC") {
  const decimals = token === "ETH" ? 6 : 2;
  if (!value.includes(".")) return value;
  const [whole, fraction = ""] = value.split(".");
  const trimmedFraction = fraction.slice(0, decimals).replace(/0+$/, "");
  return trimmedFraction ? `${whole}.${trimmedFraction}` : whole;
}
