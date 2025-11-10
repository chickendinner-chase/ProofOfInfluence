/**
 * Real Merchant API Implementation
 * To be connected with Codex backend
 */

import type { MerchantApiInterface } from './types';

export const realMerchantApi: MerchantApiInterface = {
  async getProducts() {
    const res = await fetch('/api/merchant/products');
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  },

  async createProduct(data) {
    const res = await fetch('/api/merchant/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create product');
    return res.json();
  },

  async updateProduct(id, data) {
    const res = await fetch(`/api/merchant/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update product');
    return res.json();
  },

  async deleteProduct(id) {
    const res = await fetch(`/api/merchant/products/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete product');
    return res.json();
  },

  async getOrders() {
    const res = await fetch('/api/merchant/orders');
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
  },

  async getOrderById(id) {
    const res = await fetch(`/api/merchant/orders/${id}`);
    if (!res.ok) throw new Error('Failed to fetch order');
    return res.json();
  },

  async updateOrderStatus(id, status) {
    const res = await fetch(`/api/merchant/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update order status');
    return res.json();
  },

  async getTaxReports() {
    const res = await fetch('/api/merchant/tax-reports');
    if (!res.ok) throw new Error('Failed to fetch tax reports');
    return res.json();
  },

  async generateTaxReport(data) {
    const res = await fetch('/api/merchant/tax-reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to generate tax report');
    return res.json();
  },

  async downloadTaxReport(id) {
    const res = await fetch(`/api/merchant/tax-reports/${id}/download`);
    if (!res.ok) throw new Error('Failed to download tax report');
    return res.blob();
  },

  async getAnalytics() {
    const res = await fetch('/api/merchant/analytics');
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
  },
};

