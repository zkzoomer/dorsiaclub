# Dorsia Club - Decentralized Oracle

Since an IPFS content identifier (CID) is generated deterministically, different parties creating identical Business Cards will arrive at the same CID. This can be used to decentralize the oracle that generates Business Cards, allowing their owners to generate Cards and interact with an additional smart contract that would act as the oracle.

By doing this, the future of the project would be further entrusted to the hands of the community, as no other party could possibly tamper with the generation of new NFT metadata.

# Dorsia Club - Dynamic NFT Oracle

This oracle allows for the automatic generation of NFT card images as they get minted or updated. The program will simply listen to every *NewRequestEvent* after a set block number and proceed accordingly: 

The oracle will create a new Business Card image with the provided name and positions and using the randomly assigned genes as attributes, and then upload the resulting IPFS hash on chain by executing a *callback* transaction.
It is important to note that only the assigned oracle will have access to this *callback* function of the BusinessCard smart contract

### Testing the oracle

The oracle was tested by first using a Ganache local blockchain, and then deploying on a testnet. You can recreate this first step by running [oracle.py](src/oracle.py), after following these instructions:
- Install [Ganache](https://trufflesuite.com/ganache/) if you do not have it already
- Create new workspace (recommended at least 1000 ETH as starting balance)
- Create a new textfile under ./doc containing the seed phrase, sneed.txt
- Deplete the balance of the first address in your truffle environment. This address will serve as the oracle. You can do so by running:
```
web3.eth.sendTransaction({to: accounts[2], from: accounts[0], value: web3.utils.toWei('999.9982')})
```
- Set the second account as the main one in your truffle environment, achieved by setting truffle-config.js as:

```
networks: {
    development: {
        host: "localhost",
        port: 7545,
        network_id: "5777",
        from: "SECOND_ACCOUNT_ADDRESS"
    },
}
```

- Deploy the Business Card smart contract via truffle migrate and set oracle on the first address
- Set the Card smart contract address on the __main__  [oracle.py](src/oracle.py)
- Define the baseURI and defaultURI to be used for testing
- Start the sale and test accordingly