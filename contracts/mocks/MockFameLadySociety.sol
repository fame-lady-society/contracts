// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/// @notice Lightweight FameLadySociety stand-in that enforces wrap cost accounting.
contract MockFameLadySociety {
  address public immutable squad;
  uint256 public wrapCost = 0.01 ether;

  mapping(uint256 => address) public wrappedOwner;

  constructor(address squad_) {
    squad = squad_;
  }

  function setWrapCost(uint256 newCost) external {
    wrapCost = newCost;
  }

  function wrapTo(address to, uint256[] calldata tokenIds) external payable {
    uint256 len = tokenIds.length;
    require(len > 0, "NO_TOKENS");

    uint256 requiredValue = wrapCost * len;
    require(msg.value == requiredValue, "WRAP_VALUE_MISMATCH");

    for (uint256 i = 0; i < len; ++i) {
      uint256 tokenId = tokenIds[i];
      require(
        IERC721(squad).ownerOf(tokenId) == msg.sender,
        "NOT_TOKEN_OWNER"
      );
      IERC721(squad).transferFrom(msg.sender, address(this), tokenId);
      wrappedOwner[tokenId] = to;
    }
  }
}
