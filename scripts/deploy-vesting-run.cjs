const path = require("path");
const envPath = path.resolve(__dirname, "../.env");
require("dotenv").config({ path: envPath });
const { ethers } = require("ethers");

async function main() {
  const pk = process.env.PRIVATE_KEY || process.env.DEPLOYER_PRIVATE_KEY;
  if (!pk) throw new Error("Missing PRIVATE_KEY or DEPLOYER_PRIVATE_KEY");
  
  const rpcUrl = process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org";
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(pk, provider);

  const tokenAddress = process.env.POI_TOKEN_ADDRESS || process.env.POI_ADDRESS;
  if (!tokenAddress) {
    throw new Error("POI_TOKEN_ADDRESS or POI_ADDRESS env var is required");
  }

  console.log(`Deploying VestingVault with ${wallet.address}`);
  console.log(`Token address: ${tokenAddress}`);
  console.log(`RPC: ${rpcUrl}`);

  // Load contract ABI and bytecode
  const fs = require("fs");
  const artifactPath = path.join(__dirname, "../artifacts/contracts/VestingVault.sol/VestingVault.json");
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  
  const Vault = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
  const vault = await Vault.deploy(tokenAddress, wallet.address);
  await vault.deployed();

  console.log(`✅ VestingVault deployed to ${vault.address}`);
  console.log(`Set in .env: VESTING_VAULT_ADDRESS=${vault.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

