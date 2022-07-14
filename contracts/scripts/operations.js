const { ethers } = require("hardhat");
const hre = require("hardhat");

const bCardAddress = "0x384c8072DA488698Df87c02cDf04499262D4697f";
const bCardAbi = require('../artifacts/contracts/BusinessCard.sol/BusinessCard.json')['abi']
const mPlaceAddress = "0x06F3190bcd140b38937191e5572F8ffbbC60B482";
const mPlaceAbi = require('../artifacts/contracts/Marketplace.sol/Marketplace.json')['abi']

async function main() {
    const [deployer] = await ethers.getSigners();
    const provider = new ethers.providers.JsonRpcProvider("https://rpc-mumbai.maticvigil.com")

    const mPlace = new ethers.Contract(mPlaceAddress, mPlaceAbi, provider)
    const bCard = new ethers.Contract(bCardAddress, bCardAbi, provider)
    /* await bCardContract.connect(deployer).withdraw()
    console.log('withdrawn') */
    /* await bCard.connect(deployer).approve(mPlace.address, '1') */

    /* const price = ethers.utils.parseEther('0.1');
    await mPlace.connect(deployer).createMarketItem('1', price) */

    const listing = await mPlace.getLatestMarketItemByTokenId('1')
    console.log(listing)

    /* 
    [
        [
          BigNumber { value: "1" },
          BigNumber { value: "1" },
          '0x69BAAA26EeA1056C74796c9a523d61a73fbd8Cf3',
          '0x0000000000000000000000000000000000000000',
          BigNumber { value: "100000000000000000" },
          false,
          false,
          itemId: BigNumber { value: "1" },
          tokenId: BigNumber { value: "1" },
          seller: '0x69BAAA26EeA1056C74796c9a523d61a73fbd8Cf3',
          owner: '0x0000000000000000000000000000000000000000',
          price: BigNumber { value: "100000000000000000" },
          isSold: false,
          isCancelled: false
        ],
        true
    ] 
    */
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
