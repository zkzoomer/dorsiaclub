/* const {
    shouldBehaveLikeBusinessCard,
  } = require('./BusinessCard.behavior');
  
const BusinessCard = artifacts.require('BusinessCard');

contract('Business Card', function (accounts) {
  const name = 'Business Card';
  const symbol = 'BCARD';
  const baseURI = 'https://gateway.pinata.cloud/ipfs/Qm';
  const defaultURI = 'bFp3rybuvZ7j9e4xB6WLedu8gvLcjbVqUrGUEugQWz9u';

  beforeEach(async function () {
      // Deploying the contract first
      this.token = await BusinessCard.new(name, symbol, baseURI, defaultURI);
  });

  shouldBehaveLikeBusinessCard(baseURI, defaultURI, ...accounts);
}); */