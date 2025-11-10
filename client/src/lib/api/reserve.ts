/**
 * Real Reserve Pool API Implementation
 * Connected with Codex backend (Admin only)
 */

import type { ReserveApiInterface } from './types';

export const realReserveApi: ReserveApiInterface = {
  async getPoolStatus() {
    const res = await fetch('/api/reserve-pool', {
      credentials: 'include',
    });
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Failed to fetch pool status' }));
      throw new Error(error.message || 'Failed to fetch pool status');
    }
    
    return res.json();
  },

  async getHistory(range) {
    const res = await fetch(`/api/reserve-pool/history?range=${range}`, {
      credentials: 'include',
    });
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Failed to fetch history' }));
      throw new Error(error.message || 'Failed to fetch history');
    }
    
    return res.json();
  },

  async executeBuyback(data) {
    const res = await fetch('/api/reserve-pool/buyback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Failed to execute buyback' }));
      throw new Error(error.message || 'Failed to execute buyback');
    }
    
    return res.json();
  },

  async withdrawFees(data) {
    const res = await fetch('/api/reserve-pool/withdraw', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Failed to withdraw fees' }));
      throw new Error(error.message || 'Failed to withdraw fees');
    }
    
    return res.json();
  },

  async getAnalytics() {
    const res = await fetch('/api/reserve-pool/analytics', {
      credentials: 'include',
    });
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Failed to fetch analytics' }));
      throw new Error(error.message || 'Failed to fetch analytics');
    }
    
    return res.json();
  },

  async getActivities() {
    const res = await fetch('/api/reserve-pool/activities', {
      credentials: 'include',
    });
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Failed to fetch activities' }));
      throw new Error(error.message || 'Failed to fetch activities');
    }
    
    return res.json();
  },
};

