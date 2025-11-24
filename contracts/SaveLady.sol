// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ReentrancyGuard} from "solady/src/utils/ReentrancyGuard.sol";
import {
  UUPSUpgradeable
} from "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";

import {
  Initializable
} from "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {Ownable} from "solady/src/auth/Ownable.sol";
import {
  ConsiderationInterface as SeaportInterface
} from "seaport-types/src/interfaces/ConsiderationInterface.sol";
import {ItemType, Side} from "seaport-types/src/lib/ConsiderationEnums.sol";
import {
  AdvancedOrder,
  ConsiderationItem,
  CriteriaResolver,
  OfferItem,
  OrderParameters
} from "seaport-types/src/lib/ConsiderationStructs.sol";
import {FameLadySociety} from "./FameLadySociety.sol";

/// @notice Minimal Seaport 1.6 interface with the structs we actually use.
///         This matches ConsiderationInterface / ConsiderationStructs from Seaport 1.6.
// interface ISeaport {

//   function fulfillAdvancedOrder(
//     AdvancedOrder calldata advancedOrder,
//     CriteriaResolver[] calldata criteriaResolvers,
//     bytes32 fulfillerConduitKey,
//     address recipient
//   ) external payable returns (bool fulfilled);
// }

/// @notice Minimal ERC721 receiver so this contract can receive NFTs from Seaport.
interface IERC721Receiver {
  function onERC721Received(
    address operator,
    address from,
    uint256 tokenId,
    bytes calldata data
  ) external returns (bytes4);
}

