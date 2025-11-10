/**
 * API Type Definitions
 * Aligned with docs/CODEX_API_SPEC.md
 */

// ============================================
// Market Types
// ============================================

export interface MarketOrder {
  id: string;
  side: 'buy' | 'sell';
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  amountOut?: string;
  feeBps: number;
  status: 'PENDING' | 'FILLED' | 'PARTIAL' | 'CANCELED' | 'FAILED';
  txRef?: string;
  route?: {
    type: string;
    exchange?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderRequest {
  side: 'buy' | 'sell';
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  idempotencyKey?: string;
}

export interface OrderbookEntry {
  price: string;
  amount: string;
}

export interface Orderbook {
  pair: string;
  bids: OrderbookEntry[];
  asks: OrderbookEntry[];
  updatedAt: string;
}

export interface MarketStats {
  pair: string;
  price: string;
  change24h: string;
  volume24h: string;
  high24h: string;
  low24h: string;
  tvl: string;
}

export interface Trade {
  price: string;
  amount: string;
  side: 'buy' | 'sell';
  timestamp: string;
}

export interface MarketOrdersResponse {
  orders: MarketOrder[];
  total: number;
  hasMore: boolean;
}

// ============================================
// Reserve Pool Types
// ============================================

export interface ReservePoolData {
  balances: Record<string, string>;
  totalFees7d: string;
  totalFees30d: string;
  totalBuyback: string;
  lastBuybackDate: string;
  nextBuybackScheduled: string;
}

export interface ReserveHistoryEntry {
  date: string;
  fees: number;
  buyback: number;
}

export interface ReserveHistoryData {
  range: '7d' | '30d' | '90d';
  data: ReserveHistoryEntry[];
}

export interface BuybackRequest {
  amountUSDC: string;
  minPOI: string;
}

export interface BuybackAction {
  actionId: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  amountUSDC: string;
  estimatedPOI?: string;
  createdAt: string;
}

export interface WithdrawRequest {
  amount: string;
  asset: string;
  to: string;
}

export interface ReserveAnalytics {
  avgMonthlyFees: number;
  avgBuybackRatio: number;
  totalFeesAllTime: number;
  totalBuybackAllTime: number;
}

export interface ReserveActivity {
  id: string;
  type: 'buyback' | 'withdraw' | 'rebalance';
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  details: Record<string, any>;
  createdAt: string;
}

// ============================================
// Merchant Types
// ============================================

export interface Product {
  id: string;
  merchantId: string;
  title: string;
  sku?: string;
  description?: string;
  price: number;
  currency: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  media?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  title: string;
  sku?: string;
  description?: string;
  price: number;
  currency?: string;
  media?: string[];
}

export interface MerchantOrder {
  id: string;
  productId: string;
  merchantId: string;
  buyerId?: string;
  amount: number;
  fee: number;
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'COMPLETED' | 'REFUNDED' | 'CANCELED';
  txRef?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaxReport {
  id: string;
  merchantId: string;
  periodStart: string;
  periodEnd: string;
  grossSales: number;
  platformFees: number;
  netAmount: number;
  taxableAmount?: number;
  fileUrl?: string;
  createdAt: string;
}

export interface GenerateTaxReportRequest {
  periodStart: string;
  periodEnd: string;
}

export interface MerchantAnalytics {
  thisWeek: {
    sales: string;
    orders: number;
    fees: string;
  };
  thisMonth: {
    sales: string;
    orders: number;
    fees: string;
  };
}

// ============================================
// API Interfaces
// ============================================

export interface MarketApiInterface {
  createOrder(data: CreateOrderRequest): Promise<MarketOrder>;
  getOrders(filters?: { status?: string; limit?: number; offset?: number }): Promise<MarketOrdersResponse>;
  getOrderById(id: string): Promise<MarketOrder>;
  updateOrder(id: string, data: Partial<CreateOrderRequest>): Promise<MarketOrder>;
  cancelOrder(id: string): Promise<MarketOrder>;
  getOrderbook(pair: string): Promise<Orderbook>;
  getTrades(pair: string, limit?: number): Promise<{ trades: Trade[] }>;
  getStats(pair: string): Promise<MarketStats>;
}

export interface ReserveApiInterface {
  getPoolStatus(): Promise<ReservePoolData>;
  getHistory(range: '7d' | '30d' | '90d'): Promise<ReserveHistoryData>;
  executeBuyback(data: BuybackRequest): Promise<BuybackAction>;
  withdrawFees(data: WithdrawRequest): Promise<BuybackAction>;
  getAnalytics(): Promise<ReserveAnalytics>;
  getActivities(): Promise<{ activities: ReserveActivity[] }>;
}

export interface MerchantApiInterface {
  getProducts(): Promise<Product[]>;
  createProduct(data: CreateProductRequest): Promise<Product>;
  updateProduct(id: string, data: Partial<CreateProductRequest>): Promise<Product>;
  deleteProduct(id: string): Promise<{ success: boolean }>;
  getOrders(): Promise<MerchantOrder[]>;
  getOrderById(id: string): Promise<MerchantOrder>;
  updateOrderStatus(id: string, status: MerchantOrder['status']): Promise<MerchantOrder>;
  getTaxReports(): Promise<TaxReport[]>;
  generateTaxReport(data: GenerateTaxReportRequest): Promise<TaxReport>;
  downloadTaxReport(id: string): Promise<Blob>;
  getAnalytics(): Promise<MerchantAnalytics>;
}

