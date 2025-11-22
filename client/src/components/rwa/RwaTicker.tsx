import React from "react";
import { useI18n } from "../../i18n";
import { useTheme } from "@/contexts/ThemeContext";
import type { RwaItem } from "@shared/rwa-types";
import { fetchRwaItems } from "../../lib/rwa/api";
import { cn } from "@/lib/utils";

export function RwaTicker() {
  const { t } = useI18n();
  const { theme } = useTheme();
  const [items, setItems] = React.useState<RwaItem[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetchRwaItems()
      .then(setItems)
      .catch(() => setError("load_failed"));
  }, []);

  if (error) {
    return null;
  }

  // Map RwaStatus to i18n keys
  const statusLabel = (status: RwaItem["status"]) => {
    switch (status) {
      case "PREPARING":
        return t("rwa.item.status.preparing");
      case "OPEN":
        return t("rwa.item.status.open");
      case "CLOSED":
        return t("rwa.item.status.closed");
      default:
        return "-";
    }
  };

  const emptyState = (
    <div className={cn(
        "flex items-center justify-center py-2 text-xs",
        theme === 'cyberpunk' ? "bg-slate-900/50 text-slate-400 border-b border-cyan-900/30" : "bg-slate-100 text-slate-500 border-b border-slate-200"
    )}>
      <span>{t("chat.rwaTicker.empty")}</span>
    </div>
  );

  if (!items || items.length === 0) {
    return emptyState;
  }

  return (
    <div className={cn(
        "relative overflow-hidden py-2 border-b select-none",
        theme === 'cyberpunk' ? "bg-slate-900/80 border-cyan-900/30" : "bg-slate-50 border-slate-200"
    )}>
      <div className="absolute left-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-r from-background to-transparent" />
      <div className="absolute right-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-l from-background to-transparent" />
      
      <div className="flex whitespace-nowrap animate-ticker">
        {/* Double the items for seamless loop */}
        {[...items, ...items].map((item, i) => (
          <div key={`${item.id}-${i}`} className="flex items-center mx-4 text-xs">
            <span className={cn(
                "font-bold mr-2",
                theme === 'cyberpunk' ? "text-cyan-400" : "text-blue-600"
            )}>[RWA]</span>
            <span className={cn(
                "font-medium mr-2",
                theme === 'cyberpunk' ? "text-slate-200" : "text-slate-700"
            )}>
              {item.shortName ?? item.name}
            </span>
            <span className="opacity-40 mr-2">·</span>
            <span className={cn(
                theme === 'cyberpunk' ? "text-green-400" : "text-green-600"
            )}>
              {statusLabel(item.status)}
            </span>
          </div>
        ))}
      </div>
      
      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker {
          animation: ticker 30s linear infinite;
        }
        .animate-ticker:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
