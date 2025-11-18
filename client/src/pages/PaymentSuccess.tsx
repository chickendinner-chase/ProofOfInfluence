import React from "react";
import { Link } from "wouter";
import { PageLayout } from "@/components/layout/PageLayout";
import { Section } from "@/components/layout/Section";
import { ThemedCard, ThemedButton } from "@/components/themed";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/routes";
import {
  CheckCircle2,
  ArrowRight,
  Download,
  Share2,
  Home,
} from "lucide-react";

export default function PaymentSuccess() {
  const { theme } = useTheme();

  // Example transaction data (would come from URL params or state)
  const transaction = {
    amount: "$100.00",
    poiReceived: "95.8 POI",
    transactionId: "0x1234...5678",
    timestamp: new Date().toLocaleString(),
  };

  return (
    <PageLayout>
      <Section>
        <div className="max-w-2xl mx-auto">
          {/* Success Icon */}
          <div className="text-center mb-8">
            <div className={cn(
              'mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4',
              theme === 'cyberpunk'
                ? 'bg-green-400/20 ring-4 ring-green-400/20'
                : 'bg-green-100 ring-4 ring-green-200'
            )}>
              <CheckCircle2 className={cn(
                'w-12 h-12',
                theme === 'cyberpunk' ? 'text-green-400' : 'text-green-600'
              )} />
            </div>

            <h1 className={cn(
              'text-3xl font-bold mb-2',
              theme === 'cyberpunk' ? 'font-orbitron text-cyan-100' : 'font-fredoka text-slate-900'
            )}>
              Payment Successful!
            </h1>
            <p className="text-sm opacity-70">
              您的充值已成功处理
            </p>
          </div>

          {/* Transaction Details */}
          <ThemedCard className="p-6 mb-6">
            <h3 className={cn(
              'text-lg font-bold mb-4',
              theme === 'cyberpunk' ? 'font-rajdhani text-cyan-200' : 'font-poppins text-slate-900'
            )}>
              交易详情
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between py-2">
                <span className="text-sm opacity-70">充值金额</span>
                <span className="font-semibold">{transaction.amount}</span>
              </div>

              <div className="flex justify-between py-2">
                <span className="text-sm opacity-70">到账金额</span>
                <span className={cn(
                  'text-lg font-bold',
                  theme === 'cyberpunk' ? 'text-green-400' : 'text-green-600'
                )}>
                  {transaction.poiReceived}
                </span>
              </div>

              <div className={cn(
                'border-t pt-3',
                theme === 'cyberpunk' ? 'border-cyan-400/20' : 'border-slate-200'
              )}>
                <div className="flex justify-between text-xs mb-2">
                  <span className="opacity-70">交易 ID</span>
                  <span className="font-mono">{transaction.transactionId}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="opacity-70">时间</span>
                  <span>{transaction.timestamp}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <ThemedButton variant="outline" size="sm" className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                下载收据
              </ThemedButton>
              <ThemedButton variant="outline" size="sm" className="flex-1">
                <Share2 className="w-4 h-4 mr-2" />
                分享
              </ThemedButton>
            </div>
          </ThemedCard>

          {/* Next Steps */}
          <ThemedCard className="p-6 mb-6">
            <h3 className={cn(
              'text-lg font-bold mb-4',
              theme === 'cyberpunk' ? 'font-rajdhani text-cyan-200' : 'font-poppins text-slate-900'
            )}>
              下一步
            </h3>

            <div className="space-y-3">
              <Link href={ROUTES.APP_TRADE}>
                <ThemedButton emphasis className="w-full justify-between">
                  <span>前往交易市场</span>
                  <ArrowRight className="w-4 h-4" />
                </ThemedButton>
              </Link>

              <Link href="/app">
                <ThemedButton variant="outline" className="w-full justify-between">
                  <span>查看我的 Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </ThemedButton>
              </Link>

              <Link href="/">
                <ThemedButton variant="ghost" className="w-full justify-center">
                  <Home className="w-4 h-4 mr-2" />
                  返回首页
                </ThemedButton>
              </Link>
            </div>
          </ThemedCard>

          {/* Confirmation Note */}
          <div className={cn(
            'text-center text-xs opacity-70',
            theme === 'cyberpunk' ? 'font-rajdhani' : 'font-poppins'
          )}>
            确认邮件已发送到您的邮箱。代币将在 5-10 分钟内到账。
          </div>
        </div>
      </Section>
    </PageLayout>
  );
}
