import React from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import { BASE_EXPLORER } from "@/lib/baseConfig";

interface TransactionStatusProps {
  status: "idle" | "pending" | "success" | "error";
  hash?: `0x${string}`;
  error?: string;
}

export function TransactionStatus({ status, hash, error }: TransactionStatusProps) {
  const { theme } = useTheme();

  if (status === "idle") return null;

  if (status === "pending") {
    return (
      <Alert>
        <Loader2 className="h-4 w-4 animate-spin" />
        <AlertDescription>⏳ 交易发送中，等待确认...</AlertDescription>
      </Alert>
    );
  }

  if (status === "success" && hash) {
    const hashDisplay = `${hash.slice(0, 6)}...${hash.slice(-4)}`;
    const explorerUrl = `${BASE_EXPLORER}/tx/${hash}`;

    return (
      <Alert className={cn(
        theme === "cyberpunk" ? "bg-green-400/10 border-green-400/30" : "bg-green-50 border-green-200"
      )}>
        <CheckCircle2 className={cn(
          "h-4 w-4",
          theme === "cyberpunk" ? "text-green-400" : "text-green-600"
        )} />
        <AlertDescription>
          ✅ 成功，Tx:{" "}
          <a
            href={explorerUrl}
            target="_blank"
            rel="noreferrer"
            className={cn(
              "underline inline-flex items-center gap-1",
              theme === "cyberpunk" ? "text-green-400 hover:text-green-300" : "text-green-600 hover:text-green-700"
            )}
          >
            {hashDisplay}
            <ExternalLink className="w-3 h-3" />
          </a>
        </AlertDescription>
      </Alert>
    );
  }

  if (status === "error") {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertDescription>❌ 失败：{error || "未知错误"}</AlertDescription>
      </Alert>
    );
  }

  return null;
}

