// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.16;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {ERC721} from "solmate/src/tokens/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ITokenURIGenerator} from "./ITokenURIGenerator.sol";
import {IERC4906} from "./IERC4906.sol";

contract WrappedNFT is ERC721, Ownable, IERC4906 {
    IERC721 public immutable wrappedNft;
    ITokenURIGenerator public renderer;
    mapping(uint256 => bool) public claimed;

    constructor(
        string memory name,
        string memory symbol,
        address nftContract,
        address tokenRenderer
    ) ERC721(name, symbol) {
        wrappedNft = IERC721(nftContract);
        renderer = ITokenURIGenerator(tokenRenderer);
    }

    function isWrapped(uint256 tokenId) public view returns (bool) {
        return wrappedNft.ownerOf(tokenId) == address(this);
    }

    function setRenderer(address newRenderer) public onlyOwner {
        renderer = ITokenURIGenerator(newRenderer);
        emit BatchMetadataUpdate(0, 10000);
    }

    /**
     * Called when an ERC721 is sent to the contract. If it's an FLS token then send back a wrapped token
     */
    function onERC721Received(
        address from,
        address,
        uint256 tokenId,
        bytes calldata
    ) external returns (bytes4) {
        // Check that we now own token
        require(wrappedNft.ownerOf(tokenId) == address(this), "must own");
        // Can only succeed if the token does not already exist
        _mint(from, tokenId);
        // Done
        return this.onERC721Received.selector;
    }

    function unwrap(address to, uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender, "must own");
        require(isWrapped(tokenId), "not wrapped");
        _burn(tokenId);
        wrappedNft.safeTransferFrom(address(this), to, tokenId);
    }

    function unwrapMany(address to, uint256[] calldata tokenIds) public {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            unwrap(to, tokenIds[i]);
        }
    }

    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        require(isWrapped(tokenId), "not wrapped");
        return renderer.tokenURI(tokenId);
    }

    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC721) returns (bool) {
        return
            interfaceId == bytes4(0x49064906) ||
            super.supportsInterface(interfaceId);
    }
}
