import { expect } from "chai";
import { ethers } from "hardhat";

describe("VestingVault", function () {
  async function deployFixture() {
    const [owner, beneficiary] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("MockERC20");
    const token = await Token.deploy("Test", "TST", 18, ethers.utils.parseEther("1000000"));
    await token.deployed();

    const Vesting = await ethers.getContractFactory("VestingVault");
    const vault = await Vesting.deploy(token.address, owner.address);
    await vault.deployed();

    const amount = ethers.utils.parseEther("1000");
    await token.mint(vault.address, amount);

    return { owner, beneficiary, token, vault, amount };
  }

  it("creates vesting schedule and releases tokens over time", async () => {
    const { owner, beneficiary, token, vault, amount } = await deployFixture();
    const cliff = 60 * 60 * 24 * 30; // 30 days
    const duration = cliff * 4;

    await vault.connect(owner).addBeneficiary(beneficiary.address, amount, cliff, duration);

    expect(await vault.vestedAmount(beneficiary.address)).to.equal(0);

    await ethers.provider.send("evm_increaseTime", [cliff]);
    await ethers.provider.send("evm_mine", []);

    const vestedAfterCliff = await vault.vestedAmount(beneficiary.address);
    expect(vestedAfterCliff).to.be.gt(0);

    await vault.connect(beneficiary).withdraw();
    expect(await token.balanceOf(beneficiary.address)).to.equal(vestedAfterCliff);

    await ethers.provider.send("evm_increaseTime", [duration]);
    await ethers.provider.send("evm_mine", []);

    await vault.connect(beneficiary).withdraw();
    expect(await token.balanceOf(beneficiary.address)).to.equal(amount);
  });

  it("prevents duplicate beneficiaries", async () => {
    const { owner, beneficiary, vault, amount } = await deployFixture();
    const cliff = 100;
    const duration = 500;

    await vault.connect(owner).addBeneficiary(beneficiary.address, amount, cliff, duration);
    await expect(
      vault.connect(owner).addBeneficiary(beneficiary.address, amount, cliff, duration)
    ).to.be.revertedWithCustomError(vault, "BeneficiaryExists");
  });

  it("handles cliff period correctly", async () => {
    const { owner, beneficiary, vault, amount } = await deployFixture();
    const cliff = 60 * 60 * 24 * 90; // 90 days
    const duration = cliff * 2;

    await vault.connect(owner).addBeneficiary(beneficiary.address, amount, cliff, duration);

    // Before cliff - nothing vested
    expect(await vault.vestedAmount(beneficiary.address)).to.equal(0);
    expect(await vault.releasableAmount(beneficiary.address)).to.equal(0);

    // Try to withdraw before cliff
    await expect(vault.connect(beneficiary).withdraw()).to.be.revertedWithCustomError(vault, "NothingToRelease");

    // After cliff - some vested
    await ethers.provider.send("evm_increaseTime", [cliff]);
    await ethers.provider.send("evm_mine", []);

    const vestedAfterCliff = await vault.vestedAmount(beneficiary.address);
    expect(vestedAfterCliff).to.be.gt(0);
    expect(vestedAfterCliff).to.be.lt(amount);
  });

  it("allows multiple partial withdrawals", async () => {
    const { owner, beneficiary, token, vault, amount } = await deployFixture();
    const cliff = 0; // No cliff
    const duration = 60 * 60 * 24 * 100; // 100 days

    await vault.connect(owner).addBeneficiary(beneficiary.address, amount, cliff, duration);

    // Withdraw after 25%
    await ethers.provider.send("evm_increaseTime", [duration / 4]);
    await ethers.provider.send("evm_mine", []);
    await vault.connect(beneficiary).withdraw();
    const balance1 = await token.balanceOf(beneficiary.address);
    expect(balance1).to.be.closeTo(amount.div(4), amount.div(100)); // Within 1%

    // Withdraw after 50% total
    await ethers.provider.send("evm_increaseTime", [duration / 4]);
    await ethers.provider.send("evm_mine", []);
    await vault.connect(beneficiary).withdraw();
    const balance2 = await token.balanceOf(beneficiary.address);
    expect(balance2).to.be.closeTo(amount.div(2), amount.div(50)); // Within 2%

    // Withdraw after 100%
    await ethers.provider.send("evm_increaseTime", [duration / 2]);
    await ethers.provider.send("evm_mine", []);
    await vault.connect(beneficiary).withdraw();
    const balanceFinal = await token.balanceOf(beneficiary.address);
    expect(balanceFinal).to.equal(amount);

    // No more to withdraw
    await expect(vault.connect(beneficiary).withdraw()).to.be.revertedWithCustomError(vault, "NothingToRelease");
  });

  it("validates beneficiary parameters", async () => {
    const { owner, beneficiary, vault, amount } = await deployFixture();

    // Zero address
    await expect(
      vault.connect(owner).addBeneficiary(ethers.constants.AddressZero, amount, 100, 1000)
    ).to.be.revertedWithCustomError(vault, "InvalidParameters");

    // Zero amount
    await expect(
      vault.connect(owner).addBeneficiary(beneficiary.address, 0, 100, 1000)
    ).to.be.revertedWithCustomError(vault, "InvalidParameters");

    // Duration < cliff
    await expect(
      vault.connect(owner).addBeneficiary(beneficiary.address, amount, 1000, 100)
    ).to.be.revertedWithCustomError(vault, "InvalidParameters");

    // Zero duration
    await expect(
      vault.connect(owner).addBeneficiary(beneficiary.address, amount, 0, 0)
    ).to.be.revertedWithCustomError(vault, "InvalidParameters");
  });
});
