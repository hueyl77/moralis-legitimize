const hre = require("hardhat");
const fs = require('fs');

async function main() {

  const LegitNFT = await hre.ethers.getContractFactory("LegitNFT");
  const legitNFT = await LegitNFT.deploy();
  await legitNFT.deployed();

  console.log("LegitNFT deployed to:", legitNFT.address);

  const LegitSignature = await hre.ethers.getContractFactory("LegitSignature");
  const legitSignature = await LegitSignature.deploy();
  await legitSignature.deployed();

  // set address
  await legitSignature.setLegitNFTAddr(legitNFT.address);

  console.log("LegitSignature deployed to:", legitSignature.address);

  fs.writeFileSync('./config.js', `
    export const legitSignatureAddress = "${legitSignature.address}";
    export const legitNFTAddress = "${legitNFT.address}";
  `)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });