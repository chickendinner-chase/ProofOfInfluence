import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ChevronDown, ChevronUp, Coins, Loader2 } from "lucide-react";
import { useAccount, useBalance } from 'wagmi';
import { base } from 'wagmi/chains';
import { useToast } from "@/hooks/use-toast";
import { USDC_ADDRESS } from "@/lib/baseConfig";

export default function CompactSwapCard() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [amount, setAmount] = useState("");
  const [isSwapping, setIsSwapping] = useState(false);
  const { address, isConnected } = useAccount();
  const { toast } = useToast();

  const { data: ethBalance } = useBalance({ address, chainId: base.id });
  const { data: usdcBalance } = useBalance({
    address,
    token: USDC_ADDRESS as `0x${string}`,
    chainId: base.id,
  });

  const handleQuickSwap = () => {
    if (!isConnected) {
      toast({
        title: "请先连接钱包",
        description: "在 DApp 浏览器中打开此链接",
        variant: "destructive",
      });
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "请输入有效金额",
        variant: "destructive",
      });
      return;
    }

    // 跳转到完整交易页面，并预填金额
    window.location.href = `/app/market?buy=${amount}`;
  };

  if (!isExpanded) {
    // 未展开：只显示一个紧凑按钮
    return (
      <Button
        onClick={() => setIsExpanded(true)}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 text-base group"
      >
        <Coins className="mr-2 h-5 w-5" />
        即时兑换 $POI
        <ChevronDown className="ml-2 h-4 w-4 group-hover:translate-y-0.5 transition-transform" />
      </Button>
    );
  }

  // 展开：显示精简交易界面
  return (
    <div className="space-y-3">
      {/* 顶部：折叠按钮 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Coins className="h-4 w-4 text-blue-400" />
          <span className="text-sm font-semibold text-white">快速兑换</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(false)}
          className="h-6 w-6 p-0 hover:bg-slate-700"
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
      </div>

      {/* 余额显示 */}
      {isConnected && (ethBalance || usdcBalance) && (
        <div className="flex justify-between text-xs text-slate-400 px-1">
          <span>ETH: {ethBalance ? parseFloat(ethBalance.formatted).toFixed(4) : '0'}</span>
          <span>USDC: {usdcBalance ? parseFloat(usdcBalance.formatted).toFixed(2) : '0'}</span>
        </div>
      )}

      {/* 未连接钱包提示 */}
      {!isConnected && (
        <div className="text-xs text-slate-400 text-center py-2 bg-slate-800/50 rounded">
          请在 DApp 浏览器中连接钱包
        </div>
      )}

      {/* 输入框 + 购买按钮 */}
      <div className="flex gap-2">
        <Input
          type="number"
          placeholder="金额 (USD)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="bg-slate-700 border-slate-600 text-white flex-1"
          disabled={isSwapping}
        />
        <Button
          onClick={handleQuickSwap}
          disabled={isSwapping || !amount}
          className="bg-green-600 hover:bg-green-700 whitespace-nowrap px-6"
        >
          {isSwapping ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "购买"
          )}
        </Button>
      </div>

      {/* 快捷金额按钮 */}
      <div className="flex gap-2">
        {[10, 50, 100].map((preset) => (
          <Button
            key={preset}
            variant="outline"
            size="sm"
            onClick={() => setAmount(preset.toString())}
            className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
            disabled={isSwapping}
          >
            ${preset}
          </Button>
        ))}
      </div>

      {/* 底部提示 */}
      <p className="text-xs text-slate-400 text-center">
        将跳转到交易市场完成兑换 · Base 网络
      </p>
    </div>
  );
}

