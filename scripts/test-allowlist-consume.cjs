const path = require("path");
const envPath = path.resolve(__dirname, "../.env");
require("dotenv").config({ path: envPath });
const { ethers } = require("ethers");

async function main() {
  const pk = process.env.PRIVATE_KEY || process.env.DEPLOYER_PRIVATE_KEY;
  const rpcUrl = process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org";
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(pk, provider);

  const fs = require("fs");
  const artifact = JSON.parse(fs.readFileSync(
    path.join(__dirname, "../artifacts/contracts/EarlyBirdAllowlist.sol/EarlyBirdAllowlist.json"),
    "utf8"
  ));
  const allowlist = new ethers.Contract(process.env.EARLY_BIRD_ALLOWLIST_ADDRESS, artifact.abi, wallet);

  const testAllocation = ethers.utils.parseEther("1000");
  const consumeAmount = ethers.utils.parseEther("100");

  console.log("Testing EarlyBirdAllowlist consume...");
  console.log(`Account: ${wallet.address}`);
  console.log(`Allocation: ${ethers.utils.formatUnits(testAllocation, 18)} POI`);
  console.log(`Consume amount: ${ethers.utils.formatUnits(consumeAmount, 18)} POI`);

  try {
    console.log("\nCalling consume...");
    const tx = await allowlist.consume(wallet.address, testAllocation, consumeAmount, [], { gasLimit: 200000 });
    console.log(`Tx sent: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`✓ Consumed! Block: ${receipt.blockNumber}`);

    const remaining = await allowlist.remaining(wallet.address);
    console.log(`Remaining: ${ethers.utils.formatUnits(remaining, 18)} POI`);
  } catch (e) {
    console.error("Error:", e.message);
    if (e.error && e.error.data) {
      console.error("Revert data:", e.error.data);
    }
  }
}

main().catch(console.error);

