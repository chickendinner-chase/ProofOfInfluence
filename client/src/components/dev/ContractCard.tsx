import React from "react";
import { ThemedCard } from "@/components/themed";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { ExternalLink, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

interface ContractCardProps {
  title: string;
  address: `0x${string}`;
  explorerBaseUrl: string;
  children: React.ReactNode;
}

export function ContractCard({ title, address, explorerBaseUrl, children }: ContractCardProps) {
  const { theme } = useTheme();
  const isConfigured = address && address !== ZERO_ADDRESS;

  const explorerUrl = isConfigured
    ? `${explorerBaseUrl}/address/${address}`
    : null;

  return (
    <ThemedCard className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h2
            className={cn(
              "text-lg font-bold mb-2",
              theme === "cyberpunk" ? "font-orbitron text-cyan-200" : "font-poppins text-slate-900"
            )}
          >
            {title}
          </h2>
          <div className="text-xs break-all font-mono opacity-70">
            {isConfigured ? address : "未配置地址（ZERO_ADDRESS）"}
          </div>
        </div>
        {isConfigured && explorerUrl && (
          <a
            href={explorerUrl}
            target="_blank"
            rel="noreferrer"
            className={cn(
              "flex items-center gap-1 text-xs underline transition-colors flex-shrink-0",
              theme === "cyberpunk"
                ? "text-cyan-400 hover:text-cyan-300"
                : "text-blue-600 hover:text-blue-700"
            )}
          >
            <span>View on BaseScan</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      {/* Warning if not configured */}
      {!isConfigured && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            合约地址未配置，无法操作。请检查环境变量配置。
          </AlertDescription>
        </Alert>
      )}

      {/* Content */}
      {isConfigured && <div className="space-y-3">{children}</div>}
    </ThemedCard>
  );
}

