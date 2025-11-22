import React from 'react';
import type { RwaItem } from '../../../../shared/types/rwa';
import { useRwaItems } from '../../hooks/useRwaItems';
import { useI18n } from '../../i18n';
import { getRwaStatusBadgeClasses } from './rwaStatusUtils';
import { useTheme } from '@/contexts/ThemeContext';

interface RwaTickerProps {
  onSelectItem?: (item: RwaItem) => void;
}

export function RwaTicker({ onSelectItem }: RwaTickerProps) {
  const { t } = useI18n();
  const { theme } = useTheme();
  const { items, loading, error } = useRwaItems();

  if (loading || error || items.length === 0) {
    // ticker is optional, never block the chat
    return null;
  }

  const prefix = t('rwa.tickerPrefix'); // e.g. "[RWA]"

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

  return (
    <div className="rwa-ticker border-b border-cyan-500/40 bg-slate-950/80 backdrop-blur-sm">
      <div className="px-4 py-2 flex items-center gap-3 overflow-hidden">
        <span className="text-xs font-medium text-slate-300 whitespace-nowrap flex-shrink-0">
          {t('market.ticker.title')}
        </span>
        <div className="flex-1 overflow-hidden">
          <div className="rwa-ticker__marquee flex gap-4 whitespace-nowrap">
            {/* Duplicate items for seamless loop */}
            {[...items, ...items].map((item, idx) => (
              <button
                key={`${item.id}-${idx}`}
                type="button"
                className="
                  rwa-ticker__item
                  text-xs md:text-sm
                  text-slate-300
                  hover:text-white
                  transition-all
                  flex items-center gap-1.5
                  px-3 py-1.5
                  rounded-full
                  border border-cyan-500/20
                  hover:border-cyan-400/80
                  hover:shadow-[0_0_12px_rgba(34,211,238,0.6)]
                  hover:scale-[1.03]
                "
                onClick={() => onSelectItem?.(item)}
              >
                <span className="font-semibold text-cyan-400">{prefix}</span>
                <span>{item.name}</span>
                <span>·</span>
                <span className={getRwaStatusBadgeClasses(item.status, theme === 'cyberpunk' ? 'cyberpunk' : 'default')}>
                  {statusLabel(item.status)}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
