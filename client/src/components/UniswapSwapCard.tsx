import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ArrowDownUp, Loader2, AlertCircle, ExternalLink, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "./ui/alert";
import { useAccount, useBalance, useSwitchChain, useWalletClient, usePublicClient } from 'wagmi';
import { base } from 'wagmi/chains';
import { ethers } from "ethers";
import { publicClientToProvider, walletClientToSigner } from "@/lib/ethersAdapter";
import {
  WETH_ADDRESS,
  USDC_ADDRESS,
  BASESWAP_ROUTER_ADDRESS,
  UNISWAP_V2_ROUTER_ABI,
  ERC20_ABI,
} from "@/lib/baseConfig";

interface UniswapSwapCardProps {
  walletAddress?: string | null; // Keep for backward compatibility
}

export default function UniswapSwapCard({ walletAddress: _deprecated }: UniswapSwapCardProps = {}) {
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [isSwapping, setIsSwapping] = useState(false);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [fromToken, setFromToken] = useState<"ETH" | "USDC">("ETH");
  const [toToken, setToToken] = useState<"ETH" | "USDC">("USDC");
  const [estimatedGas, setEstimatedGas] = useState<string>("");
  const [priceImpact, setPriceImpact] = useState<string>("0");
  const { toast } = useToast();

  // Use wagmi hooks
  const { address, isConnected, chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  // Get ETH balance
  const { data: ethBalance, refetch: refetchEthBalance } = useBalance({
    address,
    chainId: base.id,
  });

  // Get USDC balance
  const { data: usdcBalance, refetch: refetchUsdcBalance } = useBalance({
    address,
    token: USDC_ADDRESS as `0x${string}`,
    chainId: base.id,
  });

  const isCorrectNetwork = chain?.id === base.id;

  // Format balance for display
  const ethBalanceFormatted = ethBalance ? parseFloat(ethBalance.formatted).toFixed(6) : "0.0";
  const usdcBalanceFormatted = usdcBalance ? parseFloat(usdcBalance.formatted).toFixed(2) : "0.0";

  // Switch to Base network
  const switchToBase = async () => {
    if (!switchChain) {
      toast({
        title: "无法切换网络",
        description: "请手动切换到 Base 网络",
        variant: "destructive",
      });
      return;
    }

    try {
      await switchChain({ chainId: base.id });
      toast({
        title: "已切换到 Base 网络",
      });
    } catch (error: any) {
      toast({
        title: "切换网络失败",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Refresh balances
  const fetchBalances = async () => {
    if (!address || !isCorrectNetwork) return;
    refetchEthBalance();
    refetchUsdcBalance();
  };

  // Get quote from Uniswap V2 Router
  const getQuote = async (amount: string) => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setToAmount("");
      setEstimatedGas("");
      setPriceImpact("0");
      return;
    }

    if (!isCorrectNetwork) {
      setToAmount("");
      return;
    }

    setIsLoadingQuote(true);

    try {
      // Use wagmi's publicClient for read operations (no wallet required)
      if (!publicClient) {
        throw new Error("No provider available");
      }

      const provider = publicClientToProvider(publicClient);
      const routerContract = new ethers.Contract(
        BASESWAP_ROUTER_ADDRESS,
        UNISWAP_V2_ROUTER_ABI,
        provider
      );

      // Build path
      const path = fromToken === "ETH"
        ? [WETH_ADDRESS, USDC_ADDRESS]
        : [USDC_ADDRESS, WETH_ADDRESS];

      // Convert input amount
      const amountIn = fromToken === "ETH"
        ? ethers.utils.parseEther(amount)
        : ethers.utils.parseUnits(amount, 6);

      // Get output amount
      const amounts = await routerContract.getAmountsOut(amountIn, path);
      const amountOut = amounts[1];

      // Format output amount
      const formattedOut = toToken === "ETH"
        ? ethers.utils.formatEther(amountOut)
        : ethers.utils.formatUnits(amountOut, 6);

      setToAmount(parseFloat(formattedOut).toFixed(6));

      // Estimate gas
      setEstimatedGas("~$0.05");

      // Calculate price impact
      const expectedRate = fromToken === "ETH" ? 2500 : 1 / 2500;
      const actualRate = parseFloat(formattedOut) / parseFloat(amount);
      const impact = Math.abs((actualRate - expectedRate) / expectedRate * 100);
      setPriceImpact(impact.toFixed(2));

    } catch (error: any) {
      console.error("Failed to get quote:", error);
      toast({
        title: "获取报价失败",
        description: error.message || "请检查网络连接",
        variant: "destructive",
      });
      setToAmount("");
    } finally {
      setIsLoadingQuote(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (fromAmount && isCorrectNetwork) {
        getQuote(fromAmount);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [fromAmount, fromToken, isCorrectNetwork]);

  useEffect(() => {
    if (address && isCorrectNetwork) {
      fetchBalances();
      // Refresh balances every 15 seconds
      const interval = setInterval(fetchBalances, 15000);
      return () => clearInterval(interval);
    }
  }, [address, isCorrectNetwork]);

  const handleSwap = async () => {
    if (!address) {
      toast({
        title: "请先连接钱包",
        variant: "destructive",
      });
      return;
    }

    if (!isCorrectNetwork) {
      toast({
        title: "请切换到 Base 网络",
        variant: "destructive",
      });
      return;
    }

    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      toast({
        title: "请输入有效金额",
        variant: "destructive",
      });
      return;
    }

    // Check balance
    const balance = fromToken === "ETH" ? parseFloat(ethBalanceFormatted) : parseFloat(usdcBalanceFormatted);
    if (parseFloat(fromAmount) > balance) {
      toast({
        title: "余额不足",
        description: `您的 ${fromToken} 余额不足`,
        variant: "destructive",
      });
      return;
    }

    setIsSwapping(true);

    try {
      // Use wagmi's walletClient for write operations
      if (!walletClient) {
        throw new Error("Please connect your wallet");
      }

      const signer = walletClientToSigner(walletClient);
      const routerContract = new ethers.Contract(
        BASESWAP_ROUTER_ADDRESS,
        UNISWAP_V2_ROUTER_ABI,
        signer
      );

      const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes
      const slippageTolerance = 0.5; // 0.5%
      const amountOutMin = ethers.utils.parseUnits(
        (parseFloat(toAmount) * (1 - slippageTolerance / 100)).toFixed(6),
        toToken === "ETH" ? 18 : 6
      );

      let tx;

      if (fromToken === "ETH") {
        // ETH -> USDC
        const amountIn = ethers.utils.parseEther(fromAmount);
        const path = [WETH_ADDRESS, USDC_ADDRESS];

        tx = await routerContract.swapExactETHForTokens(
          amountOutMin,
          path,
          address,
          deadline,
          { value: amountIn }
        );
      } else {
        // USDC -> ETH
        const amountIn = ethers.utils.parseUnits(fromAmount, 6);
        const path = [USDC_ADDRESS, WETH_ADDRESS];

        // Check approval
        const usdcContract = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, signer);
        const allowance = await usdcContract.allowance(address, BASESWAP_ROUTER_ADDRESS);

        if (allowance.lt(amountIn)) {
          toast({
            title: "需要授权",
            description: "正在请求 USDC 授权...",
          });

          const approveTx = await usdcContract.approve(
            BASESWAP_ROUTER_ADDRESS,
            ethers.constants.MaxUint256
          );
          await approveTx.wait();

          toast({
            title: "授权成功",
            description: "现在可以进行交易",
          });
        }

        tx = await routerContract.swapExactTokensForETH(
          amountIn,
          amountOutMin,
          path,
          address,
          deadline
        );
      }

      toast({
        title: "交易已提交",
        description: "等待区块确认...",
      });

      const receipt = await tx.wait();

      toast({
        title: "交易成功！",
        description: `交易哈希: ${receipt.transactionHash.substring(0, 10)}...`,
      });

      // Reset and refresh
      setFromAmount("");
      setToAmount("");
      fetchBalances();

    } catch (error: any) {
      console.error("Swap failed:", error);

      if (error.code === 4001) {
        toast({
          title: "交易已取消",
          description: "您拒绝了交易请求",
        });
      } else {
        toast({
          title: "交易失败",
          description: error.message || "未知错误",
          variant: "destructive",
        });
      }
    } finally {
      setIsSwapping(false);
    }
  };

  const switchTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setFromAmount(toAmount);
    setToAmount("");
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">兑换</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchBalances}
          disabled={!address || !isCorrectNetwork}
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {!isConnected && (
        <Alert className="mb-4 bg-slate-900/50 border-slate-700">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-slate-300">
            请先连接钱包以开始交易
          </AlertDescription>
        </Alert>
      )}

      {isConnected && !isCorrectNetwork && (
        <Alert className="mb-4 bg-yellow-900/20 border-yellow-700">
          <AlertCircle className="h-4 w-4 text-yellow-500" />
          <AlertDescription className="text-yellow-200 flex items-center justify-between">
            <span>请切换到 Base 网络</span>
            <Button size="sm" onClick={switchToBase} className="ml-2">
              切换网络
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* From Token */}
      <div className="space-y-2 mb-2">
        <div className="flex justify-between text-sm">
          <label className="text-slate-400">卖出</label>
          {address && isCorrectNetwork && (
            <button
              onClick={() => setFromAmount(fromToken === "ETH" ? ethBalanceFormatted : usdcBalanceFormatted)}
              className="text-slate-500 hover:text-slate-300 transition-colors"
            >
              余额: {fromToken === "ETH" ? ethBalanceFormatted : usdcBalanceFormatted} {fromToken}
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="0.0"
            value={fromAmount}
            onChange={(e) => setFromAmount(e.target.value)}
            className="bg-slate-900 border-slate-700 text-white text-lg h-14 flex-1"
            disabled={!address || !isCorrectNetwork}
          />
          <Button
            variant="outline"
            className="min-w-[100px] h-14 text-lg border-slate-700"
            disabled
          >
            {fromToken}
          </Button>
        </div>
      </div>

      {/* Switch Button */}
      <div className="flex justify-center my-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={switchTokens}
          className="rounded-full h-10 w-10 hover:bg-slate-700"
          disabled={!address || !isCorrectNetwork}
        >
          <ArrowDownUp className="w-5 h-5" />
        </Button>
      </div>

      {/* To Token */}
      <div className="space-y-2 mb-6">
        <label className="text-sm text-slate-400">买入</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type="number"
              placeholder="0.0"
              value={toAmount}
              readOnly
              className="bg-slate-900 border-slate-700 text-white text-lg h-14"
            />
            {isLoadingQuote && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
              </div>
            )}
          </div>
          <Button
            variant="outline"
            className="min-w-[100px] h-14 text-lg border-slate-700"
            disabled
          >
            {toToken}
          </Button>
        </div>
      </div>

      {/* Swap Button */}
      <Button
        onClick={handleSwap}
        disabled={isSwapping || !address || !isCorrectNetwork || !fromAmount || isLoadingQuote}
        className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
      >
        {isSwapping ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            交易中...
          </>
        ) : !address ? (
          "连接钱包以交易"
        ) : !isCorrectNetwork ? (
          "请切换到 Base 网络"
        ) : (
          "兑换"
        )}
      </Button>

      {/* Transaction Info */}
      {fromAmount && toAmount && isCorrectNetwork && (
        <div className="mt-4 pt-4 border-t border-slate-700 space-y-2 text-sm">
          <div className="flex justify-between text-slate-400">
            <span>汇率</span>
            <span className="text-white">
              1 {fromToken} ≈ {(parseFloat(toAmount) / parseFloat(fromAmount)).toFixed(2)} {toToken}
            </span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>预估 Gas</span>
            <span className="text-white">{estimatedGas}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>价格影响</span>
            <span className={parseFloat(priceImpact) > 5 ? "text-red-400" : "text-white"}>
              {priceImpact}%
            </span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>滑点容差</span>
            <span className="text-white">0.5%</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>协议</span>
            <span className="text-white flex items-center gap-1">
              Uniswap V2 (BaseSwap)
              <ExternalLink className="w-3 h-3" />
            </span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>网络</span>
            <span className="text-white">Base</span>
          </div>
        </div>
      )}
    </Card>
  );
}
