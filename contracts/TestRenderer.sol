// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.16;

import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {ITokenURIGenerator} from "./ITokenURIGenerator.sol";

contract TestRenderer is ITokenURIGenerator {
  using Strings for uint256;

  string private baseUri;

  function setBaseUri(string calldata _baseUri) public {
    baseUri = _baseUri;
  }

  function tokenURI(uint256 tokenId) external view returns (string memory) {
    return string(abi.encodePacked(baseUri, tokenId.toString()));
  }
}
