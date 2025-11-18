/**
 * Persist Contract Address to JSON File
 * 
 * Utility function for .cjs deployment scripts to save contract addresses
 * to shared/contracts/*.json files
 */

const fs = require("fs");
const path = require("path");

/**
 * Mapping of contract names to output file names
 */
const OUTPUT_FILES = {
  TGESale: "poi_tge.json",
  ReferralRegistry: "referral_registry.json",
  AchievementBadges: "achievement_badges.json",
  ImmortalityBadge: "immortality_badge.json",
};

/**
 * Persist contract address to JSON file
 * 
 * @param {string} contractName - Name of the contract (must be in OUTPUT_FILES)
 * @param {string} address - Deployed contract address
 * @param {number} chainId - Chain ID (default: 84532 for Base Sepolia)
 * @param {string} network - Network name (default: "base-sepolia")
 * @param {object} additionalData - Optional additional data to include in JSON
 */
function persistContract(contractName, address, chainId = 84532, network = "base-sepolia", additionalData = {}) {
  const outputFileName = OUTPUT_FILES[contractName];
  if (!outputFileName) {
    throw new Error(`Unknown contract name: ${contractName}. Supported: ${Object.keys(OUTPUT_FILES).join(", ")}`);
  }

  // Read artifact to get ABI
  // Use process.cwd() to get project root, more reliable than __dirname
  const projectRoot = process.cwd();
  const artifactPath = path.join(projectRoot, "artifacts", "contracts", `${contractName}.sol`, `${contractName}.json`);
  if (!fs.existsSync(artifactPath)) {
    throw new Error(`Artifact not found: ${artifactPath}. Make sure the contract is compiled.`);
  }

  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  
  // Build payload
  const payload = {
    name: contractName,
    address: address,
    chainId: chainId,
    network: network,
    abi: artifact.abi,
    ...additionalData,
  };

  // Write to output file
  const outputPath = path.join(projectRoot, "shared", "contracts", outputFileName);
  const outputDir = path.dirname(outputPath);
  
  // Ensure directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2));
  console.log(`✅ Saved deployment metadata to ${outputPath}`);
  
  return outputPath;
}

module.exports = {
  persistContract,
  OUTPUT_FILES,
};

