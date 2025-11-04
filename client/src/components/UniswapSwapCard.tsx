import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  extractTransactionParams,
  fetchEthUsdcQuote,
  formatUnits,
  QuoteSummary,
  UNISWAP_V3_WETH_USDC_POOL,
} from "@/lib/uniswap";
import { AlertCircle, Loader2, RefreshCcw } from "lucide-react";

type UniswapSwapCardProps = {
  walletAddress?: string | null;
};

const DEBOUNCE_DELAY = 400;

export function UniswapSwapCard({ walletAddress }: UniswapSwapCardProps) {
  const { toast } = useToast();
  const [ethAmount, setEthAmount] = useState("0.1");
  const [quote, setQuote] = useState<QuoteSummary | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [isSwapping, setIsSwapping] = useState(false);

  useEffect(() => {
    if (!ethAmount || !ethAmount.trim()) {
      setQuote(null);
      setError(null);
      return;
    }

    const numericAmount = Number(ethAmount);
    if (Number.isNaN(numericAmount)) {
      setQuote(null);
      setError("请输入正确的数字格式");
      return;
    }

    if (numericAmount <= 0) {
      setQuote(null);
      setError("兑换数量需要大于 0");
      return;
    }

    const controller = new AbortController();
    const handler = setTimeout(async () => {
      setIsFetching(true);
      setError(null);
      try {
        const result = await fetchEthUsdcQuote(ethAmount, controller.signal);
        setQuote(result);
        setLastUpdated(new Date());
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          const message = (err as Error).message;
          if (message === "Invalid number format") {
            setError("请输入正确的数字格式");
          } else {
            setError(message || "无法获取Uniswap报价");
          }
          setQuote(null);
        }
      } finally {
        setIsFetching(false);
      }
    }, DEBOUNCE_DELAY);

    return () => {
      controller.abort();
      clearTimeout(handler);
    };
  }, [ethAmount, refreshCounter]);

  const pricePerEth = useMemo(() => {
    if (!quote) return null;
    const amountOut = Number(formatUnits(quote.amountOut, quote.amountOutDecimals));
    const baseAmount = Number(ethAmount);
    if (!baseAmount || Number.isNaN(amountOut) || Number.isNaN(baseAmount)) {
      return null;
    }
    return amountOut / baseAmount;
  }, [quote, ethAmount]);

  const guaranteedAmount = useMemo(() => {
    if (!quote?.quote.guaranteedQuote) return null;
    return Number(formatUnits(quote.quote.guaranteedQuote, quote.amountOutDecimals));
  }, [quote]);

  const refreshQuote = () => {
    setRefreshCounter((prev) => prev + 1);
  };

  const estimatedFee = useMemo(() => {
    if (!quote) return null;
    if (quote.quote.gasUseEstimateUSD) {
      const feeNumber = Number(quote.quote.gasUseEstimateUSD);
      if (!Number.isNaN(feeNumber)) {
        return feeNumber.toLocaleString(undefined, {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 2,
        });
      }
    }
    if (quote.quote.gasUseEstimateQuote) {
      const formatted = formatUnits(quote.quote.gasUseEstimateQuote, quote.amountOutDecimals);
      return `${Number(formatted).toLocaleString(undefined, { maximumFractionDigits: 2 })} USDC`;
    }
    return null;
  }, [quote]);

  const handleSwap = async () => {
    if (!walletAddress) {
      toast({
        title: "请先连接钱包",
        description: "在执行兑换前，请使用右上角的按钮连接您的钱包。",
        variant: "destructive",
      });
      return;
    }

    if (!window.ethereum) {
      toast({
        title: "未检测到以太坊钱包",
        description: "请安装 MetaMask 或兼容浏览器钱包后重试。",
        variant: "destructive",
      });
      return;
    }

    if (!quote) {
      toast({
        title: "暂无可用报价",
        description: "请先获取Uniswap报价后再尝试兑换。",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSwapping(true);

      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      if (chainId !== "0x1") {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x1" }],
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: "0x1",
                  chainName: "Ethereum Mainnet",
                  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
                  rpcUrls: ["https://mainnet.infura.io/v3/"],
                  blockExplorerUrls: ["https://etherscan.io"],
                },
              ],
            });
            await window.ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: "0x1" }],
            });
          } else if (switchError.code === 4001) {
            toast({
              title: "操作已取消",
              description: "您拒绝了网络切换请求。",
            });
            return;
          } else {
            throw switchError;
          }
        }
      }

      const { data, to, value } = extractTransactionParams(quote.quote);
      const transactionValue = value ?? "0";
      const normalizedValue = transactionValue.startsWith("0x")
        ? transactionValue === "0x"
          ? "0x0"
          : transactionValue
        : `0x${BigInt(transactionValue).toString(16)}`;

      const txHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: walletAddress,
            to,
            data,
            value: normalizedValue,
          },
        ],
      });

      toast({
        title: "兑换请求已提交",
        description: (
          <a
            href={`https://etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            查看交易详情
          </a>
        ),
      });
    } catch (swapError: any) {
      if (swapError.code === 4001) {
        toast({
          title: "交易已取消",
          description: "您拒绝了这笔交易请求。",
        });
      } else {
        toast({
          title: "兑换失败",
          description: swapError.message || "无法完成Uniswap兑换，请稍后再试。",
          variant: "destructive",
        });
      }
    } finally {
      setIsSwapping(false);
    }
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEthAmount(event.target.value);
  };

  return (
    <Card className="w-full bg-muted/40 border-dashed">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl">在 Uniswap 兑换 ETH/USDC</CardTitle>
        <CardDescription>
          通过官方 Uniswap v3 池子完成 ETH 与 USDC 的兑换，报价实时更新。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="eth-amount">支付 ETH 数量</Label>
          <Input
            id="eth-amount"
            value={ethAmount}
            onChange={handleInputChange}
            placeholder="0.0"
            inputMode="decimal"
          />
        </div>

        <div className="space-y-2">
          <Label>预估可获得</Label>
          {isFetching ? (
            <Skeleton className="h-9 w-full" />
          ) : quote ? (
            <div className="rounded-lg border bg-background px-4 py-3">
              <p className="text-lg font-semibold">
                {Number(formatUnits(quote.amountOut, quote.amountOutDecimals)).toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}{" "}
                USDC
              </p>
              {guaranteedAmount && (
                <p className="text-sm text-muted-foreground">
                  最低可得约 {guaranteedAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} USDC（含滑点保护）
                </p>
              )}
              {pricePerEth && (
                <p className="text-sm text-muted-foreground">1 ETH ≈ {pricePerEth.toLocaleString(undefined, { maximumFractionDigits: 2 })} USDC</p>
              )}
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <div className="rounded-lg border px-4 py-3 text-sm text-muted-foreground">请输入有效的 ETH 数量以获取报价</div>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div>
            <p>
              资金来源:
              <a
                href={`https://info.uniswap.org/#/pools/${UNISWAP_V3_WETH_USDC_POOL}`}
                target="_blank"
                rel="noreferrer"
                className="ml-1 underline"
              >
                Uniswap v3 WETH/USDC 池
              </a>
            </p>
            {estimatedFee && <p>预估燃料费用: {estimatedFee}</p>}
          </div>
          <Button variant="ghost" size="icon" onClick={refreshQuote} disabled={isFetching}>
            {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
          </Button>
        </div>

        {lastUpdated && (
          <p className="text-xs text-muted-foreground">最近更新: {lastUpdated.toLocaleTimeString()}</p>
        )}
      </CardContent>
      <CardFooter className="flex w-full flex-col gap-2">
        <Button className="w-full" onClick={handleSwap} disabled={isSwapping || !quote}>
          {isSwapping ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          使用 Uniswap 立即兑换
        </Button>
        {!walletAddress && (
          <p className="text-center text-xs text-muted-foreground">
            需要先连接您的钱包，才能通过 Uniswap 完成交易。
          </p>
        )}
      </CardFooter>
    </Card>
  );
}

export default UniswapSwapCard;
