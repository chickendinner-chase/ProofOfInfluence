export interface TierConfig {
  price: string; // USDC price per POI token (6 decimals)
  allocation: string; // POI token amount (18 decimals)
}

export interface PoiSaleDeploymentConfig {
  usdcAddress: string;
  treasury: string;
  saleOwner?: string;
  tokenAdmin?: string;
  initialPoiRecipient?: string;
  initialPoiSupply?: string;
  whitelistEnabled: boolean;
  merkleRoot: string;
  minContribution: string;
  maxContribution: string;
  startTime: number;
  endTime: number;
  tiers: TierConfig[];
}

export const saleConfig: PoiSaleDeploymentConfig = {
  usdcAddress: "0x0000000000000000000000000000000000000000",
  treasury: "0x0000000000000000000000000000000000000000",
  saleOwner: undefined,
  tokenAdmin: undefined,
  initialPoiRecipient: undefined,
  initialPoiSupply: "0",
  whitelistEnabled: false,
  merkleRoot: "0x0000000000000000000000000000000000000000000000000000000000000000",
  minContribution: "0",
  maxContribution: "0",
  startTime: 0,
  endTime: 0,
  tiers: [
    {
      price: "1000000",
      allocation: "100000000000000000000000"
    }
  ]
};
