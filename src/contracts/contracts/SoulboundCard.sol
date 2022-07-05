// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./BusinessCard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/interfaces/IERC721.sol";
import "@openzeppelin/contracts/interfaces/IERC721Enumerable.sol";
import "@openzeppelin/contracts/interfaces/IERC721Metadata.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Storage.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

contract SoulboundCard is ERC165Storage, IERC721, IERC721Metadata, IERC721Enumerable, Ownable {
    using SafeMath for uint256;
    using Address for address;
    using EnumerableSet for EnumerableSet.UintSet;
    using EnumerableSet for EnumerableSet.AddressSet;
    using Strings for uint256;

    // Mapping from address to their (enumerable) set of received Soulbound Cards
    mapping (address => EnumerableSet.UintSet) private _receivedTokens;

    // Mapping from token IDs to their (enumerable) set of receiver addresses
    mapping (uint256 => EnumerableSet.AddressSet) private _tokenReceivers;

    // Mapping of addresses that have blakclisted the receiving of Soulbound Cards
    mapping (address => bool) private _blacklistedReceivers;

    // Token name
    string private _name;

    // Token symbol
    string private _symbol;

    // Main Business Card smart contract
    BusinessCard bCard;

    constructor (string memory name_, string memory symbol_, address _bCard) {

        _name = name_;
        _symbol = symbol_;
        bCard = BusinessCard(_bCard);

        // register the supported interfaces to conform to ERC721 via ERC165
        /*
        *     bytes4(keccak256('balanceOf(address)')) == 0x70a08231
        *     bytes4(keccak256('ownerOf(uint256)')) == 0x6352211e
        *     bytes4(keccak256('approve(address,uint256)')) == 0x095ea7b3
        *     bytes4(keccak256('getApproved(uint256)')) == 0x081812fc
        *     bytes4(keccak256('setApprovalForAll(address,bool)')) == 0xa22cb465
        *     bytes4(keccak256('isApprovedForAll(address,address)')) == 0xe985e9c5
        *     bytes4(keccak256('transferFrom(address,address,uint256)')) == 0x23b872dd
        *     bytes4(keccak256('safeTransferFrom(address,address,uint256)')) == 0x42842e0e
        *     bytes4(keccak256('safeTransferFrom(address,address,uint256,bytes)')) == 0xb88d4fde
        *
        *     => 0x70a08231 ^ 0x6352211e ^ 0x095ea7b3 ^ 0x081812fc ^
        *        0xa22cb465 ^ 0xe985e9c5 ^ 0x23b872dd ^ 0x42842e0e ^ 0xb88d4fde == 0x80ac58cd
        */
        _registerInterface(0x80ac58cd);

        /*
        *     bytes4(keccak256('name()')) == 0x06fdde03
        *     bytes4(keccak256('symbol()')) == 0x95d89b41
        *     bytes4(keccak256('tokenURI(uint256)')) == 0xc87b56dd
        *
        *     => 0x06fdde03 ^ 0x95d89b41 ^ 0xc87b56dd == 0x5b5e139f
        */
        _registerInterface(0x5b5e139f);

        /*
        *     bytes4(keccak256('totalSupply()')) == 0x18160ddd
        *     bytes4(keccak256('tokenOfOwnerByIndex(address,uint256)')) == 0x2f745c59
        *     bytes4(keccak256('tokenByIndex(uint256)')) == 0x4f6ccce7
        *
        *     => 0x18160ddd ^ 0x2f745c59 ^ 0x4f6ccce7 == 0x780e9d63
        */
        _registerInterface(0x780e9d63);
    }

    /**
     * @dev See {IERC721Metadata-name}.
     */
    function name() public view virtual override returns (string memory) {
        return _name;
    }

    /**
     * @dev See {IERC721Metadata-symbol}.
     */
    function symbol() public view virtual override returns (string memory) {
        return _symbol;
    }

    /**
     * @dev Sends a copy of the Business Card specified by tokenId as a Soulbound Card to the
     * specified address
     */
    function sendSoulboundCard(address from, address recipient, uint256 tokenId) external {
        require(_isApprovedOrOwner(msg.sender, tokenId), "SCARD: caller is not owner nor approved");
        require(bCard.ownerOf(tokenId) == from, "SCARD: transfer of token that is not own");
        require(recipient != address(0), "SCARD: sending to zero address");
        require(!_blacklistedReceivers[recipient], "SCARD: recipient blacklisted themselves");
        require(!_receivedTokens[recipient].contains(tokenId), "SCARD: recipient already received the Soulbound Card");

        _receivedTokens[recipient].add(tokenId);
        _tokenReceivers[tokenId].add(recipient);

        emit Transfer(from, recipient, tokenId);
    }

    /**
     * @dev Burns all the Soulbound Cards associated with a Business Card tokenId
     */
    function burnAllSoulboundCards(uint256 tokenId) external { 
        require(
            msg.sender == address(bCard) || _isApprovedOrOwner(msg.sender, tokenId),
            "SCARD: caller is not BCARD nor owner nor approved for all"   
        );
        // To clean an EnumerableSet, we remove all elements one by one
        // @dev: is there a better way to do this? I found no way to simply reinitialize the set,
        // and removing one by one can become very expensive / impossible due to block size limits
        address[] memory cardReceivers = _tokenReceivers[tokenId].values();
        for (uint256 i = 0; i < cardReceivers.length; ++i) {
            address receiver = _tokenReceivers[tokenId].at(i);
            // Remove the Soulbound Card from the set of tokens address `receiver` received
            _receivedTokens[receiver].remove(tokenId);
            // Remove the address `receiver` from the set of receivers for the Soulbound Card `tokenId`
            _tokenReceivers[tokenId].remove(receiver);
        }
    }

    /**
     * @dev Burns a specific Soulbound Card that was sent to msg.sender
     */
    function burnSoulboundCard(address receiver, uint256 toBurn) external {
        require(
            msg.sender == receiver || _isApprovedOrOwner(msg.sender, toBurn),
            "SCARD: caller is not BCARD nor owner nor approved for all"   
        );
        require(_receivedTokens[receiver].remove(toBurn), "SCARD: token not in receiver's list");
    }

    /**
     * @dev Burns all the Soulbound Cards that were sent to the specified address
     * Caller must be the specified address or an approved operator
     */
    function burnAllReceivedSoulboundCardsForAddress(address toDisable) external {
        require(isApprovedForAll(toDisable, msg.sender), "SCARD: caller is not owner nor approved for all");
        _burnAllReceivedSoulboundCardsForAddress(toDisable);
    }

    /**
     * @dev Burns all the Soulbound Cards that were sent to msg.sender
     */
    function burnAllReceivedSoulboundCards() external {
        _burnAllReceivedSoulboundCardsForAddress(msg.sender);
    }

    /**
     * @dev Burns all the Soulbound Cards that were sent to msg.sender
     */
    function _burnAllReceivedSoulboundCardsForAddress(address toDisable) internal {
        // To clean an EnumerableSet, we remove all elements one by one
        // @dev: is there a better way to do this? I found no way to simply reinitialize the set,
        // and removing one by one can become very expensive / impossible due to block size limits
        uint256[] memory receivedCards = _receivedTokens[toDisable].values();
        for (uint256 i = 0; i < receivedCards.length; ++i) {
            uint256 cardId = _receivedTokens[toDisable].at(i);
            // Removes the Soulbound Card from the set of tokens address `toDisable` received
            _receivedTokens[toDisable].remove(cardId);
            // Removes the address `toDisable` from the set of receivers for this Soulbound Card `cardId`
            _tokenReceivers[cardId].remove(toDisable);
        }
    }

    /**
     * @dev Blacklists the specified address from receiving any additional sCards
     * Caller must be the specified address or an approved operator
     */
    function disableSoulboundCardsForAddress(address toDisable) external {
        require(isApprovedForAll(toDisable, msg.sender), "SCARD: caller is not owner nor approved for all");
        _disableSoulboundCardsForAddress(toDisable);
    }

    /**
     * @dev Blacklists msg.sender from receiving any additional sCards
     */
    function disableSoulboundCards() external {
        _disableSoulboundCardsForAddress(msg.sender);
    }

    /**
     * @dev Blacklists the specified address from receiving any additional sCards
     */
    function _disableSoulboundCardsForAddress(address toDisable) internal {
        _blacklistedReceivers[toDisable] = true;
    }

    /**
     * @dev Returns the Soulbound Card tokenURI, which is linked to the Business Card tokenURI
     */
    function tokenURI(uint256 tokenId) external view override returns (string memory) {
        return bCard.tokenURI(tokenId);
    }

    /**
     * @dev Returns the stats of a Soulbound Card, which are linked to the corresponding Business Card
     */
    function tokenStats(uint256 tokenId)  external view returns (BusinessCard.Card memory) {
        return bCard.tokenStats(tokenId);
    }
    
    /**
     * @dev See {IERC721-ownerOf}.
     *
     * Here owner represents ownership of the original Business Card
     */
    function ownerOf(uint256 _tokenId) public view virtual override returns (address) {
        return bCard.ownerOf(_tokenId);
    }

    /**
     * @dev See {IERC721-balanceOf}.
     *
     * Returns the number of Soulbound Cards received by an address
     */
    function balanceOf(address _owner) public view virtual override returns (uint256) {
        require(_owner != address(0), "ERC721: balance query for the zero address");
        return _receivedTokens[_owner].length();
    }

    /**
     * @dev See {IERC721Enumerable-totalSupply}.
     *
     * The `totalSupply` is defined as the number of Soulbound Cards that have been sent
     */
    function totalSupply() public view virtual override returns (uint256 count) {
        uint256 nTokens = bCard.totalSupply();
        for (uint256 i = 1; i <= nTokens; ++i) {
            count += _tokenReceivers[i].length();
        }
    }

    /**
     * @dev See {IERC721Enumerable-tokenOfOwnerByIndex}.
     *
     * Returns the Soulbound Card received by an address at a given index
     */
    function tokenOfOwnerByIndex(address _owner, uint256 index) public view virtual override returns (uint256) {
        require(index < balanceOf(_owner), "Index out of bounds");
        return _receivedTokens[_owner].at(index);
    }

    /**
     * @dev Returns the list of addresses that received a copy of a given tokenId Business Card
     * as a Soulbound Card
     */
    function soulboundCardReceivers(uint256 tokenId) public view returns (address[] memory) {
        return _tokenReceivers[tokenId].values();
    }

    /**
     * @dev See {IERC721Enumerable-tokenByIndex}.
     *
     * Returns the corresponding Business Card by index
     */
    function tokenByIndex(uint256 index) public view virtual override returns (uint256) {
        return bCard.tokenByIndex(index);
    }

    /**
     * @dev See {IERC721-approve}.
     *
     * Only present to be ERC721 compliant. Soulbound Cards cannot be approved for spending
     * as they are not transferable. Granting the corresponding Business Card approval for
     * spending also allows them to send Soulbound Cards.
     */
    function approve(address /* _approved */, uint256 /* _tokenId */) public pure virtual override {
        revert("SCARD: cannot approve Soulbound Cards");
    }

    /**
     * @dev See {IERC721-getApproved}.
     *
     * Returns the address that is approved to spend the BusinessCard `tokenId`.
     */
    function getApproved(uint256 tokenId) public view virtual override returns (address) {
        return bCard.getApproved(tokenId);
    }

    /**
     * @dev See {IERC721-setApprovalForAll}.
     *
     * Only present to be ERC721 compliant. Soulbound Cards cannot be approved for spending
     * as they are not transferable. Granting the corresponding Business Card approval for
     * spending also allows them to send Soulbound Cards.
     */
    function setApprovalForAll(address /* _operator */, bool /* _approved */) public pure virtual override {
        revert("SCARD: cannot approve Soulbound Cards");
    }

    /**
     * @dev See {IERC721-isApprovedForAll}.
     *
     * Returns if an address is approved to spend any of the `owner`'s Business Cards.
     */
    function isApprovedForAll(address owner, address operator) public view virtual override returns (bool) {
        return bCard.isApprovedForAll(owner, operator);
    }

    /**
     * @dev See {IERC721-transferFrom}.
     *
     * Only present to be ERC721 compliant. Soulbound Cards cannot be transferred. They can
     * be sent by the Business Card owner or approved address, and can be burned by either
     * the recipient or Business Card owner or approved address.
     */
    function transferFrom(address /* from */, address /* to */, uint256 /* tokenId */) public pure virtual override {
        revert("SCARD: cannot transfer Soulbound Cards");
    }

    /**
     * @dev See {IERC721-safeTransferFrom}.
     */
    function safeTransferFrom(address from, address to, uint256 tokenId) public virtual override {
        safeTransferFrom(from, to, tokenId, "");
    }

    /**
     * @dev See {IERC721-safeTransferFrom}.
     *
     * Only present to be ERC721 compliant. Soulbound Cards cannot be transferred. They can
     * be sent by the Business Card owner or approved address, and can be burned by either
     * the recipient or Business Card owner or approved address.
     */
    function safeTransferFrom(address /* from */, address /* to */, uint256 /* tokenId */, bytes memory /* _data */) public pure virtual override {
        revert("SCARD: cannot transfer Soulbound Cards");
    }

    /**
     * @dev Returns whether `spender` is allowed to manage the BusinessCard `tokenId`.
     *
     * Requirements:
     *
     * - A Business Card by `tokenId` must exist.
     */
    function _isApprovedOrOwner(address spender, uint256 tokenId) internal view virtual returns (bool) {
        address owner = bCard.ownerOf(tokenId);
        return (spender == owner || bCard.getApproved(tokenId) == spender || bCard.isApprovedForAll(owner, spender));
    }
    
}