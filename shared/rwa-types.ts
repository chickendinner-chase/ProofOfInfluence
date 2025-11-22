export type RwaType = "LICENSE" | "PATENT" | "LAND";

export type RwaStatus = "PREPARING" | "OPEN" | "CLOSED";

export interface RwaItem {
  id: string;                // "rwa_license_001"
  name: string;              // Display title
  shortName?: string;        // Short ticker text
  type: RwaType;
  chain?: string;            // "Ethereum", "Base", "Solana" etc., or undefined
  minAllocationUsd?: number; // Min allocation in USD, undefined if unknown
  expectedYieldApr?: number; // Annual percentage yield, undefined if unknown
  status: RwaStatus;
  // Meta
  highlightTag?: string;     // e.g. "First Batch", "Strategic", "Long-term"
  updatedAt: string;         // ISO Date string
}
