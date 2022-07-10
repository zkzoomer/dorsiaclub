const BusinessCard = artifacts.require("BusinessCard");

/**
 * For proper functioning and security, the BusinessCard smart contract needs to be deployed by
 * a different address than the CardOracle smart contract. We assume that the CardOracle owner
 * may be compromised, but the BusinessCard owner will not.
 * 
 * For testing, we use the same seed phrase to generate these two accounts. During deployment, 
 * the server oracle will generate a new seed phrase every time the oracle gets redeployed.
 */

module.exports = function (deployer) {
  deployer.deploy(BusinessCard, 'Business Card', 'BCARD', 'https://dorsiaclub.mypinata.cloud/ipfs/Qm', 'bFp3rybuvZ7j9e4xB6WLedu8gvLcjbVqUrGUEugQWz9u');
};