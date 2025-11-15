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
});
