import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ThemedButton } from "@/components/themed";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Loader2, Coins } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface ChatPaymentProps {
  suggestedAmount?: number;
  onSuccess?: () => void;
}

export function ChatPayment({ suggestedAmount = 20, onSuccess }: ChatPaymentProps) {
  const { theme } = useTheme();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const handlePay = async () => {
    if (!isAuthenticated) {
      toast({
        title: "需要登录",
        description: "请先登录后再充值",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: suggestedAmount,
          currency: "usd",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create checkout session");
      }

      const { url } = await response.json();
      
      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      console.error("Payment error:", error);
      const message = error instanceof Error ? error.message : "未知错误";
      toast({
        title: "支付失败",
        description: message === "Unauthorized"
          ? "请先登录后再充值"
          : `无法处理支付：${message}`,
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "rounded-xl border p-4 space-y-3",
        theme === "cyberpunk"
          ? "border-cyan-400/30 bg-cyan-400/5"
          : "border-slate-200 bg-slate-50"
      )}
    >
      <div className="flex items-center gap-2">
        <Coins className={cn("w-5 h-5", theme === "cyberpunk" ? "text-cyan-400" : "text-primary")} />
        <span className="font-semibold text-sm">充值 Immortality Credits</span>
      </div>
      
      <p className="text-xs opacity-70">
        建议充值金额：${suggestedAmount} ({suggestedAmount * 100} Credits)
      </p>

      <ThemedButton
        onClick={handlePay}
        disabled={isLoading || !isAuthenticated}
        className="w-full"
        size="sm"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            处理中...
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4 mr-2" />
            充值 ${suggestedAmount}
          </>
        )}
      </ThemedButton>

      <p className="text-xs text-center opacity-60">
        安全支付，由 Stripe 提供支持
      </p>
    </div>
  );
}
