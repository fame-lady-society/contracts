// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.16;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {ReentrancyGuard} from "solady/src/utils/ReentrancyGuard.sol";
import {WrappedNFT} from "./WrappedNFT.sol";

contract WrappedNFTDonationVault is ReentrancyGuard {
    WrappedNFT public immutable wrappedNFT;
    IERC721 public immutable underlying;
    address public immutable vault;

    error InvalidWrappedNFT();
    error InvalidVault();
    error EmptyTokenList();

    event WrappedAndDonated(
        address indexed donor,
        address indexed vaultAddress,
        uint256[] tokenIds
    );

    constructor(address wrappedNFTAddress, address vaultAddress) {
        if (wrappedNFTAddress == address(0)) revert InvalidWrappedNFT();
        if (vaultAddress == address(0)) revert InvalidVault();
        wrappedNFT = WrappedNFT(wrappedNFTAddress);
        underlying = wrappedNFT.wrappedNft();
        vault = vaultAddress;
    }

    function wrapAndDonate(uint256[] calldata tokenIds) external nonReentrant {
        if (tokenIds.length == 0) revert EmptyTokenList();

        address sender = msg.sender;
        uint256 previousCost = wrappedNFT.wrapCost();
        wrappedNFT.setWrapCost(0);

        if (!underlying.isApprovedForAll(address(this), address(wrappedNFT))) {
            underlying.setApprovalForAll(address(wrappedNFT), true);
        }

        for (uint256 i = 0; i < tokenIds.length; i++) {
            underlying.transferFrom(sender, address(this), tokenIds[i]);
        }

        wrappedNFT.wrapTo(vault, tokenIds);

        wrappedNFT.setWrapCost(previousCost);
        emit WrappedAndDonated(sender, vault, tokenIds);
    }
}
