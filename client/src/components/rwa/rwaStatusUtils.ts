import { cn } from '@/lib/utils';
import type { RwaItem } from '../../../../shared/types/rwa';

/**
 * Get badge styling classes for RWA status
 * Returns cyberpunk-themed colors for better visibility
 */
export function getRwaStatusBadgeClass(status: RwaItem['status']): string {
  switch (status) {
    case 'PREPARING':
      // Amber/yellow for preparing status - more prominent
      return 'text-amber-300 bg-amber-400/10 border border-amber-400/40';
    case 'OPEN':
      // Green for open status
      return 'text-emerald-300 bg-emerald-400/10 border border-emerald-400/40';
    case 'CLOSED':
      // Gray for closed status
      return 'text-slate-300 bg-slate-500/10 border border-slate-500/40';
    default:
      return 'text-slate-300 bg-slate-600/10 border border-slate-600/40';
  }
}

/**
 * Get badge styling classes for RWA status (light theme)
 * Returns light theme colors
 */
export function getRwaStatusBadgeClassLight(status: RwaItem['status']): string {
  switch (status) {
    case 'PREPARING':
      return 'text-amber-700 bg-amber-100 border border-amber-300';
    case 'OPEN':
      return 'text-emerald-700 bg-emerald-100 border border-emerald-300';
    case 'CLOSED':
      return 'text-slate-600 bg-slate-100 border border-slate-300';
    default:
      return 'text-slate-600 bg-slate-100 border border-slate-300';
  }
}

/**
 * Get combined badge classes based on theme
 */
export function getRwaStatusBadgeClasses(status: RwaItem['status'], theme: 'cyberpunk' | 'default' = 'cyberpunk'): string {
  const baseClasses = 'inline-flex items-center text-[10px] px-2 py-0.5 rounded-full uppercase font-medium';
  const statusClasses = theme === 'cyberpunk' 
    ? getRwaStatusBadgeClass(status)
    : getRwaStatusBadgeClassLight(status);
  return cn(baseClasses, statusClasses);
}

