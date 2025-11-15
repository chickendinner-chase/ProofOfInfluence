import { expect } from "chai";
import { ethers } from "hardhat";

describe("AchievementBadges", function () {
  it("mints soulbound badges", async () => {
    const [admin, user, other] = await ethers.getSigners();
    const Badges = await ethers.getContractFactory("AchievementBadges");
    const badges = await Badges.deploy("https://example.com/{id}.json", admin.address);
    await badges.deployed();

    await badges.connect(admin).mint(user.address, 1, 1);
    expect(await badges.balanceOf(user.address, 1)).to.equal(1);

    const minterRole = await badges.MINTER_ROLE();
    await expect(badges.connect(user).mint(user.address, 2, 1))
      .to.be.revertedWithCustomError(badges, "AccessControlUnauthorizedAccount")
      .withArgs(user.address, minterRole);

    await expect(
      badges.connect(user).safeTransferFrom(user.address, other.address, 1, 1, "0x")
    ).to.be.revertedWith("SBT: non-transferable");

    await badges.connect(admin).mintBatch(user.address, [2, 3], [1, 1]);
    expect(await badges.balanceOf(user.address, 2)).to.equal(1);
  });
});
