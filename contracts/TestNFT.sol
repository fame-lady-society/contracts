// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.16;

import {ERC721} from "solmate/src/tokens/ERC721.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

contract TestNFT is ERC721 {
    using Strings for uint256;
    string private _baseURI;

    constructor(
      string memory name,
      string memory symbol,
      string memory uri
      ) ERC721(name, symbol) {
        _baseURI = uri;
    }

    function mint(address to, uint256 tokenId) public {
        _mint(to, tokenId);
    }

    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        return string(abi.encodePacked(_baseURI, tokenId.toString()));
    }
}
