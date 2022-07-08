# Dorsia Club - Smart Contracts

The idea behind Dorsia Club is based on a trio of smart contracts: the _Business Card_, the _Marketplace_ and the _Soulbound Card_.

### _BusinessCard.sol_
An ERC-721 compatible smart contract, allowing users to mint their own NFT Business Cards. In doing so, they can customize their own tokens by giving the name and position that they will like shown on the token's image. They may also provide their usernames for a series of social media platforms loved by the crypto community at large: Twitter, Telegram, Discord...

The resulting NFT metadata is pinned on ipfs, but has user selected attributes: a fully dynamic, customizable and decentralized NFT.

### _Marketplace.sol_
A native NFT marketplace designed for the trading of Business Cards, as they allow users to update the tokens that they buy from the marketplace (specifying a new name, posiiton, and links, if they wish), but without having to pay the update fee.

### _SoulboundCard.sol_
Owners of any Business Card can choose to send copies of it to anyone as a Soulbound Card. This token being sent is ERC-721 compatible, and shares the same attributes as the Business Card it is being copied from, but it cannot be transferred. As a Business Card holds all of your important links, it can act as a sort of _NFT landing page_. A receiver (or the sender) is still able to _burn_ a Soulbound Card, if they wish to dissasociate themselves with it.
## Testing

To test the smart contracts

```
npx hardhat test
```

To deploy the Business Card smart contract for testing the oracle, with a Ganache client running do:

```
truffle migrate --network development
```