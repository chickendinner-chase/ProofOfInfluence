import React from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Section } from "@/components/layout/Section";
import { ThemedCard, ThemedButton } from "@/components/themed";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { Briefcase, Clock, ArrowRight } from "lucide-react";
import { ROUTES } from "@/routes";
import { Link } from "wouter";

/**
 * RWA Market Placeholder Page
 * 
 * This is a placeholder page for the RWA (Real World Assets) Market feature.
 * The full implementation will be added soon.
 */
export default function RWAMarket() {
  const { theme } = useTheme();

  return (
    <PageLayout>
      <Section className="pt-12">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className={cn(
              "w-24 h-24 rounded-full flex items-center justify-center",
              theme === "cyberpunk"
                ? "bg-cyan-400/20 border-2 border-cyan-400/30"
                : "bg-blue-100 border-2 border-blue-200"
            )}>
              <Briefcase className={cn(
                "w-12 h-12",
                theme === "cyberpunk" ? "text-cyan-400" : "text-blue-600"
              )} />
            </div>
          </div>

          {/* Title */}
          <h1 className={cn(
            "text-3xl md:text-4xl font-bold",
            theme === "cyberpunk"
              ? "font-orbitron text-cyan-100"
              : "font-fredoka text-slate-900"
          )}>
            RWA 市场
          </h1>

          {/* Subtitle */}
          <p className={cn(
            "text-base md:text-lg opacity-80 max-w-2xl mx-auto",
            theme === "cyberpunk" ? "text-slate-300 font-rajdhani" : "text-slate-600 font-poppins"
          )}>
            RWA（Real World Assets）市场功能正在开发中，即将上线
          </p>

          {/* Coming Soon Badge */}
          <div className="flex justify-center">
            <div className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold",
              theme === "cyberpunk"
                ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                : "bg-yellow-100 text-yellow-700 border border-yellow-200"
            )}>
              <Clock className="w-4 h-4" />
              即将推出
            </div>
          </div>

          {/* Info Card */}
          <ThemedCard className="p-6 mt-8">
            <div className="space-y-4 text-left">
              <h3 className={cn(
                "text-lg font-semibold",
                theme === "cyberpunk" ? "font-rajdhani text-cyan-200" : "font-poppins text-slate-900"
              )}>
                关于 RWA 市场
              </h3>
              <p className="text-sm opacity-80">
                RWA 市场将提供真实世界资产（Real World Assets）的交易功能，包括但不限于：
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm opacity-80 ml-4">
                <li>房地产代币化资产交易</li>
                <li>商品期货合约</li>
                <li>债券和固定收益产品</li>
                <li>其他链上化传统资产</li>
              </ul>
            </div>
          </ThemedCard>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <ThemedButton asChild emphasis>
              <Link href={ROUTES.APP_DASHBOARD}>
                返回仪表盘
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </ThemedButton>
            <ThemedButton asChild variant="outline">
              <Link href={ROUTES.APP_TRADE}>
                查看现货交易
              </Link>
            </ThemedButton>
          </div>
        </div>
      </Section>
    </PageLayout>
  );
}

