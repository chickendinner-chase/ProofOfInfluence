import { expect } from "chai";
import { ethers } from "hardhat";

describe("ReferralRegistry", function () {
  async function deployRegistry() {
    const [admin, inviter, invitee] = await ethers.getSigners();
    const Registry = await ethers.getContractFactory("ReferralRegistry");
    const registry = await Registry.deploy(admin.address);
    await registry.deployed();
    return { registry, admin, inviter, invitee };
  }

  it("records referrals via registrar role", async () => {
    const { registry, admin, inviter, invitee } = await deployRegistry();
    await registry.connect(admin).register(inviter.address, invitee.address, ethers.utils.formatBytes32String("code"));
    const referral = await registry.getReferral(invitee.address);
    expect(referral.inviter).to.equal(inviter.address);
    expect(await registry.hasReferral(invitee.address)).to.equal(true);

    await expect(
      registry.connect(admin).register(inviter.address, invitee.address, ethers.utils.formatBytes32String("code"))
    ).to.be.revertedWithCustomError(registry, "AlreadyRegistered");
  });

  it("self registration and rewards", async () => {
    const { registry, inviter, invitee, admin } = await deployRegistry();
    await registry.connect(invitee).selfRegister(inviter.address, ethers.utils.formatBytes32String("self"));
    expect(await registry.hasReferral(invitee.address)).to.equal(true);

    const Token = await ethers.getContractFactory("MockERC20");
    const token = await Token.deploy("POI", "POI", 18, 0);
    await token.deployed();
    await token.mint(registry.address, ethers.utils.parseEther("10"));

    await registry.connect(admin).setRewardToken(token.address);
    await registry.connect(admin).reward(inviter.address, invitee.address, ethers.utils.parseEther("5"));
    expect(await token.balanceOf(inviter.address)).to.equal(ethers.utils.parseEther("5"));
  });
});
