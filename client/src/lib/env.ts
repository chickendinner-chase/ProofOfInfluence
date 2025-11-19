/**
 * Environment detection utilities
 */

export function isDevEnvironment(): boolean {
  if (typeof window === "undefined") return false;
  return import.meta.env.DEV || import.meta.env.MODE === "development";
}

export function isProductionEnvironment(): boolean {
  return import.meta.env.PROD || import.meta.env.MODE === "production";
}
