import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ArrowDownUp, Loader2, AlertCircle, ExternalLink, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "./ui/alert";
import { ethers } from "ethers";
import {
  BASE_CHAIN_ID,
  BASE_CHAIN_ID_HEX,
  BASE_NETWORK_PARAMS,
  WETH_ADDRESS,
  USDC_ADDRESS,
  BASESWAP_ROUTER_ADDRESS,
  UNISWAP_V2_ROUTER_ABI,
  ERC20_ABI,
} from "@/lib/baseConfig";

interface UniswapSwapCardProps {
  walletAddress: string | null;
}

export default function UniswapSwapCard({ walletAddress }: UniswapSwapCardProps) {
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [isSwapping, setIsSwapping] = useState(false);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [fromToken, setFromToken] = useState<"ETH" | "USDC">("ETH");
  const [toToken, setToToken] = useState<"ETH" | "USDC">("USDC");
  const [estimatedGas, setEstimatedGas] = useState<string>("");
  const [ethBalance, setEthBalance] = useState<string>("0.0");
  const [usdcBalance, setUsdcBalance] = useState<string>("0.0");
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [priceImpact, setPriceImpact] = useState<string>("0");
  const { toast } = useToast();

  // 检查网络
  const checkNetwork = async () => {
    if (!window.ethereum) return false;
    
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const network = await provider.getNetwork();
      const isBase = network.chainId === BASE_CHAIN_ID;
      setIsCorrectNetwork(isBase);
      return isBase;
    } catch (error) {
      console.error("Failed to check network:", error);
      return false;
    }
  };

  // 切换到 Base 网络
  const switchToBase = async () => {
    if (!window.ethereum) {
      toast({
        title: "请安装 MetaMask",
        variant: "destructive",
      });
      return;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BASE_CHAIN_ID_HEX }],
      });
      setIsCorrectNetwork(true);
      toast({
        title: "已切换到 Base 网络",
      });
    } catch (error: any) {
      // 网络不存在，添加它
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [BASE_NETWORK_PARAMS]
          });
          setIsCorrectNetwork(true);
          toast({
            title: "已添加并切换到 Base 网络",
          });
        } catch (addError) {
          toast({
            title: "无法添加 Base 网络",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "切换网络失败",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  // 查询余额
  const fetchBalances = async () => {
    if (!walletAddress || !window.ethereum) return;
    
    const isBase = await checkNetwork();
    if (!isBase) {
      setEthBalance("0.0");
      setUsdcBalance("0.0");
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      
      // 查询 ETH 余额
      const ethBal = await provider.getBalance(walletAddress);
      setEthBalance(parseFloat(ethers.utils.formatEther(ethBal)).toFixed(6));
      
      // 查询 USDC 余额
      const usdcContract = new ethers.Contract(
        USDC_ADDRESS,
        ERC20_ABI,
        provider
      );
      const usdcBal = await usdcContract.balanceOf(walletAddress);
      setUsdcBalance(parseFloat(ethers.utils.formatUnits(usdcBal, 6)).toFixed(2));
      
    } catch (error) {
      console.error("Failed to fetch balances:", error);
    }
  };

  // 获取真实报价 - 通过 Uniswap V2 Router
  const getQuote = async (amount: string) => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setToAmount("");
      setEstimatedGas("");
      setPriceImpact("0");
      return;
    }

    const isBase = await checkNetwork();
    if (!isBase) {
      setToAmount("");
      return;
    }
    
    setIsLoadingQuote(true);
    
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const routerContract = new ethers.Contract(
        BASESWAP_ROUTER_ADDRESS,
        UNISWAP_V2_ROUTER_ABI,
        provider
      );

      // 构建交易路径
      const path = fromToken === "ETH" 
        ? [WETH_ADDRESS, USDC_ADDRESS]
        : [USDC_ADDRESS, WETH_ADDRESS];

      // 转换输入金额
      const amountIn = fromToken === "ETH"
        ? ethers.utils.parseEther(amount)
        : ethers.utils.parseUnits(amount, 6); // USDC 有 6 位小数

      // 获取输出金额
      const amounts = await routerContract.getAmountsOut(amountIn, path);
      const amountOut = amounts[1];

      // 格式化输出金额
      const formattedOut = toToken === "ETH"
        ? ethers.utils.formatEther(amountOut)
        : ethers.utils.formatUnits(amountOut, 6);

      setToAmount(parseFloat(formattedOut).toFixed(6));

      // 估算 Gas 费（Base 链较低）
      setEstimatedGas("~$0.05");

      // 简单计算价格影响（实际应该更复杂）
      const expectedRate = fromToken === "ETH" ? 2500 : 1/2500;
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
    if (walletAddress) {
      checkNetwork();
      fetchBalances();
      // 每 15 秒更新一次余额
      const interval = setInterval(fetchBalances, 15000);
      return () => clearInterval(interval);
    }
  }, [walletAddress]);

  // 监听网络切换
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('chainChanged', () => {
        checkNetwork();
        fetchBalances();
      });
    }
  }, []);

  const handleSwap = async () => {
    if (!walletAddress) {
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

    // 检查余额是否足够
    const balance = fromToken === "ETH" ? parseFloat(ethBalance) : parseFloat(usdcBalance);
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
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const routerContract = new ethers.Contract(
        BASESWAP_ROUTER_ADDRESS,
        UNISWAP_V2_ROUTER_ABI,
        signer
      );

      const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 分钟后过期
      const slippageTolerance = 0.5; // 0.5% 滑点
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
          walletAddress,
          deadline,
          { value: amountIn }
        );
      } else {
        // USDC -> ETH
        const amountIn = ethers.utils.parseUnits(fromAmount, 6);
        const path = [USDC_ADDRESS, WETH_ADDRESS];
        
        // 检查授权
        const usdcContract = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, signer);
        const allowance = await usdcContract.allowance(walletAddress, BASESWAP_ROUTER_ADDRESS);
        
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
          walletAddress,
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

      // 刷新余额
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
          disabled={!walletAddress || !isCorrectNetwork}
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>
      
      {!walletAddress && (
        <Alert className="mb-4 bg-slate-900/50 border-slate-700">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-slate-300">
            请先连接钱包以开始交易
          </AlertDescription>
        </Alert>
      )}

      {walletAddress && !isCorrectNetwork && (
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
          {walletAddress && isCorrectNetwork && (
            <button
              onClick={() => setFromAmount(fromToken === "ETH" ? ethBalance : usdcBalance)}
              className="text-slate-500 hover:text-slate-300 transition-colors"
            >
              余额: {fromToken === "ETH" ? ethBalance : usdcBalance} {fromToken}
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
            disabled={!walletAddress || !isCorrectNetwork}
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
          disabled={!walletAddress || !isCorrectNetwork}
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
        disabled={isSwapping || !walletAddress || !isCorrectNetwork || !fromAmount || isLoadingQuote}
        className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
      >
        {isSwapping ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            交易中...
          </>
        ) : !walletAddress ? (
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
