import { expect } from "chai";
import { ethers } from "hardhat";

describe("EarlyBirdAllowlist", function () {
  function computeLeaf(account: string) {
    return ethers.utils.keccak256(
      ethers.utils.hexConcat([
        ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(["address"], [account])),
      ])
    );
  }

  it("verifies eligibility", async () => {
    const [owner, user, other] = await ethers.getSigners();
    const Allowlist = await ethers.getContractFactory("EarlyBirdAllowlist");
    const allowlist = await Allowlist.deploy(owner.address);
    await allowlist.deployed();

    const leaf = computeLeaf(user.address);
    await allowlist.connect(owner).setMerkleRoot(leaf);

    expect(await allowlist.isEligible(user.address, [])).to.equal(true);
    expect(await allowlist.isEligible(other.address, [])).to.equal(false);
  });
});
