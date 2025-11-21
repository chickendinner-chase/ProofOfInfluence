import React from "react";
import { Link } from "wouter";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { ThemedButton } from "@/components/themed";
import { Activity, ArrowRight, Loader2, Wallet } from "lucide-react";
import { ROUTES } from "@/routes";
import { useAuth } from "@/hooks/useAuth";
import { useDemoUser } from "@/hooks/useDemoUser";
import { useAccount } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import { useWalletLogin } from "@/hooks/useWalletLogin";

interface ImmortalityTopBarProps {
  credits: number;
  poiCredits: number;
  isFetching?: boolean;
  agentStatus?: string;
}

export function ImmortalityTopBar({
  credits,
  poiCredits,
  isFetching = false,
  agentStatus = "Online",
}: ImmortalityTopBarProps) {
  const { theme } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const demoUser = useDemoUser();
  const { address, isConnected } = useAccount();
  const { open } = useAppKit();
  const { loginWithWallet, isPending: isWalletLoginPending } = useWalletLogin();

  return (
    <div
      className={cn(
        "sticky top-0 z-50 border-b backdrop-blur-sm",
        theme === "cyberpunk"
          ? "border-cyan-500/20 bg-[#0a0a0f]/90"
          : "border-slate-200 bg-white/90",
      )}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-4">
          {/* Left: Credits Display */}
          <div className="flex flex-wrap items-center gap-4 md:gap-6">
            <div>
              <p className="text-xs uppercase tracking-widest opacity-70 mb-1">
                Immortality Credits
              </p>
              <div className="flex items-center gap-2">
                <p className="text-xl font-bold">{credits.toLocaleString()}</p>
                {isFetching && <Loader2 className="w-4 h-4 animate-spin opacity-50" />}
              </div>
            </div>
            <div className={cn("h-8 w-px hidden md:block", theme === "cyberpunk" ? "bg-cyan-500/20" : "bg-slate-200")} />
            <div>
              <p className="text-xs uppercase tracking-widest opacity-70 mb-1">POI Credits</p>
              <p className="text-xl font-bold">{poiCredits.toLocaleString()}</p>
            </div>
            <div className={cn("h-8 w-px hidden lg:block", theme === "cyberpunk" ? "bg-cyan-500/20" : "bg-slate-200")} />
            <div className="hidden lg:flex items-center gap-2">
              <Activity className={cn("w-4 h-4", theme === "cyberpunk" ? "text-green-400" : "text-green-600")} />
              <span className="text-sm opacity-80">
                Agent: {demoUser.isUsingDemoUser
                  ? (demoUser.selectedDemoUser?.username || demoUser.selectedDemoUser?.label || demoUser.selectedDemoUser?.walletAddress.slice(0, 6))
                  : (user?.username ?? "Guest")}
              </span>
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-xs font-semibold",
                  theme === "cyberpunk" ? "bg-green-500/20 text-green-400" : "bg-green-100 text-green-700",
                )}
              >
                {agentStatus}
              </span>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
            {demoUser.isDev && demoUser.demoUsers.length > 0 && (
              <select
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs outline-none",
                  theme === "cyberpunk"
                    ? "bg-cyan-400/15 text-cyan-200 border border-cyan-500/40"
                    : "bg-blue-100 text-blue-600 border border-blue-200",
                )}
                value={demoUser.selectedDemoUserId || ""}
                onChange={(e) => {
                  if (e.target.value) {
                    demoUser.setSelectedDemoUserId(e.target.value);
                  } else {
                    demoUser.clearDemoUser();
                  }
                }}
              >
                <option value="">真实用户</option>
                {demoUser.demoUsers.map((du) => (
                  <option key={du.userId || du.walletAddress} value={du.userId || du.walletAddress}>
                    Demo: {du.username || du.label || du.walletAddress.slice(0, 6)}...
                    {du.walletAddress.slice(-4)}
                  </option>
                ))}
              </select>
            )}
            
            {/* Wallet Connect/Login Status */}
            {!isAuthenticated && (
              <>
                {!isConnected ? (
                  <ThemedButton
                    size="sm"
                    onClick={() => open()}
                    className="flex-1 md:flex-initial"
                  >
                    <Wallet className="w-4 h-4 mr-1" />
                    连接钱包
                  </ThemedButton>
                ) : (
                  <ThemedButton
                    size="sm"
                    onClick={() => loginWithWallet()}
                    disabled={isWalletLoginPending}
                    className="flex-1 md:flex-initial"
                  >
                    {isWalletLoginPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        登录中...
                      </>
                    ) : (
                      <>
                        <Wallet className="w-4 h-4 mr-1" />
                        使用钱包登录
                      </>
                    )}
                  </ThemedButton>
                )}
              </>
            )}
            
            {isAuthenticated && address && (
              <div className={cn(
                "px-3 py-1.5 rounded-lg text-xs",
                theme === "cyberpunk"
                  ? "bg-cyan-400/15 text-cyan-200"
                  : "bg-blue-100 text-blue-600",
              )}>
                <div className="flex items-center gap-1.5">
                  <Wallet className="w-3 h-3" />
                  <span className="font-mono">
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </span>
                  {user?.plan && (
                    <span className={cn(
                      "px-1.5 py-0.5 rounded text-[10px] font-semibold",
                      user.plan === "paid"
                        ? theme === "cyberpunk" ? "bg-green-500/20 text-green-400" : "bg-green-100 text-green-700"
                        : theme === "cyberpunk" ? "bg-slate-500/20 text-slate-300" : "bg-slate-100 text-slate-600",
                    )}>
                      {user.plan === "paid" ? "Paid" : "Free"}
                    </span>
                  )}
                </div>
              </div>
            )}
            
            <ThemedButton emphasis size="sm" asChild className="flex-1 md:flex-initial">
              <Link href={ROUTES.APP_RECHARGE}>
                充值 Credits
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </ThemedButton>
          </div>
        </div>
      </div>
    </div>
  );
}

