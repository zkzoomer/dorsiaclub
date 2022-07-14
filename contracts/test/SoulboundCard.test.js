/* const {
    shouldBehaveLikeERC721,
    shouldBehaveLikeERC721Metadata,
    shouldBehaveLikeERC721Enumerable,
    shouldBehaveLikeSoulboundCard,
} = require('./SoulboundCard.behavior');
  
const BusinessCard = artifacts.require('BusinessCard');
const Marketplace = artifacts.require('Marketplace');
const SoulboundCard = artifacts.require('SoulboundCard');

contract('SoulboundCard', function (accounts) {
    const bCardName = 'NFT Business Cards';
    const bCardSymbol = 'BCARD';
    const sCardName = 'Soulbound Business Cards';
    const sCardSymbol = 'SCARD';

    beforeEach(async function () {
        // Deploying the contract first
        this.bCard = await BusinessCard.new(bCardName, bCardSymbol, '', '');
        // Defining the oracle for the contract, which will be the second address
        await this.bCard.setOracle(accounts[1]);

        // Deploying the Marketplace
        this.mPlace = await Marketplace.new(this.bCard.address);

        // Deploying the Soulbound Cards
        this.sCard = await SoulboundCard.new(sCardName, sCardSymbol, this.bCard.address);

        // Add these smart contracts to bCard
        await this.bCard.setMarketplace(this.mPlace.address);
        await this.bCard.setSoulboundCard(this.sCard.address);

        // Starting the token sale to enable minting and trading
        await this.bCard.startSale();
        await this.mPlace.startSale();
    });

    shouldBehaveLikeERC721('ERC721', ...accounts);
    shouldBehaveLikeERC721Metadata('ERC721', bCardName, bCardSymbol, sCardName, sCardSymbol, ...accounts);
    shouldBehaveLikeERC721Enumerable('ERC721', ...accounts);
    shouldBehaveLikeSoulboundCard('SCARD', ...accounts);
}); */