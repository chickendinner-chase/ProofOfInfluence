import type { RwaItem } from "@shared/rwa-types";
import { MOCK_RWA_ITEMS } from "@shared/rwa-mock";

export async function fetchRwaItems(): Promise<RwaItem[]> {
  // Simulating an API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_RWA_ITEMS);
    }, 500);
  });
}
