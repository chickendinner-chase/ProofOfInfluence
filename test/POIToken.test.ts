import { expect } from "chai";
import { ethers } from "hardhat";

describe("POIToken", function () {
  async function deployToken() {
    const [admin, treasury, user, minter] = await ethers.getSigners();
    const initialSupply = ethers.utils.parseEther("1000");
    const Token = await ethers.getContractFactory("POIToken");
    const token = await Token.deploy(admin.address, treasury.address, initialSupply);
    await token.deployed();

    return { token, admin, treasury, user, minter, initialSupply };
  }

  it("mints initial supply to the treasury and restricts minting", async () => {
    const { token, treasury, user, admin } = await deployToken();
    expect(await token.balanceOf(treasury.address)).to.equal(ethers.utils.parseEther("1000"));
    await expect(token.connect(user).mint(user.address, 1))
      .to.be.revertedWithCustomError(token, "AccessControlUnauthorizedAccount")
      .withArgs(user.address, await token.MINTER_ROLE());

    await token.connect(admin).updateMinter(user.address, true);
    await expect(token.connect(user).mint(user.address, 1)).to.emit(token, "Minted");
  });

  it("blocks transfers when paused or blacklisted", async () => {
    const { token, admin, user } = await deployToken();
    await token.connect(admin).updateMinter(admin.address, true);
    await token.connect(admin).mint(user.address, ethers.utils.parseEther("10"));

    await token.connect(admin).pause();
    await expect(token.connect(user).transfer(admin.address, 1)).to.be.revertedWith("Pausable: paused");

    await token.connect(admin).unpause();
    await token.connect(admin).updateBlacklist(user.address, true);
    await expect(token.connect(user).transfer(admin.address, 1)).to.be.revertedWithCustomError(
      token,
      "BlacklistedAddress"
    );
  });

  it("allows burning and emits events", async () => {
    const { token, admin, user } = await deployToken();
    await token.connect(admin).updateMinter(admin.address, true);
    const amount = ethers.utils.parseEther("5");
    await token.connect(admin).mint(user.address, amount);

    await expect(token.connect(user).burn(amount)).to.emit(token, "Burned").withArgs(user.address, amount);
    expect(await token.balanceOf(user.address)).to.equal(0);
  });

  it("exposes decimals and treasury management", async () => {
    const { token, admin } = await deployToken();
    expect(await token.decimals()).to.equal(18);
    const [, , , newTreasury] = await ethers.getSigners();
    await expect(token.connect(admin).setTreasury(ethers.constants.AddressZero)).to.be.revertedWithCustomError(
      token,
      "InvalidAddress"
    );
    await token.connect(admin).setTreasury(newTreasury.address);
    expect(await token.treasury()).to.equal(newTreasury.address);
  });
});
