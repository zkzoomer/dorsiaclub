# Dorsia Club - Customizable NFT Business Cards

The original idea behind this project was to create an NFT that users could customize, so that they could truly own their token: a dynamic NFT.

The end result is an NFT Business Card whose assets get randomly generated at the time of minting, but which has name and positions that get defined by the user.

## The Business Card

The NFT is powered by the Business Card [smart contract](./src/contracts/BusinessCard/contracts/BusinessCard.sol), which is an extension of the ERC-721 token standard. What these changes do, in short, is:
- Store the name, position, and genes (used to generate the asset) of each Business Card on-chain
- [Validate](./src/contracts/BusinessCard/contracts/BusinessCardUtils.sol) the name and position directly on-chain, to ensure that the oracle is able to generate the asset
- Allow a whitelisted oracle to update the token metadata once it has constructed the corresponding Business Card
- Allows an end user to mint a new Card, change the name and/or position of a Card they own, or swap the name and position between two Cards they own
- Emits a new event every time a Business Card gets updated so that it can be picked up by the oracle
- Automatically funds the oracle so that it can perform its callback and update Business Cards as required

## The Oracle

The [oracle](./src/oracle/oracle.py) is continuously listening for new update events, that indicate it that it needs to generate a new Business Card image. The assets that define this image are given by the genes attribute from the smart contract. The oracle constructs this [Business Card](./src/oracle/card.py), and will then upload this image onto IPFS. The resulting token metadata IPFS hash is uploaded on-chain. This hole process can take as little as 30 seconds.

If you wish to test the functioning of this oracle on a local blockchain, you can follow these [instructions](./src/oracle/README.md).

## The Website

Built on React.js and supporting Metamask, it allows end users to:
- Mint new Business Cards
- Check the gallery to see all existing Cards/the ones they own
- Change the name and/or position of a Card they own
- Swap the name and position between two Cards they own

## Links and resources

A demo version deployed in the Mumbai testnet can be seen on: https://dorsiaclub-testnet.netlify.app/
You can get some testnet MATIC over at: https://faucet.polygon.technology/
Go ahead and mint yours, free of charge.

Business Card smart contract: [0x798E1eFBFFB2d6315d1Ab62Cd80C1c56A7C5E70d](https://mumbai.polygonscan.com/address/0x798E1eFBFFB2d6315d1Ab62Cd80C1c56A7C5E70d)
Oracle address: [0xdDD03F9E31AB2dE5D7DCB261210c3bC76ca62AE8](https://mumbai.polygonscan.com/address/0xdDD03F9E31AB2dE5D7DCB261210c3bC76ca62AE8)

Reach out on Twitter: https://twitter.com/0xdeenz