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

  const poiTokenAddr = process.env.POI_TOKEN_ADDRESS || process.env.POI_ADDRESS;
  const vaultAddr = process.env.VESTING_VAULT_ADDRESS;
  const airdropAddr = process.env.MERKLE_AIRDROP_ADDRESS;

  if (!poiTokenAddr) throw new Error("Missing POI_TOKEN_ADDRESS");
  if (!vaultAddr) throw new Error("Missing VESTING_VAULT_ADDRESS");
  if (!airdropAddr) throw new Error("Missing MERKLE_AIRDROP_ADDRESS");

  console.log(`Setup and Test Script`);
  console.log(`Deployer: ${wallet.address}`);
  console.log(`RPC: ${rpcUrl}`);
  console.log(`---\n`);

  // Load contract ABIs
  const fs = require("fs");
  const poiAbi = [
    "function balanceOf(address) view returns (uint256)",
    "function transfer(address, uint256) returns (bool)",
    "function approve(address, uint256) returns (bool)",
    "function allowance(address, address) view returns (uint256)"
  ];
  const airdropArtifact = JSON.parse(fs.readFileSync(
    path.join(__dirname, "../artifacts/contracts/MerkleAirdropDistributor.sol/MerkleAirdropDistributor.json"),
    "utf8"
  ));

  const poiToken = new ethers.Contract(poiTokenAddr, poiAbi, wallet);
  const airdrop = new ethers.Contract(airdropAddr, airdropArtifact.abi, wallet);

  // Step 1: Check POI token balance
  console.log(`Step 1: Checking POI token balance...`);
  const deployerBalance = await poiToken.balanceOf(wallet.address);
  console.log(`  Deployer POI balance: ${ethers.utils.formatUnits(deployerBalance, 18)} POI`);

  if (deployerBalance.eq(0)) {
    console.log(`  ⚠️  No POI tokens available. Need to mint or transfer POI first.`);
    return;
  }

  // Step 2: Set MerkleAirdropDistributor token
  console.log(`\nStep 2: Setting MerkleAirdropDistributor token...`);
  try {
    const currentToken = await airdrop.poiToken();
    if (currentToken.toLowerCase() === poiTokenAddr.toLowerCase()) {
      console.log(`  ✓ Token already set: ${currentToken}`);
    } else {
      console.log(`  Setting token to ${poiTokenAddr}...`);
      const tx = await airdrop.setToken(poiTokenAddr);
      console.log(`  Transaction sent: ${tx.hash}`);
      const receipt = await tx.wait();
      if (receipt.status === 1) {
        console.log(`  ✓ Token set successfully! Block: ${receipt.blockNumber}`);
      } else {
        throw new Error("Transaction failed");
      }
    }
  } catch (e) {
    console.error(`  ✗ Failed to set token: ${e.message || e}`);
    return;
  }

  // Step 3: Transfer POI to VestingVault
  console.log(`\nStep 3: Transferring POI to VestingVault...`);
  const vaultAmount = ethers.utils.parseEther("10000"); // 10,000 POI for testing
  
  if (deployerBalance.lt(vaultAmount)) {
    console.log(`  ⚠️  Insufficient balance. Need ${ethers.utils.formatUnits(vaultAmount, 18)} POI, have ${ethers.utils.formatUnits(deployerBalance, 18)} POI`);
    console.log(`  Using available balance instead...`);
    const availableAmount = deployerBalance.mul(90).div(100); // Use 90% of balance
    console.log(`  Transferring ${ethers.utils.formatUnits(availableAmount, 18)} POI to vault...`);
    
    try {
      const tx = await poiToken.transfer(vaultAddr, availableAmount);
      console.log(`  Transaction sent: ${tx.hash}`);
      const receipt = await tx.wait();
      if (receipt.status === 1) {
        console.log(`  ✓ Transferred successfully! Block: ${receipt.blockNumber}`);
      }
    } catch (e) {
      console.error(`  ✗ Transfer failed: ${e.message || e}`);
      return;
    }
  } else {
    try {
      const tx = await poiToken.transfer(vaultAddr, vaultAmount);
      console.log(`  Transaction sent: ${tx.hash}`);
      const receipt = await tx.wait();
      if (receipt.status === 1) {
        console.log(`  ✓ Transferred ${ethers.utils.formatUnits(vaultAmount, 18)} POI to vault! Block: ${receipt.blockNumber}`);
      }
    } catch (e) {
      console.error(`  ✗ Transfer failed: ${e.message || e}`);
      return;
    }
  }

  // Step 4: Verify vault balance
  console.log(`\nStep 4: Verifying vault balance...`);
  const vaultBalance = await poiToken.balanceOf(vaultAddr);
  console.log(`  Vault POI balance: ${ethers.utils.formatUnits(vaultBalance, 18)} POI`);

  // Step 5: Transfer POI to MerkleAirdropDistributor for testing
  console.log(`\nStep 5: Transferring POI to MerkleAirdropDistributor...`);
  const airdropAmount = ethers.utils.parseEther("5000"); // 5,000 POI for testing
  
  const remainingBalance = await poiToken.balanceOf(wallet.address);
  if (remainingBalance.lt(airdropAmount)) {
    console.log(`  ⚠️  Insufficient balance. Need ${ethers.utils.formatUnits(airdropAmount, 18)} POI, have ${ethers.utils.formatUnits(remainingBalance, 18)} POI`);
    const availableAmount = remainingBalance.mul(90).div(100);
    console.log(`  Transferring ${ethers.utils.formatUnits(availableAmount, 18)} POI to airdrop...`);
    
    try {
      const tx = await poiToken.transfer(airdropAddr, availableAmount);
      console.log(`  Transaction sent: ${tx.hash}`);
      const receipt = await tx.wait();
      if (receipt.status === 1) {
        console.log(`  ✓ Transferred successfully! Block: ${receipt.blockNumber}`);
      }
    } catch (e) {
      console.error(`  ✗ Transfer failed: ${e.message || e}`);
    }
  } else {
    try {
      const tx = await poiToken.transfer(airdropAddr, airdropAmount);
      console.log(`  Transaction sent: ${tx.hash}`);
      const receipt = await tx.wait();
      if (receipt.status === 1) {
        console.log(`  ✓ Transferred ${ethers.utils.formatUnits(airdropAmount, 18)} POI to airdrop! Block: ${receipt.blockNumber}`);
      }
    } catch (e) {
      console.error(`  ✗ Transfer failed: ${e.message || e}`);
    }
  }

  // Step 6: Verify airdrop balance
  console.log(`\nStep 6: Verifying airdrop balance...`);
  const airdropBalance = await poiToken.balanceOf(airdropAddr);
  console.log(`  Airdrop POI balance: ${ethers.utils.formatUnits(airdropBalance, 18)} POI`);

  console.log(`\n---`);
  console.log(`✅ Setup complete!`);
  console.log(`\nNext steps:`);
  console.log(`1. Run: node scripts/test-vesting.cjs`);
  console.log(`2. Run: node scripts/test-airdrop.cjs`);
  console.log(`3. Run: node scripts/test-early-bird.cjs`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

