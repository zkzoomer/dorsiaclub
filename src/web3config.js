import { ethers } from "ethers"; 

export const chainId = 1029;

export const network = {
  chainId: `0x${Number(chainId).toString(16)}`,
  chainName: "BitTorrent Chain Donau",
  nativeCurrency: {
    name: "BitTorrent",
    symbol: "BTT",
    decimals: 18
  },
  rpcUrls: ["https://testscan.bt.io/"],
  blockExplorerUrls: ["https://testnet.bttcscan.com/"]
};

/* export const chainId = 80001;

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
}; */

/* export const config = {
    readOnlyChainId: chainId,
    readOnlyUrls: {
      [chainId]: RPC,
    },
}; */

// Business Card smart contract
export const bCardAddress = '0xac2ef62E283A61D05A1f0a00CF9C8E6d74Ef43ca'
export const bCardAbi = require('./abis/BusinessCard.json')['abi']

export const mPlaceAddress = "0x952F56CBAB21Fcef245ab854B900638b05668EB9";
export const mPlaceAbi = require('./abis/Marketplace.json')['abi'];

export const sCardAddress = "0x8568c662c4c00F095b2D86f2179A86D823A4379b";
export const sCardAbi = require('./abis/SoulboundCard.json')['abi'];

// Default URI fed to the smart contract
export const defaultURI = 'https://dorsiaclub.mypinata.cloud/ipfs/QmbFp3rybuvZ7j9e4xB6WLedu8gvLcjbVqUrGUEugQWz9u'

// Card minting and updating requirements
export const mintPrice = ethers.utils.parseUnits("10000","ether");
export const updatePrice = ethers.utils.parseUnits("5000","ether");
export const _updatePrice = 0.05;

export const mPlaceOracleFee = ethers.utils.parseUnits("1500", "ether")

// Card naming requirements
export const maxNameLength = 22;
export const maxPositionLength = 32;
