import { ethers } from "hardhat";

async function main() {
  const Bridge = await ethers.getContractFactory("Bridge");
  const bridge = await Bridge.deploy("0x537C2BBD0856EE275bC0bE348d8Ef80a389dfE8f");

  await bridge.deployed();

  console.log("Bridge deployed to:", bridge.address);
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });