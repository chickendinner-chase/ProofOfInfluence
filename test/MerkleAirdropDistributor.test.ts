import { expect } from "chai";
import { ethers } from "hardhat";

describe("MerkleAirdropDistributor", function () {
  function buildLeaf(index: number, account: string, amount: string) {
    return ethers.utils.keccak256(
      ethers.utils.hexConcat([
        ethers.utils.keccak256(
          ethers.utils.defaultAbiCoder.encode(["uint256", "address", "uint256"], [index, account, amount])
        ),
      ])
    );
  }

  it("allows claiming and prevents duplicates", async () => {
    const [owner, claimant, other] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("MockERC20");
    const token = await Token.deploy("POI", "POI", 18, 0);
    await token.deployed();

    const Distributor = await ethers.getContractFactory("MerkleAirdropDistributor");
    const distributor = await Distributor.deploy(token.address, owner.address);
    await distributor.deployed();

    const amount = ethers.utils.parseEther("100");
    await token.mint(distributor.address, amount);

    const index = 0;
    const leaf = buildLeaf(index, claimant.address, amount.toString());
    await distributor.connect(owner).configureRound(1, leaf, 0, 0, false);
    await distributor.connect(owner).activateRound(1);

    await distributor.connect(claimant).claim(index, claimant.address, amount, []);
    expect(await token.balanceOf(claimant.address)).to.equal(amount);

    await expect(distributor.connect(claimant).claim(index, claimant.address, amount, [])).to.be.revertedWithCustomError(
      distributor,
      "AlreadyClaimed"
    );

    await expect(distributor.connect(other).claim(index, other.address, amount, [])).to.be.revertedWithCustomError(
      distributor,
      "InvalidProof"
    );
  });

  it("respects pause and time windows", async () => {
    const [owner, claimant] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("MockERC20");
    const token = await Token.deploy("POI", "POI", 18, 0);
    await token.deployed();

    const Distributor = await ethers.getContractFactory("MerkleAirdropDistributor");
    const distributor = await Distributor.deploy(token.address, owner.address);
    await distributor.deployed();

    const amount = ethers.utils.parseEther("50");
    await token.mint(distributor.address, amount);

    const index = 0;
    const leaf = buildLeaf(index, claimant.address, amount.toString());
    const now = (await ethers.provider.getBlock("latest")).timestamp;
    await distributor.connect(owner).configureRound(2, leaf, now + 1000, now + 2000, false);
    await distributor.connect(owner).activateRound(2);

    await expect(distributor.connect(claimant).claim(index, claimant.address, amount, [])).to.be.revertedWithCustomError(
      distributor,
      "ClaimNotOpen"
    );

    await ethers.provider.send("evm_increaseTime", [1200]);
    await ethers.provider.send("evm_mine", []);

    await distributor.connect(owner).pause();
    await expect(distributor.connect(claimant).claim(index, claimant.address, amount, [])).to.be.revertedWith(
      "Pausable: paused"
    );

    await distributor.connect(owner).unpause();
    await distributor.connect(claimant).claim(index, claimant.address, amount, []);
    expect(await token.balanceOf(claimant.address)).to.equal(amount);
  });
});
