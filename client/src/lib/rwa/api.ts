import type { RwaItem } from "../../../../shared/types/rwa";

// Note: This file is currently not used - useRwaItems hook fetches from /api/rwa/items directly
// Keeping for potential future use
export async function fetchRwaItems(): Promise<RwaItem[]> {
  // Simulating an API call
  return new Promise((resolve) => {
    setTimeout(() => {
      // Return empty array as this is not currently used
      resolve([]);
    }, 500);
  });
}
