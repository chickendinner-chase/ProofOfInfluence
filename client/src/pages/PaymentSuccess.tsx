import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, Home, ArrowRight, Coins, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import type { Transaction } from "@shared/schema";

export default function PaymentSuccess() {
  const [sessionId, setSessionId] = useState<string>("");

  useEffect(() => {
    // Get session_id from URL query params
    const params = new URLSearchParams(window.location.search);
    const id = params.get("session_id");
    if (id) {
      setSessionId(id);
    }
  }, []);

  // Fetch transaction details
  const { data: transaction, isLoading } = useQuery<Transaction>({
    queryKey: ["/api/transaction", sessionId],
    enabled: !!sessionId,
    retry: 3,
    retryDelay: 2000, // Wait for webhook to process
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 space-y-6 text-center">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Payment Successful!</h1>
          <p className="text-muted-foreground">
            Thank you for your payment. Your transaction has been completed successfully.
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-4 w-3/4 mx-auto" />
          </div>
        ) : transaction ? (
          <>
            {/* POI Tokens Purchased */}
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg p-6 space-y-2">
              <div className="flex items-center justify-center gap-2 text-primary">
                <Coins className="h-6 w-6" />
                <span className="text-sm font-medium">$POI Tokens</span>
              </div>
              <p className="text-4xl font-bold">{transaction.poiTokens}</p>
              <p className="text-xs text-muted-foreground">
                Successfully added to your account
              </p>
            </div>

            {/* Transaction Details */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-3 text-left">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Amount Paid</span>
                <span className="font-semibold">
                  ${(transaction.amount / 100).toFixed(2)} {transaction.currency.toUpperCase()}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Status</span>
                <span className={`text-sm font-medium ${
                  transaction.status === 'completed' 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-yellow-600 dark:text-yellow-400'
                }`}>
                  {transaction.status === 'completed' ? '✓ Completed' : 'Processing...'}
                </span>
              </div>

              {transaction.status !== 'completed' && (
                <div className="flex items-start gap-2 text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>
                    Payment is being processed. Your tokens will be credited shortly.
                  </span>
                </div>
              )}
              
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground mb-1">Transaction ID</p>
                <p className="text-xs font-mono break-all">{transaction.id}</p>
              </div>
            </div>
          </>
        ) : sessionId ? (
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1">Session ID</p>
            <p className="text-sm font-mono break-all">{sessionId}</p>
          </div>
        ) : null}

        <div className="space-y-3 pt-4">
          <p className="text-sm text-muted-foreground">
            You will receive a confirmation email shortly with your payment details.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild className="flex-1">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/dashboard">
                <ArrowRight className="mr-2 h-4 w-4" />
                Go to Dashboard
              </Link>
            </Button>
          </div>
        </div>

        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            Need help? Contact support at{" "}
            <a
              href="mailto:support@proofofinfluence.com"
              className="text-primary hover:underline"
            >
              support@proofofinfluence.com
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
}

