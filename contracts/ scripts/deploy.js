const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contract with:", deployer.address);

  const zkResumeSnapshot = await hre.ethers.getContractFactory("zkResumeSnapshot");
  const contract = await zkResumeSnapshot.deploy();

  await contract.deployed();

  console.log("zkResumeSnapshot deployed to:", contract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
