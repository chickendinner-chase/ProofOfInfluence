import React, { useState } from "react";
import { useLocation } from "wouter";
import { PageLayout } from "@/components/layout/PageLayout";
import { Section } from "@/components/layout/Section";
import { ThemedCard, ThemedButton, ThemedInput } from "@/components/themed";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import WalletConnectButton from "@/components/WalletConnectButton";
import {
  Mail,
  Lock,
  Wallet,
  Chrome,
  Apple,
  ArrowRight,
} from "lucide-react";

export default function Login() {
  const { theme } = useTheme();
  const [, setLocation] = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate login
    setTimeout(() => {
      setLoading(false);
      setLocation("/Immortality");
    }, 1500);
  };

  const socialLogins = [
    { id: "wallet", icon: Wallet, label: "Wallet", desc: "MetaMask / WalletConnect" },
    { id: "google", icon: Chrome, label: "Google", desc: "Sign in with Google" },
    { id: "apple", icon: Apple, label: "Apple", desc: "Sign in with Apple" },
  ];

  return (
    <PageLayout>
      <Section>
        <div className="max-w-5xl mx-auto">
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

          <div className="grid gap-6 md:grid-cols-2">
            {/* Email/Password Login */}
            <ThemedCard className="p-6">
              <h3 className={cn(
                'text-lg font-bold mb-4',
                theme === 'cyberpunk' ? 'font-rajdhani text-cyan-200' : 'font-poppins text-slate-900'
              )}>
                账号登录
              </h3>

              <form onSubmit={handleEmailLogin} className="space-y-4">
                <ThemedInput
                  type="email"
                  label="邮箱地址"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <ThemedInput
                  type="password"
                  label="密码"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className={cn(
                        'rounded',
                        theme === 'cyberpunk'
                          ? 'border-cyan-400/30'
                          : 'border-slate-300'
                      )}
                    />
                    <span>记住我</span>
                  </label>
                  <a
                    href="#"
                    className={cn(
                      'hover:underline',
                      theme === 'cyberpunk' ? 'text-cyan-400' : 'text-blue-600'
                    )}
                  >
                    忘记密码？
                  </a>
                </div>

                <ThemedButton
                  type="submit"
                  emphasis
                  size="lg"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? "登录中..." : "登录"}
                  {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
                </ThemedButton>

                <div className="text-center text-xs opacity-70">
                  还没有账号？{" "}
                  <a
                    href="/early-bird"
                    className={cn(
                      'font-semibold hover:underline',
                      theme === 'cyberpunk' ? 'text-cyan-400' : 'text-blue-600'
                    )}
                  >
                    立即注册
                  </a>
                </div>
              </form>
            </ThemedCard>

            {/* Web3 / Social Login */}
            <ThemedCard className="p-6">
              <h3 className={cn(
                'text-lg font-bold mb-4',
                theme === 'cyberpunk' ? 'font-rajdhani text-cyan-200' : 'font-poppins text-slate-900'
              )}>
                快速登录
              </h3>

              <div className="space-y-3">
                {/* Wallet Connect */}
                <div>
                  <WalletConnectButton />
                </div>

                {/* Social Logins */}
                {socialLogins.slice(1).map((social) => {
                  const Icon = social.icon;
                  return (
                    <button
                      key={social.id}
                      onClick={() => {
                        if (social.id === "google" || social.id === "apple") {
                          // TODO: Hook up to actual OAuth when enabled
                          window.location.href = "/api/login"; // fallback to Replit OIDC for now
                          return;
                        }
                      }}
                      className={cn(
                        'w-full flex items-center gap-3 p-4 rounded-lg transition-all text-left',
                        theme === 'cyberpunk'
                          ? 'border border-cyan-400/30 hover:bg-cyan-400/10 hover:border-cyan-400/50'
                          : 'border border-slate-200 hover:bg-slate-50 hover:shadow-md'
                      )}
                    >
                      <Icon className="w-6 h-6" />
                      <div>
                        <div className="font-semibold">{social.label}</div>
                        <div className="text-xs opacity-70">{social.desc}</div>
                      </div>
                    </button>
                  );
                })}

                {/* Replit Auth explicit button */}
                <button
                  onClick={() => { window.location.href = "/api/login"; }}
                  className={cn(
                    'w-full flex items-center gap-3 p-4 rounded-lg transition-all text-left',
                    theme === 'cyberpunk'
                      ? 'border border-cyan-400/30 hover:bg-cyan-400/10 hover:border-cyan-400/50'
                      : 'border border-slate-200 hover:bg-slate-50 hover:shadow-md'
                  )}
                >
                  <Chrome className="w-6 h-6" />
                  <div>
                    <div className="font-semibold">Replit Auth</div>
                    <div className="text-xs opacity-70">使用 Replit 账号登录</div>
                  </div>
                </button>
              </div>

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
            </ThemedCard>
          </div>
        </div>
      </Section>
    </PageLayout>
  );
}
