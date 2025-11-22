export type RwaStatus = 'PREPARING' | 'OPEN' | 'CLOSED';

export interface RwaItem {
  id: string;               // e.g. "us-license-001"
  name: string;             // display name
  type: string;             // asset category label
  region: string;           // "USA", "Global", etc.
  chain: string | null;     // chain name, null if unknown
  minAllocation: string | null; // formatted, e.g. "$10,000", null if unknown
  status: RwaStatus;
  highlightTag?: string;    // e.g. "Core", "Tech", "Land"
  shortDescription: string; // short description for cards
  sortOrder: number;
}
