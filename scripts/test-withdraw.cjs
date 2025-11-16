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

  const staking = await hre.ethers.getContractAt("StakingRewards", stakingAddr, wallet);
  const stakedToken = await hre.ethers.getContractAt("IERC20", stakedTokenAddr);

  const userAddr = wallet.address;

  console.log(`Testing withdraw() for ${userAddr}`);
  console.log(`StakingRewards: ${stakingAddr}`);
  console.log(`Staked Token: ${stakedTokenAddr}`);
  console.log(`---`);

  // Check before state
  let [
    userStakedBalance,
    userTokenBalance,
    stakingContractBalance,
    totalSupply,
    periodFinish,
    currentTime
  ] = await Promise.all([
    staking.balanceOf(userAddr),
    stakedToken.balanceOf(userAddr),
    stakedToken.balanceOf(stakingAddr),
    staking.totalSupply(),
    staking.periodFinish(),
    hre.ethers.provider.getBlock("latest").then(b => b.timestamp)
  ]);

  console.log(`Before withdraw:`);
  console.log(`  User staked balance (from contract): ${hre.ethers.utils.formatUnits(userStakedBalance, 18)} POI`);
  console.log(`  User token balance: ${hre.ethers.utils.formatUnits(userTokenBalance, 18)} POI`);
  console.log(`  Staking contract token balance: ${hre.ethers.utils.formatUnits(stakingContractBalance, 18)} POI`);
  console.log(`  Total staked (totalSupply): ${hre.ethers.utils.formatUnits(totalSupply, 18)} POI`);
  console.log(`  Period finish: ${periodFinish.toString()} (${new Date(periodFinish.toNumber() * 1000).toISOString()})`);
  console.log(`  Current time: ${currentTime} (${new Date(currentTime * 1000).toISOString()})`);
  console.log(`---`);

  if (userStakedBalance.eq(0)) {
    console.log("⚠️  No staked balance to withdraw. Need to stake first.");
    return;
  }

  // Test with different amounts
  const withdrawAmounts = [
    { name: "Small amount (10 POI)", amount: hre.ethers.utils.parseUnits("10", 18) },
    { name: "Half balance", amount: userStakedBalance.div(2) },
    { name: "Full balance", amount: userStakedBalance }
  ];

  for (const testCase of withdrawAmounts) {
    const { name, amount } = testCase;
    const amountFormatted = hre.ethers.utils.formatUnits(amount, 18);

    console.log(`\n=== Testing withdraw: ${name} (${amountFormatted} POI) ===`);

    if (amount.gt(userStakedBalance)) {
      console.log(`  ⚠️  Skipping: Amount (${amountFormatted}) > staked balance (${hre.ethers.utils.formatUnits(userStakedBalance, 18)})`);
      continue;
    }

    // Check if staking contract has enough balance
    if (amount.gt(stakingContractBalance)) {
      console.log(`  ⚠️  Warning: Amount (${amountFormatted}) > contract balance (${hre.ethers.utils.formatUnits(stakingContractBalance, 18)})`);
      console.log(`  This will cause withdraw() to fail!`);
      continue;
    }

    // Try withdraw
    try {
      console.log(`  Attempting withdraw(${amountFormatted} POI)...`);
      let tx;
      try {
        tx = await staking.withdraw(amount);
      } catch (e1) {
        console.log(`  Auto gas estimation failed, retrying with gasLimit=200000...`);
        try {
          tx = await staking.withdraw(amount, { gasLimit: 200000 });
        } catch (e2) {
          console.log(`  Retry failed, trying with gasLimit=300000...`);
          tx = await staking.withdraw(amount, { gasLimit: 300000 });
        }
      }

      console.log(`  Transaction sent: ${tx.hash}`);
      const receipt = await tx.wait();

      if (receipt.status === 1) {
        console.log(`  ✓ Success! Confirmed in block ${receipt.blockNumber}`);
        console.log(`  Gas used: ${receipt.gasUsed.toString()}`);
        console.log(`  Transaction logs: ${receipt.logs.length}`);

        // Check for Withdrawn event
        const stakingInterface = staking.interface;
        let withdrawnEvent = null;
        for (const log of receipt.logs) {
          try {
            const parsed = stakingInterface.parseLog(log);
            if (parsed.name === "Withdrawn") {
              withdrawnEvent = parsed;
              console.log(`  ✓ Found Withdrawn event: user=${parsed.args.user}, amount=${hre.ethers.utils.formatUnits(parsed.args.amount, 18)} POI`);
            }
          } catch (e) {
            // Not a matching log
          }
        }

        if (!withdrawnEvent) {
          console.log(`  ⚠️  Warning: No Withdrawn event found!`);
        }

        // Wait a bit for state to update
        await new Promise(r => setTimeout(r, 2000));

        // Check after state
        const [userStakedAfter, userTokenAfter, contractBalanceAfter, totalSupplyAfter] = await Promise.all([
          staking.balanceOf(userAddr),
          stakedToken.balanceOf(userAddr),
          stakedToken.balanceOf(stakingAddr),
          staking.totalSupply()
        ]);

        console.log(`  After withdraw:`);
        console.log(`    User staked: ${hre.ethers.utils.formatUnits(userStakedAfter, 18)} POI (was ${hre.ethers.utils.formatUnits(userStakedBalance, 18)})`);
        console.log(`    User token: ${hre.ethers.utils.formatUnits(userTokenAfter, 18)} POI (was ${hre.ethers.utils.formatUnits(userTokenBalance, 18)})`);
        console.log(`    Contract balance: ${hre.ethers.utils.formatUnits(contractBalanceAfter, 18)} POI (was ${hre.ethers.utils.formatUnits(stakingContractBalance, 18)})`);
        console.log(`    Total staked: ${hre.ethers.utils.formatUnits(totalSupplyAfter, 18)} POI (was ${hre.ethers.utils.formatUnits(totalSupply, 18)})`);

        const stakedDecreased = userStakedBalance.sub(userStakedAfter);
        const tokenIncreased = userTokenAfter.sub(userTokenBalance);
        console.log(`    Staked decreased: ${hre.ethers.utils.formatUnits(stakedDecreased, 18)} POI`);
        console.log(`    Token increased: ${hre.ethers.utils.formatUnits(tokenIncreased, 18)} POI`);

        if (!stakedDecreased.eq(amount) || !tokenIncreased.eq(amount)) {
          console.log(`  ⚠️  Warning: Amount mismatch!`);
          console.log(`    Expected to withdraw: ${amountFormatted} POI`);
          console.log(`    Actually decreased: ${hre.ethers.utils.formatUnits(stakedDecreased, 18)} POI`);
          console.log(`    Actually increased: ${hre.ethers.utils.formatUnits(tokenIncreased, 18)} POI`);
        } else {
          console.log(`  ✓ Amounts match correctly`);
        }

        // Update state for next iteration
        userStakedBalance = userStakedAfter;
        userTokenBalance = userTokenAfter;
        stakingContractBalance = contractBalanceAfter;
        totalSupply = totalSupplyAfter;

        // Wait a bit before next test
        if (testCase !== withdrawAmounts[withdrawAmounts.length - 1]) {
          console.log(`  Waiting 3 seconds before next test...`);
          await new Promise(r => setTimeout(r, 3000));
        }
      } else {
        throw new Error(`Transaction reverted (status: ${receipt.status})`);
      }
    } catch (e) {
      console.error(`  ✗ Failed: ${e.message || e}`);
      
      // Try to get more details
      if (e.receipt) {
        console.error(`  Transaction hash: ${e.receipt.transactionHash}`);
        console.error(`  Gas used: ${e.receipt.gasUsed.toString()}`);
        console.error(`  Status: ${e.receipt.status}`);
      }

      // Try static call to see revert reason
      try {
        console.log(`  Attempting static call to see revert reason...`);
        await staking.callStatic.withdraw(amount);
        console.log(`  ✓ Static call succeeded (unexpected - transaction should have failed)`);
      } catch (e2) {
        console.error(`  Static call failed: ${e2.message || e2}`);
        if (e2.error && e2.error.data) {
          console.error(`  Revert data: ${e2.error.data}`);
        }
      }

      // Don't continue with other tests if this one failed
      break;
    }
  }

  console.log(`\n---`);
  console.log(`Withdraw testing complete.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

