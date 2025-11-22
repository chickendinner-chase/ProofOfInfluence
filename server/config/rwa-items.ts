import type { RwaItem } from '../../shared/types/rwa';

export const RWA_ITEMS: RwaItem[] = [
  {
    id: 'us-reg-license-001',
    name: 'US Regulated Industry License Package',
    type: 'Regulated business license bundle',
    region: 'USA',
    chain: null,
    minAllocation: null,
    status: 'PREPARING',
    highlightTag: 'Core RWA',
    shortDescription:
      'A bundle of commercial licenses and compliance-related rights in regulated US industries, focused on sectors such as logistics and agriculture.',
    sortOrder: 1,
  },
  {
    id: 'hi-precision-patent-001',
    name: 'High-Precision Material & Surface Engineering IP',
    type: 'Technology IP bundle',
    region: 'Global',
    chain: null,
    minAllocation: null,
    status: 'PREPARING',
    highlightTag: 'Tech RWA',
    shortDescription:
      'A package of material science and surface engineering patents targeting aerospace, energy equipment, semiconductors and medical devices.',
    sortOrder: 2,
  },
  {
    id: 'us-agri-land-001',
    name: 'US Non-Residential Agricultural Land',
    type: 'Agricultural land',
    region: 'USA',
    chain: null,
    minAllocation: null,
    status: 'PREPARING',
    highlightTag: 'Land RWA',
    shortDescription:
      'Non-residential agricultural land in a major US agricultural state, targeting long-term yield from leasing and revenue sharing.',
    sortOrder: 3,
  },
];
