// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.16;

import {ERC721A} from "erc721a/contracts/ERC721A.sol";
import {IERC721A} from "erc721a/contracts/IERC721A.sol";
import {ERC721AQueryable} from "erc721a/contracts/extensions/ERC721AQueryable.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

contract BulkMinter is ERC721AQueryable {
    using Strings for uint256;
    string private __baseURI;
    uint128 public constant MAX_SUPPLY = 10000;
    uint128 public lastMintedTokenId = 0;

    constructor(
        string memory name,
        string memory symbol,
        string memory uri
    ) ERC721A(name, symbol) {
        __baseURI = uri;
    }

    function mint(uint128 count) public {
        if (totalSupply() + count > MAX_SUPPLY - 1) {
            revert("Max supply reached");
        }
        _mint(msg.sender, count);
    }

    function _baseURI() internal view override returns (string memory) {
        return __baseURI;
    }
}
