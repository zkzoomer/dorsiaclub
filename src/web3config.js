import { ethers } from "ethers"; 

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
export const bCardAddress = '0xF6757B78Bf1063cE7F5004e6fcB1dBbEE2d64e10'
export const bCardAbi = require('./abis/BusinessCard.json')['abi']

export const mPlaceAddress = "0x0B609Bd8CCa4aCF85724e449316110fc81b820a0";
export const mPlaceAbi = require('./abis/Marketplace.json')['abi'];

export const sCardAddress = "0x522b44bD500e5eD5563A36E735690a4a6a0A1473";
export const sCardAbi = require('./abis/SoulboundCard.json')['abi'];

// Default URI fed to the smart contract
export const defaultURI = 'bafkreiexdok6ezqxwwgd57zxdg5yaxfxm5w4suu2iw33opkr35rajg5qz4'

// Card minting and updating requirements
export const mintPrice = ethers.utils.parseUnits("0.1","ether");
export const updatePrice = ethers.utils.parseUnits("0.05","ether");
export const _updatePrice = 0.05;

export const mPlaceOracleFee = ethers.utils.parseUnits("0.025", "ether")

// Card naming requirements
export const maxNameLength = 22;
export const maxPositionLength = 32;
