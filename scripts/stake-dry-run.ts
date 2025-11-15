import { ethers, network } from "hardhat";

const erc20Abi = [
  "function approve(address spender, uint256 value) external returns (bool)",
  "function balanceOf(address owner) external view returns (uint256)",
];

async function maybeAdvanceTime() {
  if (network.name === "hardhat" || network.name === "localhost") {
    await network.provider.send("evm_increaseTime", [3600]);
    await network.provider.send("evm_mine");
  }
}

async function main() {
  const stakingAddress = process.env.STAKING_REWARDS_ADDRESS;
  const poiAddress = process.env.POI_TOKEN_ADDRESS;
  const amount = process.env.STAKE_DRY_RUN_AMOUNT ?? "1";

  if (!stakingAddress || !poiAddress) {
    throw new Error("STAKING_REWARDS_ADDRESS and POI_TOKEN_ADDRESS env vars are required");
  }

  const stakeAmount = ethers.utils.parseEther(amount);
  const [caller] = await ethers.getSigners();
  const staking = await ethers.getContractAt("StakingRewards", stakingAddress);
  const token = new ethers.Contract(poiAddress, erc20Abi, caller);

  const balance = await token.balanceOf(caller.address);
  if (balance.lt(stakeAmount)) {
    throw new Error("Caller balance is insufficient to stake");
  }

  await token.approve(stakingAddress, stakeAmount);
  console.log(`Staking ${ethers.utils.formatEther(stakeAmount)} POI on ${network.name}`);
  await (await staking.stake(stakeAmount)).wait();

  await maybeAdvanceTime();
  await (await staking.getReward()).wait();
  await maybeAdvanceTime();
  await (await staking.withdraw(stakeAmount)).wait();
  console.log("Completed stake → reward → withdraw dry run");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
