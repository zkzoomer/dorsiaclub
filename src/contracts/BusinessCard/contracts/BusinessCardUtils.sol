// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/**
 * @dev Useful functions for validating the name and position of Business Cards
 */
library BusinessCardUtils {
    /**
     * @dev Check if the name string is valid:
     * Alphanumeric and spaces without leading or trailing space, with maximum characters
     * Must contain at most one space, ensuring a Name SURNAME input.
     */
    function validateName(string memory str) internal pure returns (bool) {
        bytes memory b = bytes(str);
        // String length requirements
        if(b.length == 0) return false;
        if(b.length > 22) return false; 
        // No leading or trailing spaces
        if(b[0] == 0x20) return false; 
        if (b[b.length - 1] == 0x20) return false; 
        // Characters check
        require(validateString(str), "Non valid characters");

        // Name is validated 
        return true;
    }

    /**
     * @dev Check if the position string is valid:
     * Alphanumeric and spaces without leading or trailing space, with maximum characters
     */
    function validatePosition(string memory str) internal pure returns (bool) {
        bytes memory b = bytes(str);
        // String length requirements
        if(b.length == 0) return false;
        if(b.length > 32) return false; 
        // Position can contain as many spaces as desired, but no leading or trailing ones
        if(b[0] == 0x20) return false; 
        if (b[b.length - 1] == 0x20) return false; 
        // Characters check
        require(validateString(str), "Non valid characters");

        // Position is validated
        return true;
    }

    /**
     * @dev Validates that string contains valid characters, alphanumerical and some special symbols
     */
    function validateString(string memory str) internal pure returns (bool) {
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