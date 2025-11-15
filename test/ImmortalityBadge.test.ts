import { expect } from "chai";
import { ethers } from "hardhat";

describe("ImmortalityBadge", () => {
  async function deployBadge() {
    const [admin, minter, user, stranger] = await ethers.getSigners();
    const Badge = await ethers.getContractFactory("ImmortalityBadge");
    const badge = await Badge.deploy("https://badge.example/", admin.address);
    await badge.deployed();

    await badge.connect(admin).grantRole(await badge.MINTER_ROLE(), minter.address);
    await badge
      .connect(admin)
      .configureBadgeType(1, { enabled: true, transferable: false, uri: "ipfs://badge-1" });

    return { badge, admin, minter, user, stranger };
  }

  it("mints the test badge and records ownership", async () => {
    const { badge, minter, user } = await deployBadge();
    await expect(badge.connect(minter).mintBadge(user.address, 1))
      .to.emit(badge, "BadgeMinted")
      .withArgs(user.address, 1, 1);

    expect(await badge.hasBadge(user.address, 1)).to.equal(true);
    expect(await badge.badgeTypeOf(1)).to.equal(1);
    expect(await badge.tokenURI(1)).to.equal("ipfs://badge-1");
  });

  it("rejects disabled types, duplicates, and transfers", async () => {
    const { badge, minter, user, stranger } = await deployBadge();

    await badge.connect(minter).mintBadge(user.address, 1);
    await expect(badge.connect(minter).mintBadge(user.address, 1)).to.be.revertedWithCustomError(
      badge,
      "BadgeAlreadyClaimed"
    );

    await badge.connect(minter).configureBadgeType(2, { enabled: false, transferable: false, uri: "" });
    await expect(badge.connect(minter).mintBadge(user.address, 2)).to.be.revertedWithCustomError(
      badge,
      "BadgeDisabled"
    );

    await expect(badge.connect(user)["safeTransferFrom(address,address,uint256)"](user.address, stranger.address, 1)).to.be
      .revertedWithCustomError(badge, "BadgeTransferDisabled");
  });

  it("restricts minting to authorized minters", async () => {
    const { badge, user, stranger } = await deployBadge();
    const minterRole = await badge.MINTER_ROLE();
    await expect(badge.connect(stranger).mintBadge(user.address, 1)).to.be.revertedWith(
      `AccessControl: account ${stranger.address.toLowerCase()} is missing role ${minterRole}`
    );
  });
});
