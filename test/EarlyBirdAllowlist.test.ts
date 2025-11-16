import { expect } from "chai";
import { ethers } from "hardhat";

function computeLeaf(account: string, allocation: string) {
  return ethers.utils.keccak256(
    ethers.utils.hexConcat([
      ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(["address", "uint256"], [account, allocation])),
    ])
  );
}

describe("EarlyBirdAllowlist", function () {
  it("verifies and consumes allocations", async () => {
    const [owner, consumer, buyer] = await ethers.getSigners();
    const Allowlist = await ethers.getContractFactory("EarlyBirdAllowlist");
    const allowlist = await Allowlist.deploy(owner.address);
    await allowlist.deployed();

    const allocation = ethers.utils.parseEther("100");
    const root = computeLeaf(buyer.address, allocation.toString());
    await allowlist.connect(owner).setRoot(root);
    await allowlist.connect(owner).setTrustedConsumer(consumer.address, true);

    expect(await allowlist.verify(buyer.address, allocation, [])).to.equal(true);

    await expect(
      allowlist
        .connect(consumer)
        .consume(buyer.address, allocation, ethers.utils.parseEther("60"), [])
    ).to.emit(allowlist, "Consumed");

    await expect(
      allowlist
        .connect(consumer)
        .consume(buyer.address, allocation, ethers.utils.parseEther("50"), [])
    ).to.be.revertedWithCustomError(allowlist, "ExceedsAllocation");

    expect(await allowlist.remaining(buyer.address)).to.equal(allocation.sub(ethers.utils.parseEther("60")));
  });

  it("blocks unauthorized consumers", async () => {
    const [owner, buyer] = await ethers.getSigners();
    const Allowlist = await ethers.getContractFactory("EarlyBirdAllowlist");
    const allowlist = await Allowlist.deploy(owner.address);
    await allowlist.deployed();

    await allowlist.connect(owner).setRoot(computeLeaf(buyer.address, "100"));

    await expect(
      allowlist.connect(buyer).consume(buyer.address, 100, 10, [])
    ).to.be.revertedWithCustomError(allowlist, "NotAuthorized");
  });
});
