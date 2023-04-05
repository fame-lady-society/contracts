// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.16;

import { ERC721 } from "solmate/src/tokens/ERC721.sol";

contract TestNFT is ERC721 {
  constructor() ERC721("test", "TST") {}

  function mint(address to, uint256 tokenId) public {
    _mint(to, tokenId);
  }

  function tokenURI(uint256) override public pure returns (string memory) {
    return "";
  }
}
