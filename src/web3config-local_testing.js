import { ethers } from "ethers"; 

// Avalanche network: 
/* export const chainId = 43114;
export const RPC = 'https://api.avax.network/ext/bc/C/rpc'
export const network = {
  chainId: `0x${Number(chainId).toString(16)}`,
  chainName: "Avalanche Network",
  nativeCurrency: {
    name: "AVAX",
    symbol: "AVAX",
    decimals: 18
  },
  rpcUrls: [RPC],
  blockExplorerUrls: ["https://snowtrace.io/"]
};

export const config = {
    readOnlyChainId: chainId,
    readOnlyUrls: {
      [chainId]: RPC,
    },
}; */

// Local testing:
export const chainId = 1337;
export const RPC = "http://127.0.0.1:7545"
export const network = {
  chainId: `0x${Number(chainId).toString(16)}`,
  chainName: "Ganache Blockchain",
  nativeCurrency: {
    name: "LOCAL",
    symbol: "ETH",
    decimals: 18
  },
  rpcUrls: [RPC],
};

export const config = {
    readOnlyChainId: chainId,
    readOnlyUrls: {
      [chainId]: RPC,
    },
};

// Business Card smart contract
export const contractAddress = '0x116a1be1A9Aee6D2560eabDCCB51Fd509FdaA86B'
const contractAbi = require('./contracts/BusinessCard/build/contracts/BusinessCard.json')['abi']
const provider = new ethers.providers.JsonRpcProvider(RPC)
export const contract = new ethers.Contract(contractAddress, contractAbi, provider)

// Default URI fed to the smart contract
export const defaultURI = 'https://dorsiaclub.mypinata.cloud/ipfs/QmWvpigvigFzfXwTMhEF2zvWGbmpzHGf6pUfvkdvbiiUS9'

// Card minting and updating requirements
export const mintPrice = ethers.utils.parseUnits("0.01","ether");
export const updatePrice = ethers.utils.parseUnits("0.015","ether");

// Card naming requirements
export const maxNameLength = 22;
export const maxPositionLength = 32;
