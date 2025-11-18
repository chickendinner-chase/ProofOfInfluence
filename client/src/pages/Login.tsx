import React from "react";
import { useLocation } from "wouter";
import { useAccount } from "wagmi";
import { useAppKit } from '@reown/appkit/react';
import { useQueryClient } from "@tanstack/react-query";
import { PageLayout } from "@/components/layout/PageLayout";
import { Section } from "@/components/layout/Section";
import { ThemedCard, ThemedButton } from "@/components/themed";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { useWalletLogin } from "@/hooks/useWalletLogin";
import { useToast } from "@/hooks/use-toast";
import { ROUTES } from "@/routes";
import { Wallet, Chrome, Lock, Apple, MessageCircle, Instagram } from "lucide-react";

export default function Login() {
  const { theme } = useTheme();
  const [, setLocation] = useLocation();
  const { address, isConnected } = useAccount();
  const { open } = useAppKit();
  const { loginWithWallet, isPending: isWalletLoginPending } = useWalletLogin();
  const { toast } = useToast();
  const queryClient = useQueryClient();


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
      // 等待认证状态更新完成（确保 Header 能正确显示已登录状态）
      await queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });
      setLocation(ROUTES.APP_SETTINGS);
    } catch (error) {
      // Error handling is done in useWalletLogin hook
    }
  };

  // 统一的 OAuth 登录处理
  const handleOAuthLogin = (provider: string) => {
    window.location.href = `/api/auth/${provider}`;
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

          <ThemedCard className="p-6 space-y-3">
            {/* Web3 登录 - 钱包 */}
            <div className="space-y-3">
              {!isConnected ? (
                <button
                  onClick={() => open()}
                  type="button"
                  className={cn(
                    "w-full inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-all duration-200",
                    "px-6 py-4 text-lg", // 更大的高度，比 Web2 按钮高
                    theme === 'cyberpunk'
                      ? "bg-cyan-400/20 text-cyan-200 border border-cyan-400/50 hover:bg-cyan-400/30 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] rounded-md"
                      : "bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-lg rounded-full"
                  )}
                  data-testid="button-connect-wallet"
                >
                  <Wallet className="w-5 h-5" />
                  Connect Wallet
                </button>
              ) : (
                <ThemedButton
                  onClick={handleWalletLogin}
                  emphasis
                  size="lg"
                  className="w-full py-4" // 增加高度
                  disabled={isWalletLoginPending}
                >
                  {isWalletLoginPending ? (
                    "登录中..."
                  ) : (
                    <>
                      <Wallet className="w-5 h-5 mr-2" />
                      用钱包登录
                    </>
                  )}
                </ThemedButton>
              )}
            </div>

            {/* 分隔线 */}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className={cn(
                  'w-full border-t',
                  theme === 'cyberpunk' ? 'border-cyan-400/20' : 'border-slate-200'
                )} />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className={cn(
                  'px-3 bg-background',
                  theme === 'cyberpunk' ? 'text-cyan-400/60' : 'text-slate-500'
                )}>
                  Web2 登录
                </span>
              </div>
            </div>

            {/* Web2 登录按钮组 */}
            <div className="space-y-3">
              {/* Replit 登录 */}
              <ThemedButton
                onClick={() => handleOAuthLogin('replit')}
                size="lg"
                className="w-full"
                variant="outline"
              >
                <Chrome className="w-4 h-4 mr-2" />
                使用 Replit 登录
              </ThemedButton>

              {/* Google 登录 */}
              <ThemedButton
                onClick={() => handleOAuthLogin('google')}
                size="lg"
                className="w-full"
                variant="outline"
              >
                <Chrome className="w-4 h-4 mr-2" />
                使用 Google 登录
              </ThemedButton>

              {/* Apple 登录 */}
              <ThemedButton
                onClick={() => handleOAuthLogin('apple')}
                size="lg"
                className="w-full"
                variant="outline"
              >
                <Apple className="w-4 h-4 mr-2" />
                使用 Apple 登录
              </ThemedButton>

              {/* 小红书登录 */}
              <ThemedButton
                onClick={() => handleOAuthLogin('xiaohongshu')}
                size="lg"
                className="w-full"
                variant="outline"
              >
                <Instagram className="w-4 h-4 mr-2" />
                使用小红书登录
              </ThemedButton>

              {/* 微信登录 */}
              <ThemedButton
                onClick={() => handleOAuthLogin('wechat')}
                size="lg"
                className="w-full"
                variant="outline"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                使用微信登录
              </ThemedButton>
            </div>

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
