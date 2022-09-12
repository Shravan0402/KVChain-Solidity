const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    const KYContract = await hre.ethers.getContractFactory("KYChain")
    const KYChain = await KYContract.deploy()
    await KYChain.deployed()
    console.log(KYChain.address)
  }

  
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
