// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.16;

import {ERC721} from "solmate/src/tokens/ERC721.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

contract BulkMinter is ERC721 {
    using Strings for uint256;
    string private _baseURI;
    uint128 public constant MAX_SUPPLY = 10000;
    uint128 public lastMintedTokenId = 0;

    constructor(
        string memory name,
        string memory symbol,
        string memory uri
    ) ERC721(name, symbol) {
        _baseURI = uri;
    }

    function mint(uint128 count) public {
        if (lastMintedTokenId + count > MAX_SUPPLY - 1) {
            revert("Max supply reached");
        }
        uint256 startMintFrom = lastMintedTokenId;
        lastMintedTokenId += count;
        for (uint256 i = 0; i < count; i++) {
            _mint(msg.sender, startMintFrom + i);
        }
    }

    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        return string(abi.encodePacked(_baseURI, tokenId.toString()));
    }
}
