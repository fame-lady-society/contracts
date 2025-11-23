// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {
  AdvancedOrder,
  CriteriaResolver,
  OfferItem
} from "seaport-types/src/lib/ConsiderationStructs.sol";

/// @notice Basic Seaport stub: forwards ERC721 from offerer to recipient and accepts ETH.
contract MockSeaport {
  event Fulfilled(
    address indexed offerer,
    address indexed recipient,
    uint256 tokenId,
    uint256 value
  );

  function fulfillAdvancedOrder(
    AdvancedOrder calldata advancedOrder,
    CriteriaResolver[] calldata,
    bytes32,
    address recipient
  ) external payable returns (bool) {
    OfferItem calldata offerItem = advancedOrder.parameters.offer[0];
    IERC721(offerItem.token).transferFrom(
      advancedOrder.parameters.offerer,
      recipient,
      offerItem.identifierOrCriteria
    );
    emit Fulfilled(
      advancedOrder.parameters.offerer,
      recipient,
      offerItem.identifierOrCriteria,
      msg.value
    );
    return true;
  }

  receive() external payable {}
}
