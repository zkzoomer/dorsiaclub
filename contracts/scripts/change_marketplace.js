const { ethers } = require("hardhat");
const hre = require("hardhat");

const bCardAddress = "0x384c8072DA488698Df87c02cDf04499262D4697f";
const bCardAbi = require('../artifacts/contracts/BusinessCard.sol/BusinessCard.json')['abi']

async function main() {
    const [deployer] = await ethers.getSigners();
    const provider = new ethers.providers.JsonRpcProvider("https://rpc-mumbai.maticvigil.com")

    const bCardContract = new ethers.Contract(bCardAddress, bCardAbi, provider)
    /* await bCardContract.connect(deployer).withdraw()
    console.log('withdrawn') */

    const mPlaceContract = await ethers.getContractFactory("Marketplace");
    const mPlace = await mPlaceContract.deploy(bCardAddress);
	  await bCardContract.connect(deployer).setMarketplace(mPlace.address);
    await mPlace.connect(deployer).startSale()

    console.log("New marketplace: ", mPlace.address)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
