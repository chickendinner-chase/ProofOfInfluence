/**
 * Real Merchant API Implementation
 * Connected with Codex backend
 */

import type { MerchantApiInterface } from './types';

export const realMerchantApi: MerchantApiInterface = {
  async getProducts() {
    const res = await fetch('/api/merchant/products', {
      credentials: 'include',
    });
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Failed to fetch products' }));
      throw new Error(error.message || 'Failed to fetch products');
    }
    
    const data = await res.json();
    return data.products || [];
  },

  async createProduct(data) {
    const res = await fetch('/api/merchant/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        title: data.title,
        sku: data.sku,
        description: data.description,
        price: data.price.toString(),
        currency: data.currency || 'USDC',
        media: data.media,
        idempotencyKey: data.idempotencyKey,
        merchantId: data.merchantId,
      }),
    });
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Failed to create product' }));
      throw new Error(error.message || 'Failed to create product');
    }
    
    return res.json();
  },

  async updateProduct(id, data) {
    const updates: any = {};
    if (data.title) updates.title = data.title;
    if (data.description !== undefined) updates.description = data.description;
    if (data.price) updates.price = data.price.toString();
    if (data.media) updates.media = data.media;
    
    const res = await fetch(`/api/merchant/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(updates),
    });
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Failed to update product' }));
      throw new Error(error.message || 'Failed to update product');
    }
    
    return res.json();
  },

  async deleteProduct(id) {
    const res = await fetch(`/api/merchant/products/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Failed to delete product' }));
      throw new Error(error.message || 'Failed to delete product');
    }
    
    return res.json();
  },

  async getOrders() {
    const res = await fetch('/api/merchant/orders', {
      credentials: 'include',
    });
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Failed to fetch orders' }));
      throw new Error(error.message || 'Failed to fetch orders');
    }
    
    const data = await res.json();
    return data.orders || [];
  },

  async getOrderById(id) {
    const res = await fetch(`/api/merchant/orders/${id}`, {
      credentials: 'include',
    });
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Failed to fetch order' }));
      throw new Error(error.message || 'Failed to fetch order');
    }
    
    return res.json();
  },

  async updateOrderStatus(id, status, txRef) {
    const res = await fetch(`/api/merchant/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status, txRef }),
    });
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Failed to update order status' }));
      throw new Error(error.message || 'Failed to update order status');
    }
    
    return res.json();
  },

  async getTaxReports() {
    const res = await fetch('/api/merchant/tax-reports', {
      credentials: 'include',
    });
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Failed to fetch tax reports' }));
      throw new Error(error.message || 'Failed to fetch tax reports');
    }
    
    return res.json();
  },

  async generateTaxReport(data) {
    const res = await fetch('/api/merchant/tax-reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Failed to generate tax report' }));
      throw new Error(error.message || 'Failed to generate tax report');
    }
    
    return res.json();
  },

  async downloadTaxReport(id) {
    const res = await fetch(`/api/merchant/tax-reports/${id}/download`, {
      credentials: 'include',
    });
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Failed to download tax report' }));
      throw new Error(error.message || 'Failed to download tax report');
    }
    
    // Codex returns { url: string }, not Blob
    return res.json();
  },

  async getAnalytics() {
    const res = await fetch('/api/merchant/analytics', {
      credentials: 'include',
    });
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Failed to fetch analytics' }));
      throw new Error(error.message || 'Failed to fetch analytics');
    }
    
    return res.json();
  },
};

