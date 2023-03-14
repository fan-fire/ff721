import { ethers } from "hardhat";

async function main() {
  const FF721 = await ethers.getContractFactory("FF721");
  const ff721 = await FF721.deploy();

  await ff721.deployed();

  console.log(
    `FF721 deployed to: ${ff721.address}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
