### Testing the oracle

This oracle was tested by using a Ganache local blockchain. You can recreate it by running [oracle.py](./oracle.py), after following these instructions:
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
- Set the Card smart contract address on the __main__  [oracle.py](./oracle.py)
- Define the baseURI and defaultURI to be used for testing
- Start the sale and test accordingly