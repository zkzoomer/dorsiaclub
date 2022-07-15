import { ethers } from "ethers"; 

// AVAX testnet:
export const chainId = 80001;

export const network = {
  chainId: `0x${Number(chainId).toString(16)}`,
  chainName: "Mumbai",
  nativeCurrency: {
    name: "Polygon",
    symbol: "MATIC",
    decimals: 18
  },
  rpcUrls: ["https://rpc-mumbai.maticvigil.com"],
  blockExplorerUrls: ["https://mumbai.polygonscan.com"]
};

/* export const config = {
    readOnlyChainId: chainId,
    readOnlyUrls: {
      [chainId]: RPC,
    },
}; */

// Business Card smart contract
export const bCardAddress = '0x384c8072DA488698Df87c02cDf04499262D4697f'
export const bCardAbi = require('./abis/BusinessCard.json')['abi']

export const mPlaceAddress = "0x06F3190bcd140b38937191e5572F8ffbbC60B482";
export const mPlaceAbi = require('./abis/Marketplace.json')['abi'];

export const sCardAddress = "0x2bB46b998013Bc7dc0A96De6E7DC1367f8EfddFf";
export const sCardAbi = require('./abis/SoulboundCard.json')['abi'];

// Default URI fed to the smart contract
export const defaultURI = 'https://dorsiaclub.mypinata.cloud/ipfs/QmbFp3rybuvZ7j9e4xB6WLedu8gvLcjbVqUrGUEugQWz9u'

// Card minting and updating requirements
export const mintPrice = ethers.utils.parseUnits("0.1","ether");
export const updatePrice = ethers.utils.parseUnits("0.05","ether");
export const _updatePrice = 0.05;

export const mPlaceOracleFee = ethers.utils.parseUnits("0.015", "ether")

// Card naming requirements
export const maxNameLength = 22;
export const maxPositionLength = 32;
