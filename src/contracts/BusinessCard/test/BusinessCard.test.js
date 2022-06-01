const {
    shouldBehaveLikeBusinessCard,
  } = require('./BusinessCard.behavior');
  
const BusinessCard = artifacts.require('BusinessCard');

contract('CARD', function (accounts) {
  const name = 'Business Card';
  const symbol = 'CARD';
  const baseURI = 'https://gateway.pinata.cloud/ipfs/';
  const defaultURI = 'QmPEe7JFEWUFAkoR8b5sPe85ni9DThALTAKnGCfLaHtm1h';

  beforeEach(async function () {
      // Deploying the contract first
      this.token = await BusinessCard.new(name, symbol, baseURI, defaultURI);
  });

  shouldBehaveLikeBusinessCard(baseURI, defaultURI, ...accounts);
});