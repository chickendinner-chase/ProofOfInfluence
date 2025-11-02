import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Loader2, Coins } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Preset amounts for $POI token purchase
const PRESET_AMOUNTS = [10, 50, 100];

export default function StripePayment() {
  const [amount, setAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handlePay = async () => {
    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum < 1 || amountNum > 10000) {
      toast({
        title: "Invalid amount",
        description: "Please enter an amount between $1 and $10,000",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amountNum,
          purpose: "Buy $POI Token",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { url } = await response.json();
      
      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment failed",
        description: "Unable to process payment. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 max-w-md w-full space-y-6">
      <div className="space-y-2 text-center">
        <div className="flex items-center justify-center gap-2">
          <Coins className="h-8 w-8 text-primary" />
          <h3 className="text-2xl font-bold">Buy $POI Token</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Purchase ProofOfInfluence tokens to power your Web3 profile
        </p>
      </div>

      <div className="space-y-4">
        {/* Preset Amounts */}
        <div className="space-y-2">
          <Label>Quick Select</Label>
          <div className="flex gap-2 flex-wrap">
            {PRESET_AMOUNTS.map((preset) => (
              <Button
                key={preset}
                type="button"
                variant={amount === preset.toString() ? "default" : "outline"}
                size="sm"
                onClick={() => setAmount(preset.toString())}
                disabled={isLoading}
                className="flex-1"
              >
                ${preset}
              </Button>
            ))}
          </div>
        </div>

        {/* Custom Amount Input */}
        <div className="space-y-2">
          <Label htmlFor="amount">
            Custom Amount (USD)
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              $
            </span>
            <Input
              id="amount"
              type="number"
              min="1"
              max="10000"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="pl-7"
              disabled={isLoading}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Flexible pricing: $1 - $10,000
          </p>
        </div>

        {/* Pay Button */}
        <Button
          onClick={handlePay}
          disabled={isLoading || !amount}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Pay ${amount || "0"}
            </>
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Secure payment powered by Stripe
        </p>
      </div>
    </Card>
  );
}

