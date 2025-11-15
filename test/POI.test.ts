import { expect } from "chai";
import { ethers } from "hardhat";

const PERMIT_TYPE = {
  Permit: [
    { name: "owner", type: "address" },
    { name: "spender", type: "address" },
    { name: "value", type: "uint256" },
    { name: "nonce", type: "uint256" },
    { name: "deadline", type: "uint256" },
  ],
};

describe("POI", function () {
  it("mints initial supply and enforces roles", async () => {
    const [admin, user] = await ethers.getSigners();
    const initialSupply = ethers.utils.parseEther("1000");
    const Poi = await ethers.getContractFactory("POI");
    const poi = await Poi.deploy(admin.address, admin.address, initialSupply);
    await poi.deployed();

    expect(await poi.balanceOf(admin.address)).to.equal(initialSupply);

    await expect(poi.connect(user).mint(user.address, 1))
      .to.be.revertedWithCustomError(poi, "AccessControlUnauthorizedAccount")
      .withArgs(user.address, await poi.MINTER_ROLE());

    const mintAmount = ethers.utils.parseEther("10");
    await poi.connect(admin).mint(user.address, mintAmount);
    expect(await poi.balanceOf(user.address)).to.equal(mintAmount);
  });

  it("allows designated distributors to mint for off-chain flows", async () => {
    const [admin, distributor, recipient] = await ethers.getSigners();
    const Poi = await ethers.getContractFactory("POI");
    const poi = await Poi.deploy(admin.address, admin.address, 0);
    await poi.deployed();

    const role = await poi.OFFCHAIN_DISTRIBUTOR_ROLE();
    await expect(poi.connect(distributor).mintForDistribution(recipient.address, 1))
      .to.be.revertedWithCustomError(poi, "AccessControlUnauthorizedAccount")
      .withArgs(distributor.address, role);

    await poi.connect(admin).grantRole(role, distributor.address);

    const distributionAmount = ethers.utils.parseEther("25");
    await poi.connect(distributor).mintForDistribution(recipient.address, distributionAmount);

    expect(await poi.balanceOf(recipient.address)).to.equal(distributionAmount);
  });

  it("supports permit authorization", async () => {
    const [admin, owner, spender] = await ethers.getSigners();
    const initialSupply = ethers.utils.parseEther("1000");
    const Poi = await ethers.getContractFactory("POI");
    const poi = await Poi.deploy(admin.address, admin.address, initialSupply);
    await poi.deployed();

    const amount = ethers.utils.parseEther("5");
    await poi.connect(admin).mint(owner.address, amount);

    const chainId = (await poi.provider.getNetwork()).chainId;
    const deadline = (await ethers.provider.getBlock("latest")).timestamp + 3600;
    const nonce = await poi.nonces(owner.address);

    const signature = await owner._signTypedData(
      {
        name: await poi.name(),
        version: "1",
        chainId,
        verifyingContract: poi.address,
      },
      PERMIT_TYPE,
      {
        owner: owner.address,
        spender: spender.address,
        value: amount,
        nonce,
        deadline,
      }
    );

    const { v, r, s } = ethers.utils.splitSignature(signature);
    await poi.connect(spender).permit(owner.address, spender.address, amount, deadline, v, r, s);
    expect(await poi.allowance(owner.address, spender.address)).to.equal(amount);
  });

  it("blocks transfers while paused", async () => {
    const [admin, user] = await ethers.getSigners();
    const Poi = await ethers.getContractFactory("POI");
    const poi = await Poi.deploy(admin.address, admin.address, ethers.utils.parseEther("100"));
    await poi.deployed();

    const amount = ethers.utils.parseEther("10");
    await poi.connect(admin).mint(user.address, amount);

    await poi.connect(admin).pause();
    await expect(poi.connect(user).transfer(admin.address, 1)).to.be.revertedWith("POI: token paused");

    await poi.connect(admin).unpause();
    await poi.connect(user).transfer(admin.address, 1);
    expect(await poi.balanceOf(admin.address)).to.be.gt(0);
  });
});
