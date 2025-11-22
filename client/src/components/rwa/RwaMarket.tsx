import React from "react";
import { useI18n } from "../../i18n";
import { useTheme } from "@/contexts/ThemeContext";
import type { RwaItem } from "../../../../shared/types/rwa";
import { useRwaItems } from "../../hooks/useRwaItems";
import { cn } from "@/lib/utils";
import { ThemedCard } from "../themed";

export function RwaMarket() {
  const { t } = useI18n();
  const { theme } = useTheme();
  const { items, loading, error } = useRwaItems();

  if (loading) {
    return <div className="p-8 text-center">{t("rwa.market.loading")}</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{error.message}</div>;
  }

  if (items.length === 0) {
    return <div className="p-8 text-center">{t("rwa.market.empty")}</div>;
  }

  const dash = t("common.placeholder.dash") ?? "-";

  // Map RwaStatus to i18n keys
  const statusLabel = (status: RwaItem["status"]) => {
    switch (status) {
      case "PREPARING":
        return t("market.status.preparing");
      case "OPEN":
        return t("market.status.open");
      case "CLOSED":
        return t("market.status.closed");
      default:
        return dash;
    }
  };

  return (
    <section className="w-full max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className={cn(
            "text-3xl font-bold mb-2",
            theme === 'cyberpunk' ? "text-cyan-400 font-orbitron" : "text-slate-900 font-fredoka"
        )}>{t("market.listTitle")}</h1>
        <p className={cn(
            "text-lg",
            theme === 'cyberpunk' ? "text-slate-400 font-rajdhani" : "text-slate-600 font-poppins"
        )}>{t("market.listSubtitle")}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <ThemedCard key={item.id} className="flex flex-col h-full p-6" hover>
            <div className="flex justify-between items-start mb-4">
                {item.highlightTag && (
                    <span className={cn(
                        "text-xs px-2 py-1 rounded",
                        theme === 'cyberpunk' ? "bg-cyan-900/50 text-cyan-300 border border-cyan-700/50" : "bg-blue-100 text-blue-700"
                    )}>
                        {item.highlightTag}
                    </span>
                )}
                <span className={cn(
                    "text-xs font-bold uppercase",
                    theme === 'cyberpunk' ? "text-green-400" : "text-green-600"
                )}>
                    {statusLabel(item.status)}
                </span>
            </div>

            <h2 className={cn(
                "text-xl font-bold mb-2",
                theme === 'cyberpunk' ? "text-slate-100" : "text-slate-800"
            )}>{item.name}</h2>
            
            <div className={cn(
                "text-sm mb-6",
                theme === 'cyberpunk' ? "text-slate-400" : "text-slate-500"
            )}>
                {item.type}
            </div>

            <p className={cn(
                "text-sm mb-6 flex-grow",
                theme === 'cyberpunk' ? "text-slate-300" : "text-slate-600"
            )}>
                {item.shortDescription}
            </p>

            <div className="mt-auto space-y-3 pt-4 border-t border-slate-200/10">
              <div className="flex justify-between text-sm">
                <span className="opacity-60">Region</span>
                <span className="font-medium">{item.region}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="opacity-60">{t("rwa.item.field.chain")}</span>
                <span className="font-medium">{item.chain ?? dash}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="opacity-60">{t("rwa.item.field.minAllocation")}</span>
                <span className="font-medium">
                  {item.minAllocation ?? dash}
                </span>
              </div>
            </div>
          </ThemedCard>
        ))}
      </div>
    </section>
  );
}
