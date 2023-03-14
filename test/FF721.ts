import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("FF721", function () {
  async function deployFF721Fixture() {
    const [owner, otherAccount] = await ethers.getSigners();

    const FF721 = await ethers.getContractFactory("FF721");
    const ff721 = await FF721.deploy();

    return { ff721, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should set the name", async function () {
      const { ff721 } = await loadFixture(deployFF721Fixture);

      expect(await ff721.name()).to.equal("FanFire 721");
    });
  });
});
