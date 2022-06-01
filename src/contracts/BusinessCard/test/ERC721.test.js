/* *
 * Taken from https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/test/token/ERC721/ERC721.test.js
 * Adapted to meet the Business Card deployment requirements, namely the definition of a server oracle and the
 * following start of trading
 */

/* const {
    shouldBehaveLikeERC721,
    shouldBehaveLikeERC721Metadata,
    shouldBehaveLikeERC721Enumerable,
  } = require('./ERC721.behavior');
  
const BusinessCard = artifacts.require('BusinessCard');

contract('ERC721', function (accounts) {
  const name = 'NFT Business Cards';
  const symbol = 'CARD';

  beforeEach(async function () {
      // Deploying the contract first
      this.token = await BusinessCard.new(name, symbol, '', '');
      // Defining the oracle for the contract, which will be the second address
      await this.token.setOracle(accounts[1]);
      // Starting the token sale to enable minting
      await this.token.startSale();
  });

  shouldBehaveLikeERC721('ERC721', ...accounts);
  shouldBehaveLikeERC721Metadata('ERC721', name, symbol, ...accounts);
  shouldBehaveLikeERC721Enumerable('ERC721', ...accounts)
}); */