// Chat-only RWA card used only inside ImmortalityChat as a compact asset card.
// 仅用于 ImmortalityChat 消息区域展示的 RWA 精简卡片组件。

import React from 'react';
import { ThemedButton } from '@/components/themed';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { useI18n } from '@/i18n';
import type { RwaItem } from '../../../../shared/types/rwa';
import { getRwaStatusBadgeClasses } from './rwaStatusUtils';

interface RwaChatCardProps {
  item: RwaItem;
  onPreview: () => void;   // 查看详情
  onRegister: () => void;  // 登记购买意向（前端逻辑）
}

export function RwaChatCard({ item, onPreview, onRegister }: RwaChatCardProps) {
  const { theme } = useTheme();
  const { t } = useI18n();
  
  const statusLabel = (status: RwaItem['status']) => {
    switch (status) {
      case 'PREPARING': return t('rwa.item.status.preparing');
      case 'OPEN': return t('rwa.item.status.open');
      case 'CLOSED': return t('rwa.item.status.closed');
      default: return status;
    }
  };
  
  return (
    <div className={cn(
      "border rounded-lg p-3 space-y-2 text-xs",
      theme === "cyberpunk" 
        ? "border-cyan-400/30 bg-cyan-400/5" 
        : "border-slate-200 bg-slate-50"
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-semibold text-sm">{item.name}</h4>
          <p className="text-xs opacity-70">{item.type} · {item.region}</p>
        </div>
        <span className={getRwaStatusBadgeClasses(item.status, theme === 'cyberpunk' ? 'cyberpunk' : 'default')}>
          {statusLabel(item.status)}
        </span>
      </div>
      
      <p className="text-xs opacity-80">{item.shortDescription}</p>
      
      <div className="flex gap-2 pt-1">
        <ThemedButton size="sm" variant="outline" onClick={onPreview}>
          {t('rwa.item.action.preview')}
        </ThemedButton>
        <ThemedButton size="sm" onClick={onRegister}>
          {t('rwa.item.action.registerInterest')}
        </ThemedButton>
      </div>
    </div>
  );
}

