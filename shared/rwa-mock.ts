import type { RwaItem } from "./rwa-types";

export const MOCK_RWA_ITEMS: RwaItem[] = [
  {
    id: "rwa_license_us_reg_001",
    name: "美国监管行业商业许可资产包",
    shortName: "US License Bundle",
    type: "LICENSE",
    chain: undefined,
    minAllocationUsd: undefined,
    expectedYieldApr: undefined,
    status: "PREPARING",
    highlightTag: "首批资产",
    updatedAt: "2025-01-01T00:00:00.000Z"
  },
  {
    id: "rwa_patent_material_001",
    name: "高精度材料学与表面工程专利包",
    shortName: "Material Patent",
    type: "PATENT",
    chain: undefined,
    minAllocationUsd: undefined,
    expectedYieldApr: undefined,
    status: "PREPARING",
    highlightTag: "技术类",
    updatedAt: "2025-01-01T00:00:00.000Z"
  },
  {
    id: "rwa_land_us_agri_001",
    name: "美国农业大州非住宅农业用地",
    shortName: "US Agri Land",
    type: "LAND",
    chain: undefined,
    minAllocationUsd: undefined,
    expectedYieldApr: undefined,
    status: "PREPARING",
    highlightTag: "土地类",
    updatedAt: "2025-01-01T00:00:00.000Z"
  }
];
