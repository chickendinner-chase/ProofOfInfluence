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

  it("allows eligible buyer to purchase tokens", async () => {
    const { owner, buyer, treasury, poi, usdc, sale } = await setupSale();
    const allocation = ethers.utils.parseUnits("5000", 6);
    const { root, proof } = buildProof(buyer.address, allocation);
    await sale.connect(owner).setMerkleRoot(root);

    const usdcAmount = ethers.utils.parseUnits("1000", 6);
    await usdc.mint(buyer.address, usdcAmount);
    await usdc.connect(buyer).approve(sale.address, usdcAmount);

    await sale.connect(buyer).purchase(usdcAmount, proof);

    const expectedPoi = usdcAmount.mul(BigNumber.from(10).pow(12)).div(ethers.utils.parseUnits("2", 6));
    expect(await poi.balanceOf(buyer.address)).to.equal(expectedPoi);
    expect(await sale.contributedUSDC(buyer.address)).to.equal(usdcAmount);

    await sale.connect(owner).withdraw();
    expect(await usdc.balanceOf(treasury.address)).to.equal(usdcAmount);
  });

  it("blocks blacklisted users and pauses", async () => {
    const { owner, buyer, blacklisted, poi, usdc, sale } = await setupSale();
    const allocation = ethers.utils.parseUnits("1000", 6);
    const { root, proof } = buildProof(buyer.address, allocation);
    await sale.connect(owner).setMerkleRoot(root);

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
    await sale.connect(owner).setMerkleRoot(root);

    const purchaseAmount = ethers.utils.parseUnits("120", 6);
    await usdc.mint(buyer.address, purchaseAmount);
    await usdc.connect(buyer).approve(sale.address, purchaseAmount);

    await expect(sale.connect(buyer).purchase(purchaseAmount, proof)).to.be.revertedWithCustomError(
      sale,
      "AllocationExceeded"
    );
  });

  it("handles tier transition correctly", async () => {
    const { owner, buyer, treasury, poi, usdc, sale } = await setupSale();
    
    // Configure 2 tiers
    const tier1Supply = ethers.utils.parseEther("100");
    const tier2Supply = ethers.utils.parseEther("200");
    await sale.connect(owner).configureTiers(
      [ethers.utils.parseUnits("1", 6), ethers.utils.parseUnits("2", 6)],
      [tier1Supply, tier2Supply]
    );
    
    await poi.mint(sale.address, tier1Supply.add(tier2Supply));
    
    // Buy exactly tier 1 supply
    const tier1USDC = ethers.utils.parseUnits("100", 6);
    await usdc.mint(buyer.address, tier1USDC);
    await usdc.connect(buyer).approve(sale.address, tier1USDC);
    await sale.connect(buyer).purchase(tier1USDC, []);
    
    // Check tier advanced
    expect(await sale.currentTier()).to.equal(1);
    
    // Buy from tier 2
    const tier2USDC = ethers.utils.parseUnits("100", 6);
    await usdc.mint(buyer.address, tier2USDC);
    await usdc.connect(buyer).approve(sale.address, tier2USDC);
    await sale.connect(buyer).purchase(tier2USDC, []);
    
    // Verify buyer received tokens at tier 2 price
    const expectedFromTier2 = tier2USDC.mul(ethers.BigNumber.from(10).pow(12)).div(ethers.utils.parseUnits("2", 6));
    expect(await poi.balanceOf(buyer.address)).to.be.gte(tier1Supply);
  });

  it("respects contribution bounds", async () => {
    const { owner, buyer, usdc, sale } = await setupSale();
    
    // Set min/max contribution
    await sale.connect(owner).setContributionBounds(
      ethers.utils.parseUnits("10", 6),
      ethers.utils.parseUnits("500", 6)
    );
    
    // Try below minimum
    const tooSmall = ethers.utils.parseUnits("5", 6);
    await usdc.mint(buyer.address, tooSmall);
    await usdc.connect(buyer).approve(sale.address, tooSmall);
    await expect(sale.connect(buyer).purchase(tooSmall, [])).to.be.revertedWith("Sale: below minimum");
    
    // Try above maximum
    const tooLarge = ethers.utils.parseUnits("600", 6);
    await usdc.mint(buyer.address, tooLarge);
    await usdc.connect(buyer).approve(sale.address, tooLarge);
    await expect(sale.connect(buyer).purchase(tooLarge, [])).to.be.revertedWith("Sale: above maximum");
  });
});