/// @title Fame Lady Squad sweep + Fame Lady Society wrap helper
/// @notice
/// - Only buys Fame Lady Squad (FLSQ) via Seaport 1.6 using ETH.
/// - Immediately wraps into Fame Lady Society (FLS) and sends wrapped NFTs to caller.
/// - Charges 2.5% fee to contract owner.
/// - Pays FameLadySociety.wrapCost() per wrapped token.
contract SaveLady is
  Ownable,
  ReentrancyGuard,
  IERC721Receiver,
  UUPSUpgradeable,
  Initializable
{
  /// @notice Fame Lady Society wrapped token (FLS).
  address public constant FAME_LADY_SOCIETY =
    0x6cF4328f1Ea83B5d592474F9fCDC714FAAfd1574;

  /// @notice Fame Lady Squad original token (FLSQ).
  address public constant FAME_LADY_SQUAD =
    0xf3E6DbBE461C6fa492CeA7Cb1f5C5eA660EB1B47;

  /// @notice 2.5% fee in basis points (2.5% = 250 / 10_000).
  uint256 public constant FEE_BPS = 250;

  /// @notice Seaport 1.6 contract (mainnet).
  address public constant seaport = 0x0000000000000068F116a894984e2DB1123eB395;

  /// @notice Cached flag so we only setApprovalForAll once.
  bool public squadApprovalSet;

  event SweepAndWrap(
    address indexed buyer,
    uint256[] tokenIds,
    uint256 totalPrice,
    uint256 totalWrapCost,
    uint256 feePaid
  );

  // ----------------------------
  //        Initializer
  // ----------------------------

  function initialize() public initializer {
    _initializeOwner(msg.sender);
  }

  function _authorizeUpgrade(address) internal override onlyOwner {
    // Only owner can upgrade.
  }

  // ----------------------------
  //        Main entrypoint
  // ----------------------------

  /// @notice Sweep one or more Fame Lady Squad NFTs from Seaport, wrap to FLS, and send to msg.sender.
  ///
  /// @param advancedOrders   Seaport AdvancedOrder structs (numerator=1, denominator=1).
  /// @param fulfillerConduitKey Conduit key Seaport should use for *fulfiller* approvals (usually zero hash).
  /// @param tokenIds         Fame Lady Squad token IDs corresponding 1:1 with advancedOrders.
  /// @param ethAmounts       ETH to send per order (must match sum of consideration for each order).
  ///
  /// @dev
  /// - Only ETH consideration is supported (no WETH / ERC20).
  /// - Each order must offer exactly one ERC721: FAME_LADY_SQUAD.
  /// - msg.value must be exactly (sum(price) + numTokens*wrapCost + 2.5% fee).
  /// - Wrapped FLS tokens are sent to msg.sender.
  function sweepAndWrap(
    AdvancedOrder[] calldata advancedOrders,
    bytes32 fulfillerConduitKey,
    uint256[] calldata tokenIds,
    uint256[] calldata ethAmounts
  ) external payable nonReentrant {
    uint256 length = advancedOrders.length;
    _requireBasicLengths(length, tokenIds, ethAmounts);

    uint256 totalPrice = _validateAndSum(advancedOrders, tokenIds, ethAmounts);

    FameLadySociety society = FameLadySociety(FAME_LADY_SOCIETY);
    uint256 wrapCostEach = society.wrapCost();
    uint256 totalWrapCost = wrapCostEach * length;

    uint256 feeAmount = ((totalPrice + totalWrapCost) * FEE_BPS) / 10_000;
    require(
      msg.value == totalPrice + totalWrapCost + feeAmount,
      "Incorrect ETH supplied"
    );
    _fulfillOrders(advancedOrders, ethAmounts, fulfillerConduitKey);

    // Approve FameLadySociety once.
    if (!squadApprovalSet) {
      IERC721(FAME_LADY_SQUAD).setApprovalForAll(FAME_LADY_SOCIETY, true);
      squadApprovalSet = true;
    }

    // Wrap and send to caller.
    society.wrapTo{value: totalWrapCost}(msg.sender, tokenIds);

    // Transfer fee.
    (bool sentFee, ) = payable(owner()).call{value: feeAmount}("");
    require(sentFee, "Fee transfer failed");

    emit SweepAndWrap(
      msg.sender,
      tokenIds,
      totalPrice,
      totalWrapCost,
      feeAmount
    );
  }

  /// @dev Internal helper to fulfill orders; isolates loop to keep stack depth low.
  function _fulfillOrders(
    AdvancedOrder[] calldata advancedOrders,
    uint256[] calldata ethAmounts,
    bytes32 conduitKey
  ) internal {
    CriteriaResolver[] memory emptyCriteria = new CriteriaResolver[](0);
    uint256 length = advancedOrders.length;
    for (uint256 i = 0; i < length; ) {
      bool ok = SeaportInterface(seaport).fulfillAdvancedOrder{
        value: ethAmounts[i]
      }(advancedOrders[i], emptyCriteria, conduitKey, address(this));
      require(ok, "Seaport fulfill failed");
      unchecked {
        ++i;
      }
    }
  }

  /// @dev Basic length checks to reduce stack vars in main function.
  function _requireBasicLengths(
    uint256 len,
    uint256[] calldata tokenIds,
    uint256[] calldata ethAmounts
  ) internal pure {
    require(len > 0, "No orders");
    require(tokenIds.length == len, "tokenIds length mismatch");
    require(ethAmounts.length == len, "ethAmounts length mismatch");
  }

  /// @dev Validate each order and return summed total price.
  function _validateAndSum(
    AdvancedOrder[] calldata advancedOrders,
    uint256[] calldata tokenIds,
    uint256[] calldata ethAmounts
  ) internal pure returns (uint256 totalPrice) {
    uint256 length = advancedOrders.length;
    for (uint256 i = 0; i < length; ) {
      AdvancedOrder calldata adv = advancedOrders[i];
      OrderParameters calldata p = adv.parameters;

      require(
        adv.numerator == 1 && adv.denominator == 1,
        "Partial fills not supported"
      );
      require(adv.extraData.length == 0, "extraData not supported");

      require(p.offer.length == 1, "Offer length must be 1");
      OfferItem calldata offerItem = p.offer[0];
      require(offerItem.itemType == ItemType.ERC721, "Offer must be ERC721");
      require(
        offerItem.token == FAME_LADY_SQUAD,
        "Offer must be Fame Lady Squad"
      );
      require(
        offerItem.identifierOrCriteria == tokenIds[i],
        "Token ID mismatch"
      );
      require(
        offerItem.startAmount == 1 && offerItem.endAmount == 1,
        "ERC721 amount must be 1"
      );

      uint256 considerationLength = p.consideration.length;
      require(considerationLength > 0, "No consideration");
      require(
        p.totalOriginalConsiderationItems == considerationLength,
        "totalOriginalConsiderationItems mismatch"
      );
      uint256 orderTotal = 0;
      for (uint256 j = 0; j < considerationLength; ) {
        ConsiderationItem calldata c = p.consideration[j];
        require(c.itemType == ItemType.NATIVE, "Only native ETH consideration");
        require(c.token == address(0), "ETH token address must be zero");
        require(c.identifierOrCriteria == 0, "ETH identifier must be zero");
        require(
          c.startAmount == c.endAmount,
          "Variable consideration not supported"
        );
        orderTotal += c.startAmount;
        unchecked {
          ++j;
        }
      }
      require(orderTotal == ethAmounts[i], "ethAmounts mismatch");
      totalPrice += orderTotal;
      unchecked {
        ++i;
      }
    }
  }

  // ----------------------------
  //        ERC721 receiver
  // ----------------------------

  /// @notice Accept incoming ERC721 transfers (from Seaport).
  function onERC721Received(
    address,
    address,
    uint256,
    bytes calldata
  ) external pure override returns (bytes4) {
    // Simply accept the transfer.
    return IERC721Receiver.onERC721Received.selector;
  }

  // ----------------------------
  //        Admin helpers
  // ----------------------------

  /// @notice Allow owner to pull out stray ETH (if any accumulates).
  function rescueETH(address payable to, uint256 amount) external onlyOwner {
    require(to != address(0), "Zero address");
    (bool ok, ) = to.call{value: amount}("");
    require(ok, "Rescue ETH failed");
  }

  /// @notice Allow owner to reset the "setApprovalForAll" flag if needed
  ///         (e.g. if the contract is re-used on a fork or if approvals are cleared).
  function setSquadApprovalSet(bool value) external onlyOwner {
    squadApprovalSet = value;
  }
}
