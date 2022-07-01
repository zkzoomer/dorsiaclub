//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/interfaces/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract IBusinessCard {

    struct CardProperties {
        string position;
        string twitterAccount;
        string telegramAccount;
        string telegramGroup;
        uint256 discordAccount;
        string discordGroup;
        string githubUsername;
        string website;
    }

    function transferFrom(address from, address to, uint256 tokenId) external { }

    function updateCard(uint256 tokenId, string calldata newName, CardProperties calldata newCardProperties) public payable { }

}

contract Marketplace is ReentrancyGuard, Ownable {
    using Counters for Counters.Counter;
    
    // Id for each individual item
    Counters.Counter private _itemIds;
    // Number of items sold
    Counters.Counter private _tokensSold;
    // Number of items cancelled
    Counters.Counter private _tokensCanceled;
    
    // Business Card smart contract
    IBusinessCard immutable bCard;
    // Oracle EOA
    address payable oracle;
    uint256 oracleFee = 0.015 ether;

    constructor (address _bCardAddress, address payable _oracle) {
        bCard = IBusinessCard(_bCardAddress);
        oracle = _oracle;
    }

    mapping(uint256 => MarketItem) private idToMarketItem;

    struct MarketItem {
        uint256 itemId;
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool isSold;
        bool isCancelled;
    }

    event MarketItemCreated(
        uint256 indexed itemId,
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold,
        bool cancelled
    );

    /**
     * @dev Gets the current oracle fee
    */
    function getOracleFee() public view returns(uint256) {
        return oracleFee;
    }

    /**
     * @dev Sets the oracle fee -- gas paid by the oracle EOA when updating Business Cards
    */
    function setOracleFee(uint256 _oracleFee) external onlyOwner {
        oracleFee = _oracleFee;
    }

    /**
     * @dev Lists an item in the marketplace, transafering the NFT from the sender to this smart contract
     */
    function createMarketItem(uint256 tokenId, uint256 price) external payable nonReentrant returns (uint256) {
        require(price > 0, "Business Cards are not free!");

        _itemIds.increment();
        uint256 itemId = _itemIds.current();

        idToMarketItem[itemId] = MarketItem(
            itemId,
            tokenId,
            payable(msg.sender),
            payable(address(0)),  // No owner for the item
            price,
            false,
            false
        );

        bCard.transferFrom(msg.sender, address(this), tokenId);

        emit MarketItemCreated(
            itemId,
            tokenId,
            msg.sender,
            address(0),
            price,
            false,
            false
        );

        return itemId;
    }

    /**
     * @dev Cancels a market listing
     */
    function cancelMarketItem(uint256 itemId) public payable nonReentrant {
        uint256 tokenId = idToMarketItem[itemId].tokenId;
        require(tokenId > 0, "Market item does not exist");
        require(idToMarketItem[itemId].seller == msg.sender, "You are not the seller");

        idToMarketItem[itemId].owner = payable(msg.sender);
        idToMarketItem[itemId].isCancelled = true;
        _tokensCanceled.increment();

        bCard.transferFrom(address(this), msg.sender, tokenId);
    }

    /**
     * @dev Sells an item in the marketplace, sending the money to the seller, the NFT to the buyer, 
     * and the oracle fee to the oracle EOA
     */
    function createMarketSale(uint256 itemId, string calldata newName, IBusinessCard.CardProperties calldata newCardProperties) external payable nonReentrant {
        uint256 price = idToMarketItem[itemId].price;
        uint256 tokenId = idToMarketItem[itemId].tokenId;

        require(
            msg.value >= price + oracleFee,  // Buyer must pay the seller plus the oracle fee
            "Payment must be price plus oracle fee"
        );

        idToMarketItem[itemId].isSold = true;
        idToMarketItem[itemId].owner = payable(msg.sender);
        _tokensSold.increment();
        bCard.updateCard(tokenId, newName, newCardProperties);
        // Call bCard for a token upgrade

        idToMarketItem[itemId].seller.transfer(price);
        oracle.transfer(oracleFee);
        bCard.transferFrom(address(this), msg.sender, tokenId);
    }

    /**
     * @dev Get Latest Market Item by the token id
     */
    function getLatestMarketItemByTokenId(uint256 tokenId) public view returns (MarketItem memory, bool) {
        uint256 itemsCount = _itemIds.current();

        for (uint256 i = itemsCount; i > 0; i--) {
            MarketItem memory item = idToMarketItem[i];
            if(item.tokenId != tokenId) continue;
            return(item, true);
        }

        MarketItem memory emptyMarketItem;
        return(emptyMarketItem, false);
    }

    /**
     * @dev Fetch non sold and non canceled market items
     */
    function fetchAvailableMarketItems() public view returns(MarketItem[] memory) {
        uint256 itemsCount = _itemIds.current();
        uint256 soldItemsCount = _tokensSold.current();
        uint256 canceledItemsCount = _tokensCanceled.current();
        uint256 availableItemsCount = itemsCount - soldItemsCount - canceledItemsCount;
        MarketItem[] memory marketItems = new MarketItem[](availableItemsCount);

        uint256 currentIndex = 0;
        for(uint256 i = 0; i < itemsCount; ++i) {
            MarketItem memory item = idToMarketItem[i+1];
            if (item.owner != address(0)) continue;
            marketItems[currentIndex] = item;
            currentIndex++;
        }

        return marketItems;
    }

    /**
     * @dev Check if two strings are the same
     */
    function compareStrings(string memory a, string memory b) private pure returns (bool) {
        return (keccak256(abi.encodePacked((a))) == keccak256(abi.encodePacked((b))));
    }

    /**
     * @dev Selects the address we're looking for between "owner" and "seller"
     */
    function getMarketItemAddressByProperty(MarketItem memory item, string memory property)
        private
        pure
        returns (address)
    {
        require(
            compareStrings(property, "seller") || compareStrings(property, "owner"),
            "Parameter must be 'seller' or 'owner'"
        );

        return compareStrings(property, "seller") ? item.seller : item.owner;
    }

    /**
     * @dev Fetch market items that are being listed by the msg.sender
     */
    function fetchSellingMarketItems() public view returns (MarketItem[] memory) {
        return fetchMarketItemsByAddressProperty("seller");
    }

    /**
     * @dev Fetch market items that are owned by the msg.sender
     */
    function fetchOwnedMarketItems() public view returns (MarketItem[] memory) {
        return fetchMarketItemsByAddressProperty("owner");
    }

    /**
     * @dev Fetches market items according to "owner" or "seller" for its address property
     */
    function fetchMarketItemsByAddressProperty(string memory _addressProperty)
        public
        view
        returns (MarketItem[] memory)
    {
        require(
            compareStrings(_addressProperty, "seller") || compareStrings(_addressProperty, "owner"),
            "Parameter must be 'seller' or 'owner'"
        );
        uint256 totalItemsCount = _itemIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalItemsCount; i++) {
            // Is it ok to assign this variable for better code legbility?
            // Is it better to use memory or storage in this case?
            MarketItem storage item = idToMarketItem[i + 1];
            address addressPropertyValue = getMarketItemAddressByProperty(item, _addressProperty);
            if (addressPropertyValue != msg.sender) continue;
            itemCount += 1;
        }

        MarketItem[] memory items = new MarketItem[](itemCount);

        for (uint256 i = 0; i < totalItemsCount; i++) {
            // Is it ok to assign this variable for better code legbility?
            // Is it better to use memory or storage in this case?
            MarketItem storage item = idToMarketItem[i + 1];
            address addressPropertyValue = getMarketItemAddressByProperty(item, _addressProperty);
            if (addressPropertyValue != msg.sender) continue;
            items[currentIndex] = item;
            currentIndex += 1;
        }

        return items;
    }

    /**
     * @dev Withdraw balance from this contract (Callable by owner)
    */
    function withdraw() onlyOwner external {
        uint balance = address(this).balance;
        payable(msg.sender).transfer(balance);
    }
}