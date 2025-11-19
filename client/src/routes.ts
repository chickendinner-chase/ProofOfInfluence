/**
 * Route constants for ProofOfInfluence
 * 
 * All route paths should be defined here and imported throughout the application.
 * This prevents hardcoded paths and makes route changes easier to manage.
 */

/**
 * Main application routes
 */
export const ROUTES = {
  // Public pages
  HOME: "/",
  LOGIN: "/login",
  
  // TGE & Campaign routes
  TGE: "/tge",
  EARLY_BIRD: "/early-bird",
  REFERRAL: "/referral",
  AIRDROP: "/airdrop",
  
  // Content pages
  SOLUTIONS: "/solutions",
  TOKEN: "/token",
  ABOUT: "/about",
  USE_CASES: "/use-cases",
  
  // App routes (projectX structure)
  APP: "/app",
  APP_DASHBOARD: "/app",
  APP_SETTINGS: "/app/settings",
  APP_RECHARGE: "/app/recharge",
  APP_TRADE: "/app/trade",
  APP_RWA_MARKET: "/app/rwa-market",
  APP_IMMORTALITY: "/app/immortality",
  APP_DEV_CONTRACTS: "/app/dev-contracts",
  APP_DEV_TEST_SCENARIOS: "/app/dev/test-scenarios",
  
  // Payment
  PAYMENT_SUCCESS: "/payment-success",
} as const;

/**
 * Dynamic route patterns
 * These are used for routes with parameters
 */
export const DYNAMIC_ROUTES = {
  USER_PROFILE: "/:username",
} as const;

/**
 * Type for route values
 */
export type RoutePath = typeof ROUTES[keyof typeof ROUTES];

