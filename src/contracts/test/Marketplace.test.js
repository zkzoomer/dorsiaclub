const { expect } = require('chai')
const { ethers } = require('hardhat')
const { BigNumber } = require('ethers')

describe('Contract: Marketplace', function () {
  const provider = ethers.provider;
  let deployer, oracle, seller, buyer;
  let bCard
  let marketplaceContract

  const mintPrice = ethers.utils.parseEther('0.1');
  const updatePrice = ethers.utils.parseEther('0.05');
  const oracleFee = ethers.utils.parseEther('0.015');
  const oracleCallbackTokenURI = 'Ur63bgQq3VWW9XsVviDGAFwYEZVs9AFWsTd56T9xCQmf'

  const firstToken = ['Patrick BATEMAN', ['Vice President', '', '', '', '0', '', '', '']];
  const secondToken = ['Paul ALLEN', ['Vice President', '', '', '', '0', '', '', '']];
  const thirdToken = ['David VAN PATTEN', ['Vice President', '', '', '', '0', '', '', '']];
  const fourthToken = ['Timothy BRYCE', ['Vice President', '', '', '', '0', '', '', '']];

  const name = 'Business Card';
  const symbol = 'CARD';
  const baseURI = 'https://gateway.pinata.cloud/ipfs/Qm';
  const defaultURI = 'PEe7JFEWUFAkoR8b5sPe85ni9DThALTAKnGCfLaHtm1h';

  async function deployContractsAndSetAddresses () {
    [deployer, oracle, seller, buyer] = await ethers.getSigners();

    const BusinessCard = await ethers.getContractFactory('BusinessCard');
    bCard = await BusinessCard.deploy(name, symbol, baseURI, defaultURI);
    await bCard.setOracle(oracle.address);
    await bCard.startSale();

    const Marketplace = await ethers.getContractFactory('Marketplace')
    marketplaceContract = await Marketplace.deploy(bCard.address)
    await marketplaceContract.deployed()

    await bCard.setMarketplace(marketplaceContract.address);
  }

  beforeEach(deployContractsAndSetAddresses)

  async function mintTokenAndCreateMarketItem (tokenId, price, name = firstToken[0], properties = firstToken[1], account = seller) {
    await bCard.connect(account).getCard(name, properties, {value: mintPrice})
    await bCard.connect(oracle).callback(tokenId, oracleCallbackTokenURI)
    await bCard.connect(account).setApprovalForAll(marketplaceContract.address, true)
    return marketplaceContract.connect(account).createMarketItem(tokenId, price)
  }

  it('creates a MarketItem', async function () {
    // Arrange
    const tokenId = 1
    const price = ethers.utils.parseEther('10')

    // Act and Assert
    await expect(mintTokenAndCreateMarketItem(tokenId, price))
      .to.emit(marketplaceContract, 'MarketItemCreated')
      .withArgs(
        1,
        tokenId,
        seller.address,
        ethers.constants.AddressZero,
        price,
        false,
        false
      )
  })

  it('creates successive market items for the same token id by buying and selling', async function () {
    // Arrange
    const token1id = 1
    const price = ethers.utils.parseEther('0.1')


    // Account1 mints a token and puts it up for sale
    await bCard.connect(seller).getCard(firstToken[0], firstToken[1], { value: mintPrice })
    await bCard.connect(oracle).callback(1, oracleCallbackTokenURI)
    await bCard.connect(seller).approve(marketplaceContract.address, token1id)
    await marketplaceContract.connect(seller).createMarketItem(token1id, price)

    // Account2 buys the token
    const token1marketItemId = 1
    await marketplaceContract.connect(buyer).createMarketSale(token1marketItemId, secondToken[0], secondToken[1], { value: BigInt(price) + BigInt(oracleFee) })
    await bCard.connect(oracle).callback(1, oracleCallbackTokenURI)

    // Account 2 puts token 1 for sale
    await bCard.connect(buyer).approve(marketplaceContract.address, token1id)
    await marketplaceContract.connect(buyer).createMarketItem(token1id, price)

    // Act
    // Account 1 buys token 1 back
    await marketplaceContract.connect(seller).createMarketSale(token1marketItemId, firstToken[0], firstToken[1], { value: BigInt(price) + BigInt(oracleFee) })

    // Assert
    const tokenOwner = await bCard.ownerOf(token1id)
    expect(tokenOwner).to.eql(seller.address)
  })

  it('cancels a market item', async () => {
    // Arrange
    const tokenId = 1
    const price = ethers.utils.parseEther('1')
    await mintTokenAndCreateMarketItem(tokenId, price)

    // Act
    await marketplaceContract.connect(seller).cancelMarketItem(1)

    // Assert
    const tokenOwner = await bCard.ownerOf(1)
    expect(tokenOwner).to.eql(seller.address)
  })

  it('reverts when trying to cancel an inexistent market item', async () => {
    // Act and Assert
    expect(marketplaceContract.cancelMarketItem(1))
      .to.be.revertedWith("Market item does not exist")
  })

  it('reverts when trying to cancel a market item whose seller is not msg.sender', async () => {
    // Arrange
    const tokenId = 1
    const price = ethers.utils.parseEther('1')

    await mintTokenAndCreateMarketItem(tokenId, price)

    // Act and Assert
    expect(marketplaceContract.connect(buyer).cancelMarketItem(1))
      .to.be.revertedWith('You are not the seller')
  })

  it('gets latest Market Item by the token id', async function () {
    // Arrange
    const token1id = 1
    const token2id = 2
    const price = ethers.utils.parseEther('10')

    // Account1 mints two tokens and put them for sale
    await bCard.connect(seller).getCard(firstToken[0], firstToken[1], { value: mintPrice })
    await bCard.connect(seller).getCard(secondToken[0], secondToken[1], { value: mintPrice })
    await bCard.connect(seller).setApprovalForAll(marketplaceContract.address, true)
    await bCard.connect(oracle).callback(1, oracleCallbackTokenURI)
    await bCard.connect(oracle).callback(2, oracleCallbackTokenURI)
    await marketplaceContract.connect(seller).createMarketItem(token1id, price)
    await marketplaceContract.connect(seller).createMarketItem(token2id, price)

    // Account 2 buys token 1
    const token1marketItemId = 1
    await marketplaceContract.connect(buyer).createMarketSale(token1marketItemId, thirdToken[0], thirdToken[1], { value: BigInt(price) + BigInt(oracleFee) })
    await bCard.connect(oracle).callback(1, oracleCallbackTokenURI)

    // Account 2 puts token 1 for sale
    await bCard.connect(buyer).approve(marketplaceContract.address, token1id)
    await marketplaceContract.connect(buyer).createMarketItem(token1id, price)

    // Act
    const marketItemResult = await marketplaceContract.getLatestMarketItemByTokenId(token1id)

    // Assert
    const marketItem = [
      BigNumber.from(3),
      BigNumber.from(token1id),
      buyer.address,
      ethers.constants.AddressZero,
      price,
      false,
      false
    ]
    expect(marketItemResult).to.eql([marketItem, true])
  })

  it('does not get a Market Item by a nonexistent token id', async function () {
    // Arrange
    const tokenId = 1

    // Act
    const marketItemResult = await marketplaceContract.getLatestMarketItemByTokenId(tokenId)

    // Assert
    const emptyMarketItem = [
      BigNumber.from(0),
      BigNumber.from(0),
      ethers.constants.AddressZero,
      ethers.constants.AddressZero,
      BigNumber.from(0),
      false,
      false
    ]
    expect(marketItemResult).to.eql([emptyMarketItem, false])
  })

  it('reverts a Market Item creation if price is 0', async function () {
    // Arrange
    const tokenId = 1
    const price = ethers.utils.parseEther('0')

    // Act and Assert
    expect(mintTokenAndCreateMarketItem(tokenId, price))
      .to.be.revertedWith("Business Cards are not free!")
  })

  it('creates a Market Sale', async function () {
    // Arrange
    const tokenId = 1
    const price = ethers.utils.parseEther('1')

    await mintTokenAndCreateMarketItem(tokenId, price)
    const initialSellerBalance = await seller.getBalance()

    // Act
    await marketplaceContract.connect(buyer).createMarketSale(1, secondToken[0], secondToken[1], { value: BigInt(price) + BigInt(oracleFee) })

    // Assert
    const expectedSellerBalance = initialSellerBalance.add(price)
    expect(await seller.getBalance()).to.equal(expectedSellerBalance)
    expect(await bCard.ownerOf(tokenId)).to.equal(buyer.address)
  })

  it('reverts a Market Sale if offer price is not the same as listing price', async function () {
    // Arrange
    const tokenId = 1
    const listingPrice = ethers.utils.parseEther('10')
    const offerPrice = ethers.utils.parseEther('5')

    await mintTokenAndCreateMarketItem(tokenId, listingPrice)

    // Act and Assert
    expect(marketplaceContract.connect(buyer).createMarketSale(1, secondToken[0], secondToken[1], { value: BigInt(offerPrice) + BigInt(oracleFee) }))
      .to.be.revertedWith("Payment must be price plus oracle fee")
  })

  it('fetches available NFT tokens', async function () {
    // Arrange
    const price = ethers.utils.parseEther('10')
    await mintTokenAndCreateMarketItem(1, price)
    await mintTokenAndCreateMarketItem(2, price, secondToken[0], secondToken[1])

    // Act
    const unsoldMarketItems = await marketplaceContract.fetchAvailableMarketItems()

    // Assert
    expect(unsoldMarketItems.length).to.equal(2)
  })

  it('fetches NFT tokens owned by msg.sender ', async function () {
    // Arrange
    const price = ethers.utils.parseEther('10')
    await mintTokenAndCreateMarketItem(1, price)
    await mintTokenAndCreateMarketItem(2, price, secondToken[0], secondToken[1])
    await marketplaceContract.connect(buyer).createMarketSale(1, thirdToken[0], thirdToken[1], { value: BigInt(price) + BigInt(oracleFee) })

    // Act
    const buyerNFTTokens = await marketplaceContract.connect(buyer).fetchOwnedMarketItems(buyer.address)

    // Assert
    expect(buyerNFTTokens.length).to.equal(1)
    expect(buyerNFTTokens[0].tokenId).to.equal(1)
  })

  it('fetches NFT tokens that are listed by msg.sender', async function () {
    // Arrange
    const price = ethers.utils.parseEther('10')
    await mintTokenAndCreateMarketItem(1, price)
    await mintTokenAndCreateMarketItem(2, price, secondToken[0], secondToken[1])
    await mintTokenAndCreateMarketItem(3, price, thirdToken[0], thirdToken[1], buyer)

    // Act
    const sellerNftTokens = await marketplaceContract.connect(seller).fetchSellingMarketItems(seller.address)

    // Assert
    expect(sellerNftTokens.length).to.equal(2)
  })

  it('can change the oracle fee', async function () {
    // Oracle fee can be changed
    await marketplaceContract.setOracleFee(ethers.utils.parseEther('0.025'));
    const newFee = await marketplaceContract.getOracleFee();
    expect(newFee).to.equal(ethers.utils.parseEther('0.025'));

    // But not by a non owner
    expect(marketplaceContract.connect(seller).setOracleFee(ethers.utils.parseEther('0')))
      .to.be.revertedWith("Ownable: caller is not the owner");

    // This new fee needs to be provided
    const price = ethers.utils.parseEther('10')
    await mintTokenAndCreateMarketItem(1, price);

    expect(marketplaceContract.connect(buyer).createMarketSale(1, secondToken[0], secondToken[1], { value: BigInt(price) + BigInt(oracleFee) }))
      .to.be.revertedWith("Payment must be price plus oracle fee")

    // But this will clear
    await marketplaceContract.connect(buyer).createMarketSale(1, secondToken[0], secondToken[1], { value: BigInt(price) + BigInt(newFee) })
  })

  it('holds the token while listing is active', async function () {
    // Arrange
    const price = ethers.utils.parseEther('10')
    await mintTokenAndCreateMarketItem(1, price)
    await bCard.connect(seller).getCard(secondToken[0], secondToken[1], { value: mintPrice })
    await bCard.connect(oracle).callback(2, oracleCallbackTokenURI)

    // Try -- will fail
    expect(bCard.connect(seller).updateCard(1, fourthToken[0], fourthToken[1], { value: updatePrice }))
      .to.be.revertedWith("Caller is not owner nor approved");
    expect(bCard.connect(seller).swapCards(1,2, { value: updatePrice }))
      .to.be.revertedWith("Caller is not owner nor approved");

    // Marketplace owns the token
    expect(await bCard.ownerOf(1)).to.equal(marketplaceContract.address)

    // Sale proceeds normally -- can update tokens now
    await marketplaceContract.connect(seller).createMarketSale(1, thirdToken[0], thirdToken[1], { value: BigInt(price) + BigInt(oracleFee) })
    await bCard.connect(oracle).callback(1, oracleCallbackTokenURI)
    await bCard.connect(seller).updateCard(1, fourthToken[0], fourthToken[1], { value: updatePrice })
  })

  it('funds the oracle regardless of no updateFee', async function () {
    /* updateCard will behave as described and tested for BusinessCard, the only difference
    * being that the Marketplace is whitelisted and does NOT pay the updateFee that would
    * otherwise end up in the BusinessCard smart contract.
    * The oracle gets funded nonetheless as a createMarketItem call has inside of it a call
    * to updateCard, providing as value just the oracleFee necessary to ensure correct functioning
    */
    const price = ethers.utils.parseEther('10')
    await bCard.connect(seller).getCard(firstToken[0], firstToken[1], {value: mintPrice})
    await bCard.connect(oracle).callback(1, oracleCallbackTokenURI)
    await bCard.connect(seller).setApprovalForAll(marketplaceContract.address, true)
    await marketplaceContract.connect(seller).createMarketItem(1, price)

    // Logging the current oracle balance and ensuring there are NO funds in the bCard smart contract
    const oracleStartBalance = await oracle.getBalance()
    await bCard.withdraw()
    expect(await provider.getBalance(bCard.address)).to.equal(ethers.utils.parseEther('0'))

    await marketplaceContract.connect(seller).createMarketSale(1, secondToken[0], secondToken[1], { value: BigInt(price) + BigInt(oracleFee) }) 
    // Oracle gets funded
    expect(await oracle.getBalance()).to.equal(oracleStartBalance.add(oracleFee))
    // bCard contract still holds NO balance
    expect(await provider.getBalance(bCard.address)).to.equal(ethers.utils.parseEther('0'))
  })


  // createMarketSale behaves like updateCard

  // TODO: Withdrawals tested big time alongside BusinessCard smart contract

  // TODO: SoulboundCard, the listing transfer does NOT delete corresponding sCards,
  // but createMarketSale WILL.
})