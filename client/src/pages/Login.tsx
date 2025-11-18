import React from "react";
import { useLocation } from "wouter";
import { useAccount } from "wagmi";
import { PageLayout } from "@/components/layout/PageLayout";
import { Section } from "@/components/layout/Section";
import { ThemedCard, ThemedButton } from "@/components/themed";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import WalletConnectButton from "@/components/WalletConnectButton";
import { useWalletLogin } from "@/hooks/useWalletLogin";
import { useToast } from "@/hooks/use-toast";
import { ROUTES } from "@/routes";
import { Wallet, Chrome, Lock } from "lucide-react";

export default function Login() {
  const { theme } = useTheme();
  const [, setLocation] = useLocation();
  const { address, isConnected } = useAccount();
  const { loginWithWallet, isPending: isWalletLoginPending } = useWalletLogin();
  const { toast } = useToast();


  const handleWalletLogin = async () => {
    if (!isConnected) {
      toast({
        title: "请先连接钱包",
        description: "请先连接您的钱包，然后再进行登录",
        variant: "destructive",
      });
      return;
    }

    try {
      await loginWithWallet();
      setLocation(ROUTES.APP_DASHBOARD);
    } catch (error) {
      // Error handling is done in useWalletLogin hook
    }
  };

  return (
    <PageLayout>
      <Section>
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className={cn(
              'text-3xl md:text-4xl font-extrabold mb-3',
              theme === 'cyberpunk' ? 'font-orbitron' : 'font-fredoka'
            )}>
              Login
            </h1>
            <p className="text-sm opacity-70">
              登录到您的 ProofOfInfluence 账户
            </p>
          </div>

          <ThemedCard className="p-6 space-y-4">
            {/* 钱包登录 - 智能合并 Connect + Login */}
            <div className="space-y-3">
              {!isConnected ? (
                // 未连接：显示连接按钮
                <WalletConnectButton standalone />
              ) : (
                // 已连接：显示登录按钮
                <ThemedButton
                  onClick={handleWalletLogin}
                  emphasis
                  size="lg"
                  className="w-full"
                  disabled={isWalletLoginPending}
                >
                  {isWalletLoginPending ? (
                    "登录中..."
                  ) : (
                    <>
                      <Wallet className="w-4 h-4 mr-2" />
                      用钱包登录
                    </>
                  )}
                </ThemedButton>
              )}
            </div>

            {/* 分隔线 */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className={cn(
                  'w-full border-t',
                  theme === 'cyberpunk' ? 'border-cyan-400/20' : 'border-slate-200'
                )} />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className={cn(
                  'px-2 bg-background',
                  theme === 'cyberpunk' ? 'text-cyan-400/60' : 'text-slate-500'
                )}>
                  或
                </span>
              </div>
            </div>

            {/* Web2 登录（以 Replit 为首） */}
            <ThemedButton
              onClick={() => { window.location.href = "/api/login"; }}
              size="lg"
              className="w-full"
              variant="outline"
            >
              <Chrome className="w-4 h-4 mr-2" />
              Web2 登录
            </ThemedButton>

            {/* 安全提示 */}
            <div className={cn(
              'mt-6 p-3 rounded-lg text-xs',
              theme === 'cyberpunk'
                ? 'bg-cyan-400/10 border border-cyan-400/30'
                : 'bg-blue-50 border border-blue-200'
            )}>
              <div className="flex items-start gap-2">
                <Lock className={cn(
                  'w-4 h-4 mt-0.5 flex-shrink-0',
                  theme === 'cyberpunk' ? 'text-cyan-400' : 'text-blue-600'
                )} />
                <div className="opacity-90">
                  您的登录信息经过加密保护。我们不会存储您的私钥。
                </div>
              </div>
            </div>

            {/* 注册链接 */}
            <div className="text-center text-xs opacity-70 pt-2">
              还没有账号？{" "}
              <a
                href={ROUTES.EARLY_BIRD}
                className={cn(
                  'font-semibold hover:underline',
                  theme === 'cyberpunk' ? 'text-cyan-400' : 'text-blue-600'
                )}
              >
                EarlyBird Access
              </a>
            </div>
          </ThemedCard>
        </div>
      </Section>
    </PageLayout>
  );
}
