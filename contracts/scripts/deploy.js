const { ethers } = require("hardhat");
const hre = require("hardhat");

const baseURI = 'https://dorsiaclub.mypinata.cloud/ipfs/Qm';
const defaultURI = 'bFp3rybuvZ7j9e4xB6WLedu8gvLcjbVqUrGUEugQWz9u';
const oracleAddress = '0xdDD03F9E31AB2dE5D7DCB261210c3bC76ca62AE8';

async function main() {
	const [deployer] = await ethers.getSigners();

	console.log("Deploying contracts with the account:", deployer.address);

	console.log("Account balance:", (await deployer.getBalance()).toString());

	const bCardContract = await ethers.getContractFactory("BusinessCard");
	const mPlaceContract = await ethers.getContractFactory("Marketplace");
	const sCardContract = await ethers.getContractFactory("SoulboundCard");

	const bCard = await bCardContract.deploy('Business Card', 'BCARD', baseURI, defaultURI);
	await bCard.setOracle(oracleAddress);

	const mPlace = await mPlaceContract.deploy(bCard.address);
	await bCard.setMarketplace(mPlace.address);

	const sCard = await sCardContract.deploy('Soulbound Card', 'SCARD', bCard.address);
	await bCard.setSoulboundCard(sCard.address);

	await bCard.startSale();
	await mPlace.startSale();

	console.log("Contracts were successfully deployed at:");
	console.log("Business Card: ", bCard.address);
	console.log("Marketplace: ", mPlace.address);
	console.log("Soulbound Card: ", sCard.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
