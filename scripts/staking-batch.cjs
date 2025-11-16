const path = require("path");
const envPath = path.resolve(__dirname, "../.env");
require("dotenv").config({ path: envPath });
const hre = require("hardhat");

const ERC20_ABI = [
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address,address) view returns (uint256)",
  "function approve(address,uint256) returns (bool)",
];

async function main() {
  const pk = process.env.PRIVATE_KEY || process.env.DEPLOYER_PRIVATE_KEY;
  if (!pk) throw new Error("Missing PRIVATE_KEY or DEPLOYER_PRIVATE_KEY");
  const wallet = new hre.ethers.Wallet(pk, hre.ethers.provider);

  const stakingAddr = process.env.STAKING_REWARDS_ADDRESS;
  const stakedTokenAddr = process.env.STAKED_TOKEN_ADDRESS || process.env.POI_ADDRESS;
  if (!stakingAddr || !stakedTokenAddr) throw new Error("Missing STAKING_REWARDS_ADDRESS or STAKED_TOKEN_ADDRESS/POI_ADDRESS");

  const stakeUnits = process.env.BATCH_STAKE_AMOUNT || "100";
  const iterations = parseInt(process.env.BATCH_STAKE_TIMES || "5", 10); // total 500 POI default

  const staking = await hre.ethers.getContractAt("StakingRewards", stakingAddr, wallet);
  const token = new hre.ethers.Contract(stakedTokenAddr, ERC20_ABI, wallet);
  const d = await token.decimals();
  const amount = hre.ethers.utils.parseUnits(stakeUnits, d);
  const total = amount.mul(iterations);

  const bal = await token.balanceOf(wallet.address);
  if (bal.lt(total)) throw new Error("Insufficient token balance for batch stake");

  console.log(`Batch staking ${stakeUnits} x ${iterations} ...`);
  let successCount = 0;
  for (let i = 0; i < iterations; i++) {
    let retryCount = 0;
    const maxRetries = 2;
    let staked = false;

    while (retryCount <= maxRetries && !staked) {
      try {
        // Ensure allowance for this leg (reset then set)
        let alw = await token.allowance(wallet.address, stakingAddr);
        if (alw.lt(amount)) {
          console.log(`[${i + 1}/${iterations}] Setting allowance...`);
          let txa = await token.approve(stakingAddr, 0).catch(() => null);
          if (txa) await txa.wait();
          txa = await token.approve(stakingAddr, amount).catch(async () => await token.approve(stakingAddr, amount, { gasLimit: 60000 }));
          console.log(`Approve[${i + 1}] tx: ${txa.hash}`);
          await txa.wait();
          // Wait after approve
          await new Promise(r => setTimeout(r, 2000));
        }

        // Stake with fallback gas limit and retry logic
        console.log(`[${i + 1}/${iterations}] Staking ${stakeUnits} POI${retryCount > 0 ? ` (retry ${retryCount}/${maxRetries})` : ""}...`);
        let txs = await staking.stake(amount).catch(async () => await staking.stake(amount, { gasLimit: 200000 }));
        console.log(`Stake[${i + 1}/${iterations}] tx: ${txs.hash}`);
        const receipt = await txs.wait();
        
        if (receipt.status === 1) {
          console.log(`✓ Stake[${i + 1}/${iterations}] confirmed in block ${receipt.blockNumber}`);
          successCount++;
          staked = true;
        } else {
          throw new Error(`Transaction reverted (status: ${receipt.status})`);
        }
      } catch (e) {
        retryCount++;
        if (retryCount > maxRetries) {
          console.error(`✗ Stake[${i + 1}/${iterations}] failed after ${maxRetries} retries: ${e.message || e}`);
          throw e;
        }
        console.warn(`⚠ Stake[${i + 1}/${iterations}] failed, retrying in 3s... (${retryCount}/${maxRetries})`);
        await new Promise(r => setTimeout(r, 3000));
      }
    }

    // Longer delay between successful stakes to avoid node issues
    if (i < iterations - 1) {
      await new Promise(r => setTimeout(r, 4000));
    }
  }

  console.log(`\n✓ Successfully staked ${successCount}/${iterations} batches`);

  // Final status
  const finalStakedBal = await staking.balanceOf(wallet.address);
  const finalTokenBal = await token.balanceOf(wallet.address);
  console.log(`\nFinal staked balance: ${hre.ethers.utils.formatUnits(finalStakedBal, d)} POI`);
  console.log(`Final token balance: ${hre.ethers.utils.formatUnits(finalTokenBal, d)} POI`);

  // Try claim at the end; if fail, just log (rewards会随时间线性增长)
  try {
    console.log("\nClaiming rewards ...");
    const earned = await staking.earned(wallet.address);
    console.log(`Earned rewards: ${hre.ethers.utils.formatUnits(earned, d)} POI`);
    if (earned.gt(0)) {
      // Check reward pool balance first
      const rewardToken = await hre.ethers.getContractAt("IERC20", await staking.rewardsToken());
      const poolBalance = await rewardToken.balanceOf(staking.address);
      console.log(`Reward pool balance: ${hre.ethers.utils.formatUnits(poolBalance, d)} POI`);
      
      if (poolBalance.lt(earned)) {
        console.warn(`⚠️  Warning: Pool balance (${hre.ethers.utils.formatUnits(poolBalance, d)}) < earned (${hre.ethers.utils.formatUnits(earned, d)}). Claim will fail.`);
      } else {
        // Try with increasing gas limits
        let tx;
        try {
          tx = await staking.getReward();
        } catch (e1) {
          console.log("getReward() failed, retrying with gasLimit=200000...");
          try {
            tx = await staking.getReward({ gasLimit: 200000 });
          } catch (e2) {
            console.log("getReward() failed again, retrying with gasLimit=300000...");
            tx = await staking.getReward({ gasLimit: 300000 });
          }
        }
        console.log("getReward tx:", tx.hash);
        const receipt = await tx.wait();
        if (receipt.status === 1) {
          console.log("✓ Rewards claimed successfully");
        } else {
          throw new Error(`Transaction reverted (status: ${receipt.status})`);
        }
      }
    } else {
      console.log("No rewards to claim yet");
    }
  } catch (e) {
    console.warn("getReward failed (non-fatal for batch test):", e.message || e);
    console.warn("This may be due to reward pool balance or period finish timing. Check with staking-status.cjs");
  }

  // Optional: withdraw (comment out if you want to keep staked)
  // console.log("\nWithdrawing total ...");
  // const stakedBal = await staking.balanceOf(wallet.address);
  // const tx = await staking.withdraw(stakedBal).catch(async () => await staking.withdraw(stakedBal, { gasLimit: 200000 }));
  // console.log("Withdraw tx:", tx.hash);
  // await tx.wait();

  console.log("Batch test done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


