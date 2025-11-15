import { expect } from "chai";
import { ethers } from "hardhat";

describe("ReferralRegistry", function () {
  it("records referral relationships", async () => {
    const [owner, parent, child] = await ethers.getSigners();
    const Registry = await ethers.getContractFactory("ReferralRegistry");
    const registry = await Registry.deploy(owner.address);
    await registry.deployed();

    await registry.connect(child).setReferrer(parent.address);
    expect(await registry.getReferrer(child.address)).to.equal(parent.address);
    expect(await registry.getReferralCount(parent.address)).to.equal(1);

    await expect(registry.connect(child).setReferrer(parent.address)).to.be.revertedWithCustomError(
      registry,
      "ReferrerAlreadySet"
    );

    await expect(registry.connect(parent).setReferrer(parent.address)).to.be.revertedWithCustomError(
      registry,
      "InvalidReferrer"
    );
  });
});
