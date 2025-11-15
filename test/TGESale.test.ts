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

  it("allows open sale purchases when whitelist disabled", async () => {
    const { owner, buyer, treasury, poi, usdc, sale } = await setupSale();
    await sale.connect(owner).setWhitelistConfig(false, ethers.constants.HashZero);
    await sale.connect(owner).setContributionBounds(0, ethers.utils.parseUnits("1500", 6));

    const usdcAmount = ethers.utils.parseUnits("1000", 6);
    const totalUsdc = usdcAmount.add(ethers.utils.parseUnits("1", 6));
    await usdc.mint(buyer.address, totalUsdc);
    await usdc.connect(buyer).approve(sale.address, totalUsdc);

    const expectedPoi = usdcAmount.mul(BigNumber.from(10).pow(12)).div(ethers.utils.parseUnits("2", 6));

    await expect(sale.connect(buyer).buyWithBaseToken(usdcAmount, []))
      .to.emit(sale, "Purchased")
      .withArgs(buyer.address, usdcAmount, expectedPoi, 0);

    await expect(sale.connect(buyer).buyWithBaseToken(0, [])).to.be.revertedWith("Sale: zero amount");

    await expect(sale.connect(buyer).buyWithBaseToken(ethers.utils.parseUnits("1", 6), []))
      .to.emit(sale, "TGEPurchased")
      .withArgs(buyer.address, ethers.utils.parseUnits("1", 6), ethers.utils.parseUnits("0.5", 18));

    expect(await poi.balanceOf(buyer.address)).to.equal(expectedPoi.add(ethers.utils.parseUnits("0.5", 18)));
    expect(await sale.contributedUSDC(buyer.address)).to.equal(usdcAmount.add(ethers.utils.parseUnits("1", 6)));
    expect(await sale.contributionOf(buyer.address)).to.equal(usdcAmount.add(ethers.utils.parseUnits("1", 6)));

    const remaining = await sale["maxContribution(address)"](buyer.address);
    expect(remaining).to.equal(ethers.utils.parseUnits("1500", 6).sub(usdcAmount).sub(ethers.utils.parseUnits("1", 6)));

    const view = await sale.getSaleView(buyer.address);
    expect(view.userContributed).to.equal(usdcAmount.add(ethers.utils.parseUnits("1", 6)));
    expect(view.currentTier).to.equal(0);
    expect(view.tierRemaining).to.equal((await sale.tiers(0)).remainingTokens);

    await sale.connect(owner).withdraw();
    expect(await usdc.balanceOf(treasury.address)).to.equal(usdcAmount.add(ethers.utils.parseUnits("1", 6)));
  });

  it("enforces whitelist allocation when enabled", async () => {
    const { owner, buyer, usdc, sale } = await setupSale();
    const allocation = ethers.utils.parseUnits("500", 6);
    const { root, proof } = buildProof(buyer.address, allocation);

    await sale.connect(owner).setWhitelistConfig(true, root);
    await sale.connect(owner).setContributionBounds(0, 0);

    const purchaseAmount = ethers.utils.parseUnits("400", 6);
    await usdc.mint(buyer.address, allocation);
    await usdc.connect(buyer).approve(sale.address, allocation);

    await expect(sale.connect(buyer).purchase(purchaseAmount, [])).to.be.revertedWithCustomError(
      sale,
      "InvalidProof"
    );

    await sale.connect(buyer).purchase(purchaseAmount, proof);
    await expect(sale.connect(buyer).purchase(purchaseAmount, proof)).to.be.revertedWithCustomError(
      sale,
      "AllocationExceeded"
    );
  });

  it("caps total contribution per address when configured", async () => {
    const { owner, buyer, usdc, sale } = await setupSale();
    await sale.connect(owner).setWhitelistConfig(false, ethers.constants.HashZero);
    await sale.connect(owner).setContributionBounds(0, ethers.utils.parseUnits("500", 6));

    const tranche = ethers.utils.parseUnits("300", 6);
    await usdc.mint(buyer.address, tranche.mul(2));
    await usdc.connect(buyer).approve(sale.address, tranche.mul(2));

    await sale.connect(buyer).purchase(tranche, []);
    await expect(sale.connect(buyer).purchase(tranche, [])).to.be.revertedWith("Sale: above maximum");
  });

  it("applies sale window and pause guard rails", async () => {
    const { owner, buyer, blacklisted, usdc, sale } = await setupSale();
    await sale.connect(owner).setWhitelistConfig(false, ethers.constants.HashZero);

    const now = (await ethers.provider.getBlock("latest")).timestamp;
    await sale.connect(owner).setSaleWindow(now + 3600, now + 7200);

    expect(await sale.isSaleActive()).to.equal(false);

    const purchaseAmount = ethers.utils.parseUnits("100", 6);
    await usdc.mint(buyer.address, purchaseAmount);
    await usdc.connect(buyer).approve(sale.address, purchaseAmount);

    await expect(sale.connect(buyer).purchase(purchaseAmount, [])).to.be.revertedWithCustomError(
        sale,
        "SaleNotStarted"
    );

    await ethers.provider.send("evm_increaseTime", [3600]);
    await ethers.provider.send("evm_mine", []);

    expect(await sale.isSaleActive()).to.equal(true);

    await sale.connect(owner).setBlacklist(blacklisted.address, true);
    await expect(sale.connect(blacklisted).purchase(purchaseAmount, [])).to.be.revertedWithCustomError(
        sale,
        "Blacklisted"
    );

    await sale.connect(owner).setPaused(true);
    expect(await sale.isSaleActive()).to.equal(false);
    await expect(sale.connect(buyer).purchase(purchaseAmount, [])).to.be.revertedWithCustomError(
        sale,
        "SalePaused"
    );

    await sale.connect(owner).setPaused(false);
    expect(await sale.isSaleActive()).to.equal(true);
    await sale.connect(buyer).purchase(purchaseAmount, []);

    await ethers.provider.send("evm_increaseTime", [4000]);
    await ethers.provider.send("evm_mine", []);

    await expect(sale.connect(buyer).purchase(1, [])).to.be.revertedWithCustomError(sale, "SaleEnded");
    expect(await sale.isSaleActive()).to.equal(false);
  });
});
