// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.16;

import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {ITokenURIGenerator} from "./ITokenURIGenerator.sol";
import {IERC4906} from "./IERC4906.sol";

interface EmitableMetadtata is IERC4906 {
    function emitMetadataUpdate(uint256 tokenId) external;
}

contract TestRenderer is ITokenURIGenerator {
    using Strings for uint256;

    string private baseUri;
    EmitableMetadtata private emitableMetadata;

    function setBaseUri(string calldata _baseUri) public {
        baseUri = _baseUri;
    }

    function setEmittableMetadata(address _emitableMetadata) public {
        emitableMetadata = EmitableMetadtata(_emitableMetadata);
    }

    function tokenURI(uint256 tokenId) external view returns (string memory) {
        return string(abi.encodePacked(baseUri, tokenId.toString()));
    }

    function emitMetadata(uint256 tokenId) public {
        emitableMetadata.emitMetadataUpdate(tokenId);
    }
}
