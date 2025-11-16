const path = require("path");
const envPath = path.resolve(__dirname, "../.env");
require("dotenv").config({ path: envPath });
const hre = require("hardhat");

async function main() {
  const pk = process.env.PRIVATE_KEY || process.env.DEPLOYER_PRIVATE_KEY;
  if (!pk) throw new Error("Missing PRIVATE_KEY or DEPLOYER_PRIVATE_KEY");
  const wallet = new hre.ethers.Wallet(pk, hre.ethers.provider);

  const stakingAddr = process.env.STAKING_REWARDS_ADDRESS || "0xe23f7688303768BB1CE2e2a98540A0C1ba63ec2d";
  const stakedTokenAddr = process.env.STAKED_TOKEN_ADDRESS || process.env.POI_ADDRESS || "0x737869142C93078Dae4d78D4E8c5dbD45160565a";
  const rewardTokenAddr = process.env.REWARD_TOKEN_ADDRESS || process.env.POI_ADDRESS || "0x737869142C93078Dae4d78D4E8c5dbD45160565a";

  const staking = await hre.ethers.getContractAt("StakingRewards", stakingAddr, wallet);
  const stakedToken = await hre.ethers.getContractAt("IERC20", stakedTokenAddr);
  const rewardToken = await hre.ethers.getContractAt("IERC20", rewardTokenAddr);

  const userAddr = wallet.address;

  console.log(`Testing exit() for ${userAddr}`);
  console.log(`StakingRewards: ${stakingAddr}`);
  console.log(`Staked Token: ${stakedTokenAddr}`);
  console.log(`Reward Token: ${rewardTokenAddr}`);
  console.log(`---`);

  // Check before state
  const [
    userStakedBalance,
    userStakedTokenBalance,
    userRewardTokenBalance,
    earnedRewards,
    contractStakedBalance,
    contractRewardBalance,
    totalSupply
  ] = await Promise.all([
    staking.balanceOf(userAddr),
    stakedToken.balanceOf(userAddr),
    rewardToken.balanceOf(userAddr),
    staking.earned(userAddr),
    stakedToken.balanceOf(stakingAddr),
    rewardToken.balanceOf(stakingAddr),
    staking.totalSupply()
  ]);

  console.log(`Before exit:`);
  console.log(`  User staked balance: ${hre.ethers.utils.formatUnits(userStakedBalance, 18)} POI`);
  console.log(`  User staked token balance: ${hre.ethers.utils.formatUnits(userStakedTokenBalance, 18)} POI`);
  console.log(`  User reward token balance: ${hre.ethers.utils.formatUnits(userRewardTokenBalance, 18)} POI`);
  console.log(`  Earned rewards: ${hre.ethers.utils.formatUnits(earnedRewards, 18)} POI`);
  console.log(`  Contract staked balance: ${hre.ethers.utils.formatUnits(contractStakedBalance, 18)} POI`);
  console.log(`  Contract reward balance: ${hre.ethers.utils.formatUnits(contractRewardBalance, 18)} POI`);
  console.log(`  Total staked (totalSupply): ${hre.ethers.utils.formatUnits(totalSupply, 18)} POI`);
  console.log(`---`);

  if (userStakedBalance.eq(0)) {
    console.log("⚠️  No staked balance to exit. Need to stake first.");
    return;
  }

  if (earnedRewards.eq(0)) {
    console.log("⚠️  No rewards to claim, but will still test exit() to withdraw staked tokens.");
  }

  // Test exit
  try {
    console.log("Calling exit() (withdraws all staked + claims all rewards)...");
    let tx;
    try {
      tx = await staking.exit();
    } catch (e1) {
      console.log("exit() failed, retrying with gasLimit=300000...");
      try {
        tx = await staking.exit({ gasLimit: 300000 });
      } catch (e2) {
        console.log("Retry failed, trying with gasLimit=400000...");
        tx = await staking.exit({ gasLimit: 400000 });
      }
    }

    console.log(`Transaction sent: ${tx.hash}`);
    const receipt = await tx.wait();

    if (receipt.status === 1) {
      console.log(`✓ Success! Confirmed in block ${receipt.blockNumber}`);
      console.log(`  Gas used: ${receipt.gasUsed.toString()}`);
      console.log(`  Transaction logs: ${receipt.logs.length}`);

      // Check for events
      const stakingInterface = staking.interface;
      let withdrawnEvent = null;
      let rewardPaidEvent = null;
      
      for (const log of receipt.logs) {
        try {
          const parsed = stakingInterface.parseLog(log);
          if (parsed.name === "Withdrawn") {
            withdrawnEvent = parsed;
            console.log(`  ✓ Found Withdrawn event: user=${parsed.args.user}, amount=${hre.ethers.utils.formatUnits(parsed.args.amount, 18)} POI`);
          } else if (parsed.name === "RewardPaid") {
            rewardPaidEvent = parsed;
            console.log(`  ✓ Found RewardPaid event: user=${parsed.args.user}, reward=${hre.ethers.utils.formatUnits(parsed.args.reward, 18)} POI`);
          }
        } catch (e) {
          // Not a matching log
        }
      }

      if (!withdrawnEvent) {
        console.log(`  ⚠️  Warning: No Withdrawn event found!`);
      }
      if (earnedRewards.gt(0) && !rewardPaidEvent) {
        console.log(`  ⚠️  Warning: Expected RewardPaid event but not found!`);
      }

      // Wait for state to update
      await new Promise(r => setTimeout(r, 3000));

      // Check after state
      const [
        userStakedAfter,
        userStakedTokenAfter,
        userRewardTokenAfter,
        earnedAfter,
        contractStakedAfter,
        contractRewardAfter,
        totalSupplyAfter
      ] = await Promise.all([
        staking.balanceOf(userAddr),
        stakedToken.balanceOf(userAddr),
        rewardToken.balanceOf(userAddr),
        staking.earned(userAddr),
        stakedToken.balanceOf(stakingAddr),
        rewardToken.balanceOf(stakingAddr),
        staking.totalSupply()
      ]);

      console.log(`\n---`);
      console.log(`After exit:`);
      console.log(`  User staked balance: ${hre.ethers.utils.formatUnits(userStakedAfter, 18)} POI (was ${hre.ethers.utils.formatUnits(userStakedBalance, 18)})`);
      console.log(`  User staked token balance: ${hre.ethers.utils.formatUnits(userStakedTokenAfter, 18)} POI (was ${hre.ethers.utils.formatUnits(userStakedTokenBalance, 18)})`);
      console.log(`  User reward token balance: ${hre.ethers.utils.formatUnits(userRewardTokenAfter, 18)} POI (was ${hre.ethers.utils.formatUnits(userRewardTokenBalance, 18)})`);
      console.log(`  Earned rewards: ${hre.ethers.utils.formatUnits(earnedAfter, 18)} POI (was ${hre.ethers.utils.formatUnits(earnedRewards, 18)})`);
      console.log(`  Contract staked balance: ${hre.ethers.utils.formatUnits(contractStakedAfter, 18)} POI (was ${hre.ethers.utils.formatUnits(contractStakedBalance, 18)})`);
      console.log(`  Contract reward balance: ${hre.ethers.utils.formatUnits(contractRewardAfter, 18)} POI (was ${hre.ethers.utils.formatUnits(contractRewardBalance, 18)})`);
      console.log(`  Total staked (totalSupply): ${hre.ethers.utils.formatUnits(totalSupplyAfter, 18)} POI (was ${hre.ethers.utils.formatUnits(totalSupply, 18)})`);
      console.log(`---`);

      // Calculate changes
      const stakedDecreased = userStakedBalance.sub(userStakedAfter);
      const tokenIncreased = userStakedTokenAfter.sub(userStakedTokenBalance);
      const rewardIncreased = userRewardTokenAfter.sub(userRewardTokenBalance);

      console.log(`Changes:`);
      console.log(`  Staked decreased: ${hre.ethers.utils.formatUnits(stakedDecreased, 18)} POI`);
      console.log(`  Staked token increased: ${hre.ethers.utils.formatUnits(tokenIncreased, 18)} POI`);
      console.log(`  Reward token increased: ${hre.ethers.utils.formatUnits(rewardIncreased, 18)} POI`);

      // Verify correctness
      let allGood = true;

      if (!userStakedAfter.eq(0)) {
        console.log(`  ✗ User staked balance should be 0 after exit, but is ${hre.ethers.utils.formatUnits(userStakedAfter, 18)}`);
        allGood = false;
      } else {
        console.log(`  ✓ User staked balance is 0 (correct)`);
      }

      if (!stakedDecreased.eq(userStakedBalance)) {
        console.log(`  ✗ Staked decreased (${hre.ethers.utils.formatUnits(stakedDecreased, 18)}) != original staked (${hre.ethers.utils.formatUnits(userStakedBalance, 18)})`);
        allGood = false;
      } else {
        console.log(`  ✓ All staked tokens were withdrawn`);
      }

      // Token increase should equal staked balance + rewards claimed
      const expectedTokenIncrease = userStakedBalance.add(rewardIncreased);
      if (!tokenIncreased.eq(expectedTokenIncrease)) {
        // Allow 1% tolerance for rounding
        const tolerance = expectedTokenIncrease.mul(1).div(100);
        if (tokenIncreased.sub(expectedTokenIncrease).abs().gt(tolerance)) {
          console.log(`  ✗ Token increased (${hre.ethers.utils.formatUnits(tokenIncreased, 18)}) != expected (${hre.ethers.utils.formatUnits(expectedTokenIncrease, 18)} = staked ${hre.ethers.utils.formatUnits(userStakedBalance, 18)} + rewards ${hre.ethers.utils.formatUnits(rewardIncreased, 18)})`);
          allGood = false;
        } else {
          console.log(`  ✓ Staked tokens returned correctly (with rounding tolerance)`);
        }
      } else {
        console.log(`  ✓ Staked tokens + rewards returned correctly`);
      }

      if (earnedRewards.gt(0)) {
        const expectedRewardIncrease = earnedRewards;
        if (rewardIncreased.lt(expectedRewardIncrease.mul(99).div(100))) {
          // Allow 1% tolerance for rounding
          console.log(`  ⚠️  Reward increased (${hre.ethers.utils.formatUnits(rewardIncreased, 18)}) < expected (${hre.ethers.utils.formatUnits(expectedRewardIncrease, 18)})`);
        } else {
          console.log(`  ✓ Rewards claimed correctly`);
        }
      } else {
        if (rewardIncreased.gt(0)) {
          console.log(`  ⚠️  Unexpected reward increase (${hre.ethers.utils.formatUnits(rewardIncreased, 18)} POI) when earned was 0`);
        } else {
          console.log(`  ✓ No rewards to claim (as expected)`);
        }
      }

      if (allGood) {
        console.log(`\n✅ exit() test PASSED - All checks passed!`);
      } else {
        console.log(`\n⚠️  exit() test completed with warnings`);
      }
    } else {
      throw new Error(`Transaction reverted (status: ${receipt.status})`);
    }
  } catch (e) {
    console.error(`✗ Failed: ${e.message || e}`);
    
    if (e.receipt) {
      console.error(`  Transaction hash: ${e.receipt.transactionHash}`);
      console.error(`  Gas used: ${e.receipt.gasUsed.toString()}`);
      console.error(`  Status: ${e.receipt.status}`);
    }

    // Try static call to see revert reason
    try {
      console.log(`\nAttempting static call to see revert reason...`);
      await staking.callStatic.exit();
      console.log(`  ✓ Static call succeeded (unexpected - transaction should have failed)`);
    } catch (e2) {
      console.error(`  Static call failed: ${e2.message || e2}`);
      if (e2.error && e2.error.data) {
        console.error(`  Revert data: ${e2.error.data}`);
      }
    }

    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

