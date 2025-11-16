import { expect } from "chai";
import { ethers } from "hardhat";

describe("AchievementBadges", function () {
  it("allows admins to configure and mint badge types", async () => {
    const [admin, user, other] = await ethers.getSigners();
    const Badges = await ethers.getContractFactory("AchievementBadges");
    const badges = await Badges.deploy("POI Badges", "POIB", admin.address);
    await badges.deployed();

    await badges.connect(admin).setBadgeType(1, "https://example.com/1.json", true);
    await expect(badges.connect(admin).mintBadge(user.address, 1)).to.emit(badges, "BadgeMinted");

    expect(await badges.balanceOf(user.address)).to.equal(1);
    expect(await badges.tokenURI(1)).to.equal("https://example.com/1.json");

    await expect(badges.connect(user).mintBadge(user.address, 1))
      .to.be.revertedWithCustomError(badges, "AccessControlUnauthorizedAccount")
      .withArgs(user.address, await badges.MINTER_ROLE());

    await expect(badges.connect(user)["safeTransferFrom(address,address,uint256)"](user.address, other.address, 1)).to.be.revertedWithCustomError(
      badges,
      "NonTransferable"
    );
  });

  it("prevents minting when badge type disabled", async () => {
    const [admin, user] = await ethers.getSigners();
    const Badges = await ethers.getContractFactory("AchievementBadges");
    const badges = await Badges.deploy("POI Badges", "POIB", admin.address);
    await badges.deployed();

    await expect(badges.connect(admin).mintBadge(user.address, 2)).to.be.revertedWithCustomError(
      badges,
      "BadgeTypeDisabled"
    );
  });
});
