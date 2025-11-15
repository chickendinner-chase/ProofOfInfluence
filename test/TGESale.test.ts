import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";

describe("TGESale", function () {
  async function setupSale() {
    const [owner, buyer, treasury, blacklisted] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("MockERC20");
    const poi = await Token.deploy("POI", "POI", 18, 0);
    await poi.deployed();

    const usdc = await Token.deploy("USDC", "USDC", 6, 0);
    await usdc.deployed();

    const Sale = await ethers.getContractFactory("TGESale");
    const sale = await Sale.deploy(poi.address, usdc.address, owner.address, treasury.address);
    await sale.deployed();

    const tierSupply = ethers.utils.parseEther("1000");
    await sale.connect(owner).configureTiers([ethers.utils.parseUnits("2", 6)], [tierSupply]);
    await sale.connect(owner).setWhitelistConfig(false, ethers.constants.HashZero);

    await poi.mint(sale.address, tierSupply);

    return { owner, buyer, treasury, blacklisted, poi, usdc, sale, tierSupply };
  }

  function buildProof(account: string, allocation: BigNumber) {
    const leaf = ethers.utils.keccak256(
      ethers.utils.hexConcat([
        ethers.utils.keccak256(
          ethers.utils.defaultAbiCoder.encode(["address", "uint256"], [account, allocation])
        ),
      ])
    );
    return { root: leaf, proof: [ethers.utils.hexZeroPad(allocation.toHexString(), 32)] };
  }

  it("allows purchase when whitelist disabled", async () => {
    const { owner, buyer, treasury, poi, usdc, sale } = await setupSale();

    const usdcAmount = ethers.utils.parseUnits("1000", 6);
    await usdc.mint(buyer.address, usdcAmount);
    await usdc.connect(buyer).approve(sale.address, usdcAmount);

    await sale.connect(buyer).purchase(usdcAmount, []);

    const expectedPoi = usdcAmount.mul(BigNumber.from(10).pow(12)).div(ethers.utils.parseUnits("2", 6));
    expect(await poi.balanceOf(buyer.address)).to.equal(expectedPoi);
    expect(await sale.contributedUSDC(buyer.address)).to.equal(usdcAmount);

    await sale.connect(owner).withdraw();
    expect(await usdc.balanceOf(treasury.address)).to.equal(usdcAmount);
  });

  it("enforces whitelist when enabled", async () => {
    const { owner, buyer, poi, usdc, sale } = await setupSale();
    const allocation = ethers.utils.parseUnits("5000", 6);
    const { root, proof } = buildProof(buyer.address, allocation);
    await sale.connect(owner).setWhitelistConfig(true, root);

    const usdcAmount = ethers.utils.parseUnits("1000", 6);
    await usdc.mint(buyer.address, usdcAmount);
    await usdc.connect(buyer).approve(sale.address, usdcAmount);

    await sale.connect(buyer).purchase(usdcAmount, proof);

    const expectedPoi = usdcAmount.mul(BigNumber.from(10).pow(12)).div(ethers.utils.parseUnits("2", 6));
    expect(await poi.balanceOf(buyer.address)).to.equal(expectedPoi);
  });

  it("blocks blacklisted users and pauses", async () => {
    const { owner, buyer, blacklisted, usdc, sale } = await setupSale();
    const allocation = ethers.utils.parseUnits("1000", 6);
    const { root, proof } = buildProof(buyer.address, allocation);
    await sale.connect(owner).setWhitelistConfig(true, root);

    const purchaseAmount = ethers.utils.parseUnits("500", 6);
    await usdc.mint(buyer.address, purchaseAmount);
    await usdc.connect(buyer).approve(sale.address, purchaseAmount);

    await sale.connect(owner).setBlacklist(blacklisted.address, true);
    await expect(sale.connect(blacklisted).purchase(purchaseAmount, proof)).to.be.revertedWithCustomError(
      sale,
      "Blacklisted"
    );

    await sale.connect(owner).setPaused(true);
    await expect(sale.connect(buyer).purchase(purchaseAmount, proof)).to.be.revertedWithCustomError(
      sale,
      "SalePaused"
    );
  });

  it("rejects purchases exceeding allocation", async () => {
    const { owner, buyer, usdc, sale } = await setupSale();
    const allocation = ethers.utils.parseUnits("100", 6);
    const { root, proof } = buildProof(buyer.address, allocation);
    await sale.connect(owner).setWhitelistConfig(true, root);

    const purchaseAmount = ethers.utils.parseUnits("120", 6);
    await usdc.mint(buyer.address, purchaseAmount);
    await usdc.connect(buyer).approve(sale.address, purchaseAmount);

    await expect(sale.connect(buyer).purchase(purchaseAmount, proof)).to.be.revertedWithCustomError(
      sale,
      "AllocationExceeded"
    );
  });

  it("enforces sale window bounds", async () => {
    const { owner, buyer, usdc, sale } = await setupSale();
    const now = (await ethers.provider.getBlock("latest")).timestamp;
    await sale.connect(owner).setSaleWindow(now + 1000, now + 2000);

    const amount = ethers.utils.parseUnits("10", 6);
    await usdc.mint(buyer.address, amount);
    await usdc.connect(buyer).approve(sale.address, amount);

    await expect(sale.connect(buyer).purchase(amount, [])).to.be.revertedWithCustomError(sale, "SaleNotStarted");

    await ethers.provider.send("evm_setNextBlockTimestamp", [now + 1001]);
    await ethers.provider.send("evm_mine", []);
    await sale.connect(buyer).purchase(amount, []);

    await ethers.provider.send("evm_setNextBlockTimestamp", [now + 2001]);
    await ethers.provider.send("evm_mine", []);
    await expect(sale.connect(buyer).purchase(amount, [])).to.be.revertedWithCustomError(sale, "SaleEnded");
  });

  it("provides consolidated sale view", async () => {
    const { buyer, sale } = await setupSale();
    const view = await sale.getSaleView(buyer.address);
    expect(view.currentTier).to.equal(0);
    expect(view.minContribution).to.equal(0);
    expect(view.maxContribution).to.equal(0);
    expect(view.userContributed).to.equal(0);
  });
});
