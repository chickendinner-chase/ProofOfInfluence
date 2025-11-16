import { expect } from "chai";
import { ethers } from "hardhat";

describe("VestingVault", function () {
  async function deployFixture() {
    const [owner, beneficiary, other] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("MockERC20");
    const token = await Token.deploy("POI", "POI", 18, 0);
    await token.deployed();

    const Vault = await ethers.getContractFactory("VestingVault");
    const vault = await Vault.deploy(token.address, owner.address);
    await vault.deployed();

    const total = ethers.utils.parseEther("1000");
    await token.mint(vault.address, total.mul(2));
    return { owner, beneficiary, other, token, vault };
  }

  async function increaseTime(seconds: number) {
    await ethers.provider.send("evm_increaseTime", [seconds]);
    await ethers.provider.send("evm_mine", []);
  }

  it("creates multiple schedules and releases over time", async () => {
    const { owner, beneficiary, vault, token } = await deployFixture();
    const now = (await ethers.provider.getBlock("latest")).timestamp;

    await expect(
      vault
        .connect(owner)
        .createSchedule(beneficiary.address, ethers.utils.parseEther("500"), now, 30, 300, 30, true)
    ).to.emit(vault, "ScheduleCreated");

    await expect(
      vault
        .connect(owner)
        .createSchedule(beneficiary.address, ethers.utils.parseEther("250"), now, 0, 200, 20, false)
    ).to.emit(vault, "ScheduleCreated");

    await expect(vault.connect(beneficiary).release(1)).to.be.revertedWithCustomError(vault, "NothingToRelease");

    await increaseTime(60);
    const releasable = await vault.releasableAmount(1);
    expect(releasable).to.be.gt(0);

    await expect(vault.connect(beneficiary).release(1)).to.emit(vault, "Released");
    expect(await token.balanceOf(beneficiary.address)).to.equal(releasable);
  });

  it("releases everything at end and supports revocation", async () => {
    const { owner, beneficiary, vault, token } = await deployFixture();
    const now = (await ethers.provider.getBlock("latest")).timestamp;
    await vault
      .connect(owner)
      .createSchedule(beneficiary.address, ethers.utils.parseEther("400"), now, 0, 200, 20, true);

    await increaseTime(250);
    await vault.connect(beneficiary).release(1);
    expect(await token.balanceOf(beneficiary.address)).to.equal(ethers.utils.parseEther("400"));

    await vault.connect(owner).createSchedule(beneficiary.address, ethers.utils.parseEther("300"), now, 10, 200, 10, true);
    await increaseTime(20);
    await expect(vault.connect(owner).revoke(2)).to.emit(vault, "Revoked");
  });

  it("rejects invalid parameters", async () => {
    const { owner, beneficiary, vault } = await deployFixture();
    await expect(
      vault.connect(owner).createSchedule(ethers.constants.AddressZero, 1, 0, 0, 10, 1, false)
    ).to.be.revertedWithCustomError(vault, "InvalidSchedule");
    await expect(
      vault.connect(owner).createSchedule(beneficiary.address, 0, 0, 0, 10, 1, false)
    ).to.be.revertedWithCustomError(vault, "InvalidSchedule");
  });
});
