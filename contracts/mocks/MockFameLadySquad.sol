// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

/// @notice Minimal, permissive ERC721 used for SaveLady integration tests.
///         Anyone can mint or remint tokens; safe transfer does not enforce receiver hooks.
contract MockFameLadySquad is IERC721 {
  string public constant name = "MockFameLadySquad";
  string public constant symbol = "MFLSQ";

  mapping(uint256 => address) private _owners;
  mapping(address => uint256) private _balances;
  mapping(uint256 => address) private _tokenApprovals;
  mapping(address => mapping(address => bool)) private _operatorApprovals;

  function supportsInterface(bytes4 interfaceId) external pure returns (bool) {
    return
      interfaceId == type(IERC721).interfaceId ||
      interfaceId == type(IERC165).interfaceId;
  }

  function balanceOf(address owner) external view returns (uint256) {
    require(owner != address(0), "ZERO_ADDRESS");
    return _balances[owner];
  }

  function ownerOf(uint256 tokenId) public view returns (address) {
    address owner = _owners[tokenId];
    require(owner != address(0), "NOT_MINTED");
    return owner;
  }

  function mint(address to, uint256 tokenId) external {
    address previousOwner = _owners[tokenId];
    if (previousOwner != address(0)) {
      _balances[previousOwner] -= 1;
    }
    _owners[tokenId] = to;
    _balances[to] += 1;
    emit Transfer(previousOwner, to, tokenId);
  }

  function approve(address to, uint256 tokenId) external {
    address owner = ownerOf(tokenId);
    require(
      msg.sender == owner || isApprovedForAll(owner, msg.sender),
      "NOT_AUTHORIZED"
    );
    _tokenApprovals[tokenId] = to;
    emit Approval(owner, to, tokenId);
  }

  function getApproved(uint256 tokenId) public view returns (address) {
    require(_owners[tokenId] != address(0), "NOT_MINTED");
    return _tokenApprovals[tokenId];
  }

  function setApprovalForAll(address operator, bool approved) external {
    _operatorApprovals[msg.sender][operator] = approved;
    emit ApprovalForAll(msg.sender, operator, approved);
  }

  function isApprovedForAll(address owner, address operator)
    public
    view
    returns (bool)
  {
    return _operatorApprovals[owner][operator];
  }

  function transferFrom(address from, address to, uint256 tokenId) public {
    address owner = ownerOf(tokenId);
    require(owner == from, "WRONG_FROM");
    require(to != address(0), "ZERO_TO");
    require(
      msg.sender == owner ||
        isApprovedForAll(owner, msg.sender) ||
        getApproved(tokenId) == msg.sender,
      "NOT_AUTHORIZED"
    );
    _tokenApprovals[tokenId] = address(0);
    _owners[tokenId] = to;
    _balances[from] -= 1;
    _balances[to] += 1;
    emit Transfer(from, to, tokenId);
  }

  function safeTransferFrom(address from, address to, uint256 tokenId) external {
    transferFrom(from, to, tokenId);
  }

  function safeTransferFrom(
    address from,
    address to,
    uint256 tokenId,
    bytes calldata
  ) external {
    transferFrom(from, to, tokenId);
  }
}
