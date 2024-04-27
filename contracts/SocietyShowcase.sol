// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {ERC1155} from "solady/src/tokens/ERC1155.sol";
import {LibString} from "solady/src/utils/LibString.sol";
import {OwnableRoles} from "solady/src/auth/OwnableRoles.sol";
import {ERC2981} from "@openzeppelin/contracts/token/common/ERC2981.sol";

contract SocietyShowcase is ERC1155, OwnableRoles, ERC2981 {
  // For etherscan and other block explorers
  string public name = "Society Showcase";
  string public symbol = "SOCIETY_SHOWCASE";

  using LibString for uint256;

  mapping(uint256 => string) private _tokenURIs;
  string private _baseURI;

  uint256 internal constant MINTER = 1 << 0;

  function roleMinter() public pure returns (uint256) {
    return MINTER;
  }

  uint256 internal constant METADATA = 1 << 1;

  function roleMetadata() public pure returns (uint256) {
    return METADATA;
  }

  uint256 internal constant TREASURUR = 1 << 2;

  function roleTreasurer() public pure returns (uint256) {
    return TREASURUR;
  }

  constructor() ERC1155() {
    _initializeOwner(msg.sender);
  }

  function setDefaultRoyalty(
    address receiver,
    uint96 royaltyFraction
  ) public onlyRolesOrOwner(TREASURUR) {
    _setDefaultRoyalty(receiver, royaltyFraction);
  }

  function setTokenRoyalty(
    uint256 id,
    address receiver,
    uint96 royaltyFraction
  ) public onlyRolesOrOwner(TREASURUR) {
    _setTokenRoyalty(id, receiver, royaltyFraction);
  }

  function setTokenURI(
    uint256 id,
    string memory _uri
  ) public onlyRolesOrOwner(METADATA) {
    _tokenURIs[id] = _uri;
    emit URI(_uri, id);
  }

  function setDefaultBaseURI(
    string memory baseURI
  ) public onlyRolesOrOwner(METADATA) {
    _baseURI = baseURI;
  }

  function emitUriUpdate(
    uint256[] calldata ids
  ) public onlyRolesOrOwner(METADATA) {
    for (uint256 i = 0; i < ids.length; i++) {
      emit URI(uri(ids[i]), ids[i]);
    }
  }

  function supportsInterface(
    bytes4 interfaceId
  ) public view override(ERC1155, ERC2981) returns (bool) {
    return
      ERC1155.supportsInterface(interfaceId) ||
      ERC2981.supportsInterface(interfaceId) ||
      interfaceId == 0x0e89341c; // ERC1155MetadataURI
  }

  function uri(uint256 id) public view override returns (string memory) {
    string storage tokenUri = _tokenURIs[id];
    if (bytes(tokenUri).length > 0) {
      return tokenUri;
    }
    return string(abi.encodePacked(_baseURI, id.toString(), ".json"));
  }

  function mint(
    address account,
    uint256 id,
    uint256 amount,
    bytes memory data
  ) public onlyRolesOrOwner(MINTER) {
    _mint(account, id, amount, data);
  }

  function batchMint(
    address[] calldata account,
    uint256 id,
    bytes memory data
  ) public onlyRolesOrOwner(MINTER) {
    for (uint256 i = 0; i < account.length; i++) {
      _mint(account[i], id, 1, data);
    }
  }

  function withdraw() public onlyRolesOrOwner(TREASURUR) {
    payable(msg.sender).transfer(address(this).balance);
  }

  function withdrawTo(address receiver) public onlyRolesOrOwner(TREASURUR) {
    payable(receiver).transfer(address(this).balance);
  }

  error CallFailed();

  function callWithData(
    address to,
    uint256 value,
    bytes memory data
  ) public payable onlyOwner returns (bytes memory message) {
    bool success;
    (success, message) = to.call{value: value}(data);
    if (!success) {
      revert CallFailed();
    }
  }
}
