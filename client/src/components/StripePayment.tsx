import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreditCard, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Payment purposes with preset amounts
const PAYMENT_OPTIONS = [
  {
    value: "poi-token",
    label: "Buy $POI Token",
    presets: [10, 50, 100],
    description: "Purchase ProofOfInfluence tokens",
  },
  {
    value: "monthly-member",
    label: "Monthly Membership",
    presets: [9.99],
    description: "Subscribe to monthly plan",
  },
  {
    value: "yearly-member",
    label: "Yearly Membership",
    presets: [99.99],
    description: "Subscribe to yearly plan (save 20%)",
  },
  {
    value: "enterprise",
    label: "Enterprise Plan",
    presets: [299],
    description: "Get full enterprise features",
  },
  {
    value: "donation",
    label: "Tip / Donation",
    presets: [5, 10, 20],
    description: "Support the platform",
  },
];

export default function StripePayment() {
  const [purpose, setPurpose] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const selectedOption = PAYMENT_OPTIONS.find((opt) => opt.value === purpose);

  const handlePay = async () => {
    if (!purpose) {
      toast({
        title: "Select payment purpose",
        description: "Please select what you want to pay for",
        variant: "destructive",
      });
      return;
    }

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
          purpose: selectedOption?.label || purpose,
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
        <h3 className="text-2xl font-bold">Get Started</h3>
        <p className="text-sm text-muted-foreground">
          Choose your plan or purchase tokens
        </p>
      </div>

      <div className="space-y-4">
        {/* Purpose Selection */}
        <div className="space-y-2">
          <Label htmlFor="purpose">What are you paying for?</Label>
          <Select value={purpose} onValueChange={setPurpose}>
            <SelectTrigger id="purpose">
              <SelectValue placeholder="Select payment purpose" />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedOption && (
            <p className="text-xs text-muted-foreground">
              {selectedOption.description}
            </p>
          )}
        </div>

        {/* Preset Amounts */}
        {selectedOption && selectedOption.presets.length > 0 && (
          <div className="space-y-2">
            <Label>Quick Select</Label>
            <div className="flex gap-2 flex-wrap">
              {selectedOption.presets.map((preset) => (
                <Button
                  key={preset}
                  type="button"
                  variant={amount === preset.toString() ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAmount(preset.toString())}
                  disabled={isLoading}
                >
                  ${preset}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Custom Amount Input */}
        <div className="space-y-2">
          <Label htmlFor="amount">
            Amount (USD) {selectedOption?.presets.length ? "or custom" : ""}
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
          disabled={isLoading || !purpose || !amount}
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

