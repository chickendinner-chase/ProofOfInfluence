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
});
