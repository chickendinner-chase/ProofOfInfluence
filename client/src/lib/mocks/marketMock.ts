/**
 * Market Mock API
 * Simulates backend Market API with realistic data
 */

import type {
  MarketApiInterface,
  MarketOrder,
  CreateOrderRequest,
  MarketOrdersResponse,
  Orderbook,
  MarketStats,
  Trade,
} from '../api/types';

// Mock data storage
let mockOrders: MarketOrder[] = [
  {
    id: '1',
    side: 'buy',
    tokenIn: 'USDC',
    tokenOut: 'POI',
    amountIn: '1000.00',
    amountOut: '1020.40',
    feeBps: 30,
    status: 'FILLED',
    txRef: '0x1234...5678',
    route: { type: 'uniswapx', exchange: 'uniswap' },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    side: 'sell',
    tokenIn: 'POI',
    tokenOut: 'USDC',
    amountIn: '500.00',
    amountOut: '495.50',
    feeBps: 30,
    status: 'FILLED',
    txRef: '0x8765...4321',
    route: { type: 'maker', exchange: 'coinbase' },
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    side: 'buy',
    tokenIn: 'USDC',
    tokenOut: 'POI',
    amountIn: '250.00',
    feeBps: 30,
    status: 'PENDING',
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    side: 'buy',
    tokenIn: 'USDC',
    tokenOut: 'POI',
    amountIn: '750.00',
    feeBps: 30,
    status: 'CANCELED',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Mock orderbook data
const mockOrderbookData: Orderbook = {
  pair: 'USDC-POI',
  bids: [
    { price: '0.990', amount: '1000.00' },
    { price: '0.985', amount: '2500.00' },
    { price: '0.980', amount: '5000.00' },
    { price: '0.975', amount: '3500.00' },
    { price: '0.970', amount: '2000.00' },
  ],
  asks: [
    { price: '1.010', amount: '1500.00' },
    { price: '1.015', amount: '3000.00' },
    { price: '1.020', amount: '4000.00' },
    { price: '1.025', amount: '2500.00' },
    { price: '1.030', amount: '1800.00' },
  ],
  updatedAt: new Date().toISOString(),
};

// Mock stats data
const mockStatsData: MarketStats = {
  pair: 'USDC-POI',
  price: '0.995',
  change24h: '+2.5%',
  volume24h: '125000.00',
  high24h: '1.020',
  low24h: '0.980',
  tvl: '500000.00',
};

// Mock trades history
const generateMockTrades = (limit: number): Trade[] => {
  const trades: Trade[] = [];
  const now = Date.now();
  
  for (let i = 0; i < Math.min(limit, 50); i++) {
    const basePrice = 0.995;
    const priceVariation = (Math.random() - 0.5) * 0.04;
    const price = (basePrice + priceVariation).toFixed(3);
    const amount = (Math.random() * 1000 + 100).toFixed(2);
    const side = Math.random() > 0.5 ? 'buy' : 'sell';
    const timestamp = new Date(now - i * 2 * 60 * 1000).toISOString();

    trades.push({ price, amount, side, timestamp });
  }

  return trades;
};

// Helper to simulate async delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API implementation
export const mockMarketApi: MarketApiInterface = {
  async createOrder(data: CreateOrderRequest): Promise<MarketOrder> {
    await delay(500); // Simulate network delay

    const newOrder: MarketOrder = {
      id: `${Date.now()}`,
      side: data.side,
      tokenIn: data.tokenIn,
      tokenOut: data.tokenOut,
      amountIn: data.amountIn,
      feeBps: 30, // Default 0.3%
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockOrders = [newOrder, ...mockOrders];

    // Simulate order filling after a delay
    setTimeout(() => {
      const order = mockOrders.find(o => o.id === newOrder.id);
      if (order && order.status === 'PENDING') {
        const rate = data.side === 'buy' ? 1.02 : 0.99;
        order.amountOut = (parseFloat(data.amountIn) * rate).toFixed(2);
        order.status = 'FILLED';
        order.txRef = `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 4)}`;
        order.route = {
          type: Math.random() > 0.5 ? 'uniswapx' : 'maker',
          exchange: Math.random() > 0.5 ? 'uniswap' : 'coinbase',
        };
        order.updatedAt = new Date().toISOString();
      }
    }, 3000);

    return newOrder;
  },

  async getOrders(filters = {}): Promise<MarketOrdersResponse> {
    await delay(300);

    let filteredOrders = [...mockOrders];

    // Apply status filter
    if (filters.status) {
      filteredOrders = filteredOrders.filter(o => o.status === filters.status);
    }

    // Sort by creation time (newest first)
    filteredOrders.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Apply pagination
    const limit = filters.limit || 20;
    const offset = filters.offset || 0;
    const paginatedOrders = filteredOrders.slice(offset, offset + limit);

    return {
      orders: paginatedOrders,
      total: filteredOrders.length,
      hasMore: offset + limit < filteredOrders.length,
    };
  },

  async getOrderById(id: string): Promise<MarketOrder> {
    await delay(200);

    const order = mockOrders.find(o => o.id === id);
    if (!order) {
      throw new Error('Order not found');
    }

    return order;
  },

  async updateOrder(id: string, data: Partial<CreateOrderRequest>): Promise<MarketOrder> {
    await delay(300);

    const order = mockOrders.find(o => o.id === id);
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status !== 'PENDING') {
      throw new Error('Can only update pending orders');
    }

    // Update order
    if (data.amountIn) {
      order.amountIn = data.amountIn;
    }
    order.updatedAt = new Date().toISOString();

    return order;
  },

  async cancelOrder(id: string): Promise<MarketOrder> {
    await delay(300);

    const order = mockOrders.find(o => o.id === id);
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status !== 'PENDING') {
      throw new Error('Can only cancel pending orders');
    }

    order.status = 'CANCELED';
    order.updatedAt = new Date().toISOString();

    return order;
  },

  async getOrderbook(pair: string): Promise<Orderbook> {
    await delay(200);

    // Add some price variation to make it look real-time
    const bids = mockOrderbookData.bids.map(bid => ({
      ...bid,
      price: (parseFloat(bid.price) + (Math.random() - 0.5) * 0.005).toFixed(3),
    }));

    const asks = mockOrderbookData.asks.map(ask => ({
      ...ask,
      price: (parseFloat(ask.price) + (Math.random() - 0.5) * 0.005).toFixed(3),
    }));

    return {
      pair,
      bids,
      asks,
      updatedAt: new Date().toISOString(),
    };
  },

  async getTrades(pair: string, limit = 50): Promise<{ trades: Trade[] }> {
    await delay(200);

    return {
      trades: generateMockTrades(limit),
    };
  },

  async getStats(pair: string): Promise<MarketStats> {
    await delay(200);

    // Add some dynamic variation
    const basePrice = 0.995;
    const priceVariation = (Math.random() - 0.5) * 0.01;
    const currentPrice = (basePrice + priceVariation).toFixed(3);

    const change = ((parseFloat(currentPrice) - basePrice) / basePrice * 100).toFixed(1);

    return {
      ...mockStatsData,
      pair,
      price: currentPrice,
      change24h: `${change >= '0' ? '+' : ''}${change}%`,
      updatedAt: new Date().toISOString(),
    };
  },
};

