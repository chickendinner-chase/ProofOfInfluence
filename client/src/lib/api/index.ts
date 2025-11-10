/**
 * API Entry Point
 * Switches between mock and real API based on environment variable
 */

import { realMarketApi } from './market';
import { realReserveApi } from './reserve';
import { realMerchantApi } from './merchant';

// Import mocks (will be created next)
// @ts-ignore - mocks will be created
import { mockMarketApi } from '../mocks/marketMock';
// @ts-ignore - mocks will be created
import { mockReserveApi } from '../mocks/reserveMock';
// @ts-ignore - mocks will be created  
import { mockMerchantApi } from '../mocks/merchantMock';

import type { MarketApiInterface, ReserveApiInterface, MerchantApiInterface } from './types';

// Check environment variable
// Default to mock in development, real in production
const USE_MOCK = import.meta.env.VITE_USE_MOCK_API !== 'false';

console.log(`[API] Using ${USE_MOCK ? 'MOCK' : 'REAL'} API`);

// Export APIs with environment-based switching
export const marketApi: MarketApiInterface = USE_MOCK ? mockMarketApi : realMarketApi;
export const reserveApi: ReserveApiInterface = USE_MOCK ? mockReserveApi : realReserveApi;
export const merchantApi: MerchantApiInterface = USE_MOCK ? mockMerchantApi : realMerchantApi;

// Re-export types for convenience
export * from './types';

