import { expect } from "chai";
import { ethers } from "hardhat";

function buildLeaf(index: number, account: string, amount: string) {
  return ethers.utils.keccak256(
    ethers.utils.hexConcat([
      ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(["uint256", "address", "uint256"], [index, account, amount])),
    ])
  );
}

describe("MerkleAirdropDistributor", function () {
  async function deployFixture() {
    const [owner, claimant] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("MockERC20");
    const token = await Token.deploy("POI", "POI", 18, 0);
    await token.deployed();

    const Distributor = await ethers.getContractFactory("MerkleAirdropDistributor");
    const distributor = await Distributor.deploy(owner.address);
    await distributor.deployed();

    await distributor.connect(owner).setToken(token.address);
    await distributor.connect(owner).setTreasury(owner.address);

    return { owner, claimant, token, distributor };
  }

  it("allows claims and prevents duplicates", async () => {
    const { owner, claimant, token, distributor } = await deployFixture();
    const amount = ethers.utils.parseEther("100");
    await token.mint(distributor.address, amount);

    const leaf = buildLeaf(0, claimant.address, amount.toString());
    await distributor.connect(owner).setRoot(leaf);

    await expect(distributor.connect(claimant).claim(0, claimant.address, amount, [])).to.emit(distributor, "Claimed");
    expect(await token.balanceOf(claimant.address)).to.equal(amount);

    await expect(distributor.connect(claimant).claim(0, claimant.address, amount, [])).to.be.revertedWithCustomError(
      distributor,
      "AlreadyClaimed"
    );
  });

  it("supports multiple rounds and pausing", async () => {
    const { owner, claimant, token, distributor } = await deployFixture();
    const amount = ethers.utils.parseEther("50");
    await token.mint(distributor.address, amount.mul(2));

    const firstLeaf = buildLeaf(0, claimant.address, amount.toString());
    await distributor.connect(owner).setRoot(firstLeaf);
    await distributor.connect(owner).pause();
    await expect(distributor.connect(claimant).claim(0, claimant.address, amount, [])).to.be.revertedWith(
      "Pausable: paused"
    );
    await distributor.connect(owner).unpause();
    await distributor.connect(claimant).claim(0, claimant.address, amount, []);

    const secondLeaf = buildLeaf(1, claimant.address, amount.toString());
    await distributor.connect(owner).setRoot(secondLeaf);
    await distributor.connect(claimant).claim(1, claimant.address, amount, []);
    expect(await token.balanceOf(claimant.address)).to.equal(amount.mul(2));
  });

  it("rejects invalid proofs", async () => {
    const { owner, claimant, token, distributor } = await deployFixture();
    const amount = ethers.utils.parseEther("25");
    await token.mint(distributor.address, amount);

    const leaf = buildLeaf(0, claimant.address, amount.toString());
    await distributor.connect(owner).setRoot(leaf);

    await expect(distributor.connect(claimant).claim(0, claimant.address, amount.mul(2), [])).to.be.revertedWithCustomError(
      distributor,
      "InvalidProof"
    );
  });
});
