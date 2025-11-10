/**
 * Reserve Pool Mock API
 * Simulates backend Reserve Pool API with realistic data
 */

import type {
  ReserveApiInterface,
  ReservePoolData,
  ReserveHistoryData,
  BuybackRequest,
  BuybackAction,
  WithdrawRequest,
  WithdrawResponse,
  ReserveAnalytics,
  ReserveActivity,
} from '../api/types';

// Mock pool data
let mockPoolData: ReservePoolData = {
  balances: {
    USDC: '50234.56',
    POI: '10458.23',
  },
  totalFees7d: '1247.82',
  totalFees30d: '5823.45',
  totalBuyback: '24567.89',
  lastBuybackDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  nextBuybackScheduled: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

// Mock activities
const mockActivities: ReserveActivity[] = [
  {
    id: '1',
    type: 'buyback',
    status: 'SUCCESS',
    details: {
      amountUSDC: '1000.00',
      amountPOI: '985.50',
      rate: '0.985',
    },
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    type: 'withdraw',
    status: 'SUCCESS',
    details: {
      amount: '5000.00',
      asset: 'USDC',
      to: '0x742d...5b9c',
    },
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    type: 'buyback',
    status: 'SUCCESS',
    details: {
      amountUSDC: '1500.00',
      amountPOI: '1478.25',
      rate: '0.985',
    },
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Generate mock history data
const generateHistoryData = (days: number) => {
  const data = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const baseFees = 150 + Math.random() * 100;
    const fees = Math.round(baseFees * 100) / 100;
    const buyback = Math.round(fees * 0.65 * 100) / 100;

    data.push({
      date: date.toISOString().split('T')[0],
      fees,
      buyback,
    });
  }

  return data;
};

// Helper to simulate async delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API implementation
export const mockReserveApi: ReserveApiInterface = {
  async getPoolStatus(): Promise<ReservePoolData> {
    await delay(300);

    // Add some dynamic variation
    const feeVariation = (Math.random() - 0.5) * 50;
    mockPoolData.balances.USDC = (parseFloat(mockPoolData.balances.USDC) + feeVariation).toFixed(2);

    return { ...mockPoolData };
  },

  async getHistory(range: '7d' | '30d' | '90d'): Promise<ReserveHistoryData> {
    await delay(400);

    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    const data = generateHistoryData(days);

    return {
      range,
      data,
    };
  },

  async executeBuyback(request: BuybackRequest): Promise<BuybackAction> {
    await delay(500);

    const amountUSDC = request.amountUSDC;
    const currentPrice = 0.985;
    const estimatedPOI = (parseFloat(amountUSDC) * currentPrice).toFixed(2);

    // Check balance
    if (parseFloat(amountUSDC) > parseFloat(mockPoolData.balances.USDC)) {
      throw new Error('Insufficient USDC balance');
    }

    // Check slippage
    if (parseFloat(estimatedPOI) < parseFloat(request.minPOI)) {
      throw new Error('Slippage too high');
    }

    const action: BuybackAction = {
      actionId: `buyback-${Date.now()}`,
      status: 'PENDING',
      amountUSDC,
      estimatedPOI,
      createdAt: new Date().toISOString(),
    };

    // Simulate execution
    setTimeout(() => {
      // Update balances
      mockPoolData.balances.USDC = (parseFloat(mockPoolData.balances.USDC) - parseFloat(amountUSDC)).toFixed(2);
      mockPoolData.balances.POI = (parseFloat(mockPoolData.balances.POI) + parseFloat(estimatedPOI)).toFixed(2);
      mockPoolData.totalBuyback = (parseFloat(mockPoolData.totalBuyback) + parseFloat(amountUSDC)).toFixed(2);
      mockPoolData.lastBuybackDate = new Date().toISOString();

      // Add activity
      mockActivities.unshift({
        id: action.actionId,
        type: 'buyback',
        status: 'SUCCESS',
        details: {
          amountUSDC,
          amountPOI: estimatedPOI,
          rate: currentPrice.toString(),
        },
        createdAt: new Date().toISOString(),
      });
    }, 2000);

    return action;
  },

  async withdrawFees(request: WithdrawRequest): Promise<WithdrawResponse> {
    await delay(500);

    const { amount, asset, to } = request;

    // Check balance
    if (parseFloat(amount) > parseFloat(mockPoolData.balances[asset] || '0')) {
      throw new Error(`Insufficient ${asset} balance`);
    }

    const actionId = `withdraw-${Date.now()}`;
    const response: WithdrawResponse = {
      actionId,
      status: 'PENDING',
      txRef: null,
      amount,
      asset: asset.toUpperCase(),
      createdAt: new Date().toISOString(),
    };

    // Simulate execution
    setTimeout(() => {
      // Update balance
      if (mockPoolData.balances[asset]) {
        mockPoolData.balances[asset] = (parseFloat(mockPoolData.balances[asset]) - parseFloat(amount)).toFixed(2);
      }

      // Add activity
      mockActivities.unshift({
        id: actionId,
        type: 'withdraw',
        status: 'SUCCESS',
        details: {
          amount,
          asset: asset.toUpperCase(),
          to,
        },
        createdAt: new Date().toISOString(),
      });
    }, 2000);

    return response;
  },

  async getAnalytics(): Promise<ReserveAnalytics> {
    await delay(300);

    return {
      avgMonthlyFees: 5823.45,
      avgBuybackRatio: 0.68,
      totalFeesAllTime: 125432.89,
      totalBuybackAllTime: 85294.37,
    };
  },

  async getActivities(): Promise<{ activities: ReserveActivity[] }> {
    await delay(200);

    return {
      activities: [...mockActivities],
    };
  },
};

