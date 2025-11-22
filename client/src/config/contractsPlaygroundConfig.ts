/**
 * Contracts Playground Configuration
 * 
 * Centralized configuration for all deployed contracts used in the Contracts Playground.
 * Imports ABIs from shared/contracts/*.json and addresses from baseConfig.ts
 */

import poiTokenData from "@shared/contracts/poi.json";
import tgeSaleData from "@shared/contracts/poi_tge.json";
import stakingRewardsData from "@shared/contracts/staking_rewards.json";
import vestingVaultData from "@shared/contracts/vesting_vault.json";
import merkleAirdropData from "@shared/contracts/merkle_airdrop.json";
import earlyBirdAllowlistData from "@shared/contracts/early_bird_allowlist.json";
import referralRegistryData from "@shared/contracts/referral_registry.json";
import achievementBadgesData from "@shared/contracts/achievement_badges.json";
import immortalityBadgeData from "@shared/contracts/immortality_badge.json";

import {
  POI_TOKEN_ADDRESS,
  TGESALE_ADDRESS,
  STAKING_REWARDS_ADDRESS,
  VESTING_VAULT_ADDRESS,
  MERKLE_AIRDROP_ADDRESS,
  EARLY_BIRD_ALLOWLIST_ADDRESS,
  REFERRAL_REGISTRY_ADDRESS,
  ACHIEVEMENT_BADGES_ADDRESS,
  IMMORTALITY_BADGE_ADDRESS,
  BASE_EXPLORER,
} from "@/lib/baseConfig";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export interface ContractConfig {
  name: string;
  address: `0x${string}`;
  abi: readonly unknown[];
  explorerPath: "address" | "token";
  isConfigured: boolean;
}

export const CONTRACTS_CONFIG: Record<string, ContractConfig> = {
  poiToken: {
    name: "POI Token (ERC20)",
    address: POI_TOKEN_ADDRESS,
    abi: poiTokenData.abi as readonly unknown[],
    explorerPath: "token",
    isConfigured: POI_TOKEN_ADDRESS !== ZERO_ADDRESS,
  },
  tgeSale: {
    name: "TGE Sale",
    address: TGESALE_ADDRESS,
    abi: tgeSaleData.abi as readonly unknown[],
    explorerPath: "address",
    isConfigured: TGESALE_ADDRESS !== ZERO_ADDRESS,
  },
  stakingRewards: {
    name: "Staking Rewards",
    address: STAKING_REWARDS_ADDRESS,
    abi: stakingRewardsData.abi as readonly unknown[],
    explorerPath: "address",
    isConfigured: STAKING_REWARDS_ADDRESS !== ZERO_ADDRESS,
  },
  vestingVault: {
    name: "Vesting Vault",
    address: VESTING_VAULT_ADDRESS,
    abi: vestingVaultData.abi as readonly unknown[],
    explorerPath: "address",
    isConfigured: VESTING_VAULT_ADDRESS !== ZERO_ADDRESS,
  },
  merkleAirdrop: {
    name: "Merkle Airdrop Distributor",
    address: MERKLE_AIRDROP_ADDRESS,
    abi: merkleAirdropData.abi as readonly unknown[],
    explorerPath: "address",
    isConfigured: MERKLE_AIRDROP_ADDRESS !== ZERO_ADDRESS,
  },
  earlyBirdAllowlist: {
    name: "Early Bird Allowlist",
    address: EARLY_BIRD_ALLOWLIST_ADDRESS,
    abi: earlyBirdAllowlistData.abi as readonly unknown[],
    explorerPath: "address",
    isConfigured: EARLY_BIRD_ALLOWLIST_ADDRESS !== ZERO_ADDRESS,
  },
  referralRegistry: {
    name: "Referral Registry",
    address: REFERRAL_REGISTRY_ADDRESS,
    abi: referralRegistryData.abi as readonly unknown[],
    explorerPath: "address",
    isConfigured: REFERRAL_REGISTRY_ADDRESS !== ZERO_ADDRESS,
  },
  achievementBadges: {
    name: "Achievement Badges",
    address: ACHIEVEMENT_BADGES_ADDRESS,
    abi: achievementBadgesData.abi as readonly unknown[],
    explorerPath: "address",
    isConfigured: ACHIEVEMENT_BADGES_ADDRESS !== ZERO_ADDRESS,
  },
  immortalityBadge: {
    name: "Immortality Badge",
    address: IMMORTALITY_BADGE_ADDRESS,
    abi: immortalityBadgeData.abi as readonly unknown[],
    explorerPath: "address",
    isConfigured: IMMORTALITY_BADGE_ADDRESS !== ZERO_ADDRESS,
  },
} as const;

export { BASE_EXPLORER, ZERO_ADDRESS };

