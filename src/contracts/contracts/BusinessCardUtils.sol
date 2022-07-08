// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./BusinessCard.sol";

/**
 * @dev Useful functions for validating the name and position of Business Cards
 */
library BusinessCardUtils {
    /**
     * @dev Check if the name string is valid:
     * Alphanumeric and spaces without leading or trailing space, with maximum characters
     * Must contain at most one space, ensuring a Name SURNAME input.
     */
    function validateName(string calldata str) internal pure returns (bool) {
        bytes memory b = bytes(str);
        // String length requirements
        if(
            b.length == 0 || b.length > 22 || b[0] == 0x20 || b[b.length - 1] == 0x20
        ) return false;
        // Characters check
        require(validateString(str), "Non valid characters");

        // Name is validated 
        return true;
    }

    /**
     * @dev Check if the position string is valid:
     * Alphanumeric and spaces without leading or trailing space, with maximum characters
     */
    function validatePosition(string calldata str) internal pure returns (bool) {
        bytes memory b = bytes(str);
        // String length requirements
        if(
            b.length == 0 || b.length > 32 || b[0] == 0x20 || b[b.length - 1] == 0x20
        ) return false;
        // Characters check
        require(validateString(str), "Non valid characters");

        // Position is validated
        return true;
    }

    /**
     * @dev Validates that string contains valid characters, alphanumerical and some special symbols
     */
    function validateString(string calldata str) internal pure returns (bool) {
        bytes memory b = bytes(str);
        bytes1 lastChar = b[0];

        for(uint i; i<b.length; ++i){
            bytes1 char = b[i];

            if (char == 0x20 && lastChar == 0x20) return false; // Cannot contain continuous spaces

            if(
                !(char >= 0x20 && char <= 0x3F) &&  // Special characters and numbers
                !(char >= 0x41 && char <= 0x5A) &&  // A-Z
                !(char >= 0x61 && char <= 0x7A)  // a-z
            )
                return false;

            lastChar = char;
        }
        return true;
    }

    function validateOtherProperties(BusinessCard.CardProperties calldata cardProperties) internal pure returns (bool) {
        if(
            bytes(cardProperties.twitterAccount).length < 15 &&
            bytes(cardProperties.telegramAccount).length < 32 &&
            bytes(cardProperties.telegramGroup).length < 32 &&
            ((cardProperties.discordAccount >= 10**17 && cardProperties.discordAccount < 10**18) || cardProperties.discordAccount == 0) &&
            bytes(cardProperties.discordGroup).length < 32 &&
            bytes(cardProperties.githubUsername).length < 39 &&
            bytes(cardProperties.website).length < 50
        )
            return true;
        
        return false;
    }

    /**
     * @dev Converts the string to lowercase
     */
    function toLower(string memory str) internal pure returns (string memory){
        bytes memory bStr = bytes(str);
        bytes memory bLower = new bytes(bStr.length);

        for (uint i = 0; i < bStr.length; ++i) {
            // Uppercase character
            if ((uint8(bStr[i]) >= 65) && (uint8(bStr[i]) <= 90)) {
                bLower[i] = bytes1(uint8(bStr[i]) + 32);
            } else {
                bLower[i] = bStr[i];
            }
        }
        return string(bLower);
    }

}