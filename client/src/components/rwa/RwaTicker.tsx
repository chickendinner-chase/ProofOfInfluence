import React from 'react';
import type { RwaItem } from '../../../../shared/types/rwa';
import { useRwaItems } from '../../hooks/useRwaItems';
import { useI18n } from '../../i18n';

interface RwaTickerProps {
  onSelectItem?: (item: RwaItem) => void;
}

export function RwaTicker({ onSelectItem }: RwaTickerProps) {
  const { t } = useI18n();
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
    <div className="rwa-ticker border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm">
      <div className="px-3 py-1 flex items-center gap-3 overflow-hidden">
        <span className="text-xs font-medium text-slate-300">
          {t('market.ticker.title')}
        </span>
        <div className="rwa-ticker__marquee flex gap-4 whitespace-nowrap animate-marquee">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              className="rwa-ticker__item text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1"
              onClick={() => onSelectItem?.(item)}
            >
              <span className="font-semibold">{prefix}</span>
              <span>{item.name}</span>
              <span>·</span>
              <span className={`uppercase`}>
                {statusLabel(item.status)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
