import { expect } from "chai";
import { ethers } from "hardhat";

describe("StakingRewards", function () {
  it("distributes rewards over time", async () => {
    const [owner, staker] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("MockERC20");
    const token = await Token.deploy("POI", "POI", 18, 0);
    await token.deployed();

    const Staking = await ethers.getContractFactory("StakingRewards");
    const staking = await Staking.deploy(token.address, token.address, owner.address);
    await staking.deployed();

    const stakeAmount = ethers.utils.parseEther("100");
    const rewardAmount = ethers.utils.parseEther("50");

    await token.mint(staker.address, stakeAmount);
    await token.connect(staker).approve(staking.address, stakeAmount);

    await token.mint(owner.address, rewardAmount);
    await token.connect(owner).approve(staking.address, rewardAmount);
    await staking.connect(owner).notifyRewardAmount(rewardAmount);

    await staking.connect(staker).stake(stakeAmount);

    await ethers.provider.send("evm_increaseTime", [3600]);
    await ethers.provider.send("evm_mine", []);

    const earned = await staking.earned(staker.address);
    expect(earned).to.be.gt(0);

    const balanceBefore = await token.balanceOf(staker.address);
    await staking.connect(staker).getReward();
    expect(await token.balanceOf(staker.address)).to.be.gt(balanceBefore);

    await staking.connect(staker).withdraw(stakeAmount);
    expect(await staking.balanceOf(staker.address)).to.equal(0);
  });

  it("validates withdraw limits", async () => {
    const [owner, staker] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("MockERC20");
    const token = await Token.deploy("POI", "POI", 18, 0);
    await token.deployed();

    const Staking = await ethers.getContractFactory("StakingRewards");
    const staking = await Staking.deploy(token.address, token.address, owner.address);
    await staking.deployed();

    const stakeAmount = ethers.utils.parseEther("10");
    await token.mint(staker.address, stakeAmount);
    await token.connect(staker).approve(staking.address, stakeAmount);
    await staking.connect(staker).stake(stakeAmount);

    await expect(staking.connect(staker).withdraw(0)).to.be.revertedWithCustomError(staking, "InsufficientBalance");
  });

  it("handles multiple stakers correctly", async () => {
    const [owner, staker1, staker2] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("MockERC20");
    const token = await Token.deploy("POI", "POI", 18, 0);
    await token.deployed();

    const Staking = await ethers.getContractFactory("StakingRewards");
    const staking = await Staking.deploy(token.address, token.address, owner.address);
    await staking.deployed();

    const stake1 = ethers.utils.parseEther("100");
    const stake2 = ethers.utils.parseEther("200");
    const rewardAmount = ethers.utils.parseEther("300");

    // Setup rewards
    await token.mint(owner.address, rewardAmount);
    await token.connect(owner).approve(staking.address, rewardAmount);
    await staking.connect(owner).notifyRewardAmount(rewardAmount);

    // Staker 1 stakes
    await token.mint(staker1.address, stake1);
    await token.connect(staker1).approve(staking.address, stake1);
    await staking.connect(staker1).stake(stake1);

    // Half the period passes
    await ethers.provider.send("evm_increaseTime", [15 * 24 * 3600]); // 15 days
    await ethers.provider.send("evm_mine", []);

    // Staker 2 stakes
    await token.mint(staker2.address, stake2);
    await token.connect(staker2).approve(staking.address, stake2);
    await staking.connect(staker2).stake(stake2);

    // Rest of period passes
    await ethers.provider.send("evm_increaseTime", [15 * 24 * 3600]); // 15 days
    await ethers.provider.send("evm_mine", []);

    // Both should have earned rewards
    const earned1 = await staking.earned(staker1.address);
    const earned2 = await staking.earned(staker2.address);
    
    expect(earned1).to.be.gt(0);
    expect(earned2).to.be.gt(0);
    // Staker 1 should have more (staked longer)
    expect(earned1).to.be.gt(earned2);
  });

  it("supports exit function", async () => {
    const [owner, staker] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("MockERC20");
    const token = await Token.deploy("POI", "POI", 18, 0);
    await token.deployed();

    const Staking = await ethers.getContractFactory("StakingRewards");
    const staking = await Staking.deploy(token.address, token.address, owner.address);
    await staking.deployed();

    const stakeAmount = ethers.utils.parseEther("100");
    const rewardAmount = ethers.utils.parseEther("50");

    await token.mint(staker.address, stakeAmount);
    await token.connect(staker).approve(staking.address, stakeAmount);
    
    await token.mint(owner.address, rewardAmount);
    await token.connect(owner).approve(staking.address, rewardAmount);
    await staking.connect(owner).notifyRewardAmount(rewardAmount);

    await staking.connect(staker).stake(stakeAmount);

    await ethers.provider.send("evm_increaseTime", [7 * 24 * 3600]); // 7 days
    await ethers.provider.send("evm_mine", []);

    const balanceBefore = await token.balanceOf(staker.address);
    await staking.connect(staker).exit();
    const balanceAfter = await token.balanceOf(staker.address);

    // Should get stake + rewards back
    expect(balanceAfter).to.be.gt(balanceBefore.add(stakeAmount));
    expect(await staking.balanceOf(staker.address)).to.equal(0);
  });
});
