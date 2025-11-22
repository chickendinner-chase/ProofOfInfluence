import React from 'react';
import type { RwaItem } from '../../../../shared/types/rwa';
import { ThemedButton, ThemedCard } from '@/components/themed';
import { useI18n } from '@/i18n';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { useLocation } from 'wouter';

interface RwaRecommendationCardProps {
  item: RwaItem;
  onPreview?: (itemId: string) => void;
  onBuy?: (itemId: string) => void;
}

export function RwaRecommendationCard({ item, onPreview, onBuy }: RwaRecommendationCardProps) {
  const { t } = useI18n();
  const { theme } = useTheme();
  const [, setLocation] = useLocation();

  const statusLabel = (status: RwaItem['status']) => {
    switch (status) {
      case 'PREPARING':
        return t('market.status.preparing');
      case 'OPEN':
        return t('market.status.open');
      case 'CLOSED':
        return t('market.status.closed');
      default:
        return status;
    }
  };

  const handlePreview = () => {
    if (onPreview) {
      onPreview(item.id);
    } else {
      setLocation(`/app/rwa-market/${item.id}`);
    }
  };

  const handleBuy = () => {
    if (onBuy) {
      onBuy(item.id);
    }
  };

  return (
    <ThemedCard className={cn(
      "p-4 mt-3",
      theme === "cyberpunk" ? "border-cyan-400/30 bg-cyan-400/5" : "border-slate-200 bg-slate-50"
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className={cn(
            "font-semibold text-sm mb-1",
            theme === "cyberpunk" ? "text-cyan-300" : "text-slate-800"
          )}>
            {item.name}
          </h3>
          <p className={cn(
            "text-xs mb-2",
            theme === "cyberpunk" ? "text-slate-400" : "text-slate-600"
          )}>
            {item.shortDescription}
          </p>
          <div className="flex items-center gap-2 text-xs">
            <span className={cn(
              "px-2 py-0.5 rounded",
              theme === "cyberpunk" ? "bg-green-900/50 text-green-300" : "bg-green-100 text-green-700"
            )}>
              {statusLabel(item.status)}
            </span>
            {item.region && (
              <span className={cn(
                "opacity-60",
                theme === "cyberpunk" ? "text-slate-400" : "text-slate-500"
              )}>
                {item.region}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <ThemedButton
          size="sm"
          variant="outline"
          onClick={handlePreview}
          className="text-xs flex-1"
        >
          Preview
        </ThemedButton>
        <ThemedButton
          size="sm"
          onClick={handleBuy}
          className="text-xs flex-1"
        >
          {t('immortality.rwa.quick_buy_prompt').replace('{{name}}', item.name)}
        </ThemedButton>
      </div>
    </ThemedCard>
  );
}
