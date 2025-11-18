/**
 * Tokenomics Configuration Loader
 * 
 * Loads and validates tokenomics configuration from tokenomics.config.json
 * Supports environment variable overrides
 */

const fs = require("fs");
const path = require("path");

const CONFIG_PATH = path.join(__dirname, "../tokenomics.config.json");

/**
 * Load tokenomics configuration from file
 */
function loadConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    console.warn(`⚠️  Config file not found: ${CONFIG_PATH}`);
    console.warn(`   Using default values. Consider creating tokenomics.config.json`);
    return getDefaultConfig();
  }

  try {
    const configContent = fs.readFileSync(CONFIG_PATH, "utf8");
    const config = JSON.parse(configContent);
    return validateAndMergeConfig(config);
  } catch (error) {
    console.error(`❌ Error loading config from ${CONFIG_PATH}:`, error.message);
    console.warn(`   Falling back to default values`);
    return getDefaultConfig();
  }
}

/**
 * Get default configuration
 */
function getDefaultConfig() {
  return {
    poiToken: {
      initialSupply: process.env.POI_INITIAL_SUPPLY || "1000000000",
    },
    tgeSale: {
      tiers: [
        { price: "2", amount: "500000" },
        { price: "3", amount: "250000" },
      ],
      minContribution: process.env.SALE_MIN_CONTRIBUTION || "0",
      maxContribution: process.env.SALE_MAX_CONTRIBUTION || "0",
      saleStart: process.env.SALE_START_TIMESTAMP ? parseInt(process.env.SALE_START_TIMESTAMP) : 0,
      saleEnd: process.env.SALE_END_TIMESTAMP ? parseInt(process.env.SALE_END_TIMESTAMP) : 0,
      whitelistEnabled: process.env.SALE_WHITELIST_ENABLED === "true",
      merkleRoot: process.env.SALE_MERKLE_ROOT || "0x0000000000000000000000000000000000000000000000000000000000000000",
    },
    vesting: {
      schedules: [],
    },
    stakingRewards: {
      rewardRate: process.env.STAKING_REWARD_RATE || "1000000000000000000",
      rewardsDuration: process.env.STAKING_REWARDS_DURATION ? parseInt(process.env.STAKING_REWARDS_DURATION) : 604800,
    },
    airdrop: {
      rounds: [],
    },
    earlyBird: {
      allocations: [],
    },
  };
}

/**
 * Validate and merge config with environment variable overrides
 */
function validateAndMergeConfig(config) {
  // POI Token
  const poiToken = {
    initialSupply: process.env.POI_INITIAL_SUPPLY || config.poiToken?.initialSupply || "1000000000",
  };

  // TGE Sale
  const tgeSale = {
    tiers: config.tgeSale?.tiers || [
      { price: "2", amount: "500000" },
      { price: "3", amount: "250000" },
    ],
    minContribution: process.env.SALE_MIN_CONTRIBUTION || config.tgeSale?.minContribution || "0",
    maxContribution: process.env.SALE_MAX_CONTRIBUTION || config.tgeSale?.maxContribution || "0",
    saleStart: process.env.SALE_START_TIMESTAMP ? parseInt(process.env.SALE_START_TIMESTAMP) : (config.tgeSale?.saleStart || 0),
    saleEnd: process.env.SALE_END_TIMESTAMP ? parseInt(process.env.SALE_END_TIMESTAMP) : (config.tgeSale?.saleEnd || 0),
    whitelistEnabled: process.env.SALE_WHITELIST_ENABLED !== undefined 
      ? process.env.SALE_WHITELIST_ENABLED === "true" 
      : (config.tgeSale?.whitelistEnabled || false),
    merkleRoot: process.env.SALE_MERKLE_ROOT || config.tgeSale?.merkleRoot || "0x0000000000000000000000000000000000000000000000000000000000000000",
  };

  // Vesting
  const vesting = {
    schedules: config.vesting?.schedules || [],
  };

  // Staking Rewards
  const stakingRewards = {
    rewardRate: process.env.STAKING_REWARD_RATE || config.stakingRewards?.rewardRate || "1000000000000000000",
    rewardsDuration: process.env.STAKING_REWARDS_DURATION 
      ? parseInt(process.env.STAKING_REWARDS_DURATION) 
      : (config.stakingRewards?.rewardsDuration || 604800),
  };

  // Airdrop
  const airdrop = {
    rounds: config.airdrop?.rounds || [],
  };

  // Early Bird
  const earlyBird = {
    allocations: config.earlyBird?.allocations || [],
  };

  return {
    poiToken,
    tgeSale,
    vesting,
    stakingRewards,
    airdrop,
    earlyBird,
  };
}

/**
 * Get POI Token configuration
 */
function getPOITokenConfig() {
  const config = loadConfig();
  return config.poiToken;
}

/**
 * Get TGE Sale configuration
 */
function getTGESaleConfig() {
  const config = loadConfig();
  return config.tgeSale;
}

/**
 * Get Vesting schedules
 */
function getVestingSchedules() {
  const config = loadConfig();
  return config.vesting.schedules.filter((s) => s.beneficiary && s.beneficiary.trim() !== "");
}

/**
 * Get Staking Rewards configuration
 */
function getStakingRewardsConfig() {
  const config = loadConfig();
  return config.stakingRewards;
}

/**
 * Get Airdrop rounds
 */
function getAirdropRounds() {
  const config = loadConfig();
  return config.airdrop.rounds.filter((r) => r.recipients && r.recipients.length > 0);
}

/**
 * Get Early Bird allocations
 */
function getEarlyBirdAllocations() {
  const config = loadConfig();
  return config.earlyBird.allocations.filter((a) => a.account && a.allocation);
}

module.exports = {
  loadConfig,
  getDefaultConfig,
  getPOITokenConfig,
  getTGESaleConfig,
  getVestingSchedules,
  getStakingRewardsConfig,
  getAirdropRounds,
  getEarlyBirdAllocations,
  CONFIG_PATH,
};

