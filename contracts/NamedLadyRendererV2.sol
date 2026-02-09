// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.9 <0.9.0;

import {LibString} from "solady/src/utils/LibString.sol";
import {OwnableRoles} from "solady/src/auth/OwnableRoles.sol";
import {ITokenURIGenerator} from "./ITokenURIGenerator.sol";
import {SignatureCheckerLib} from "solady/src/utils/SignatureCheckerLib.sol";

/// @dev Minimal interface for emitting metadata updates from the renderer.
interface ITokenMetadataEmit {
    function emitMetadataUpdate(uint256 tokenId) external;
    function ownerOf(uint256 tokenId) external view returns (address);
    function isApprovedForAll(address owner, address operator) external view returns (bool);
}

/// @dev Renderer that serves named metadata by default, with reset fallback and per-token overrides.
/// @author 0xflick
/// @title NamedLadyRendererV2
/// @notice The renderer is used to serve the named metadata for tokens that are not reset to original metadata.
contract NamedLadyRendererV2 is ITokenURIGenerator, OwnableRoles {
    using LibString for uint256;
    using SignatureCheckerLib for address;

    /// @dev Base URI for the named metadata snapshot (default path).
    string private baseURI;
    /// @dev Base URI for the original pre-named metadata (reset path).
    string private originalBaseURI;
    /// @dev Target NFT contract used for ownership checks and metadata update emission.
    /// @notice The metadata emit contract is used to emit metadata updates to the NFT contract.
    ITokenMetadataEmit public metadataEmit;
    /// @dev Signer for signature-based metadata overrides.
    /// @notice The signer is used to authorize the URI updates. Only the signer can update the URI of a token.
    address private signer;

    /// @dev Per-token full URI overrides (takes precedence over base URIs).
    mapping(uint256 => string) private tokenUris;
    /// @dev Nonces for signature-based updates, per caller.
    mapping(address => uint256) private signatureNonces;
    /// @dev Bitmap tracking reset tokens (1 = reset, 0 = named default).
    mapping(uint256 => uint256) private resetBitmap;

    error NotTokenOwnerOrApproved();
    error InvalidSignature();
    error TokenIsReset();

    /// @dev Initializes renderer with named and original base URIs plus signer and NFT references.
    /// @param _baseURI The new named metadata base URI to use. This is the base URI that will be used for tokens that are not reset to original metadata.
    /// @param _originalBaseURI The new original metadata base URI to use. This is the base URI that will be used for tokens that are reset to original metadata.
    /// @param emitableNft The address of the NFT contract that will be used to emit metadata updates.
    /// @param _signer The address of the signer that will be used to authorize the URI updates.
    /// @notice The renderer is initialized with the named and original base URIs plus signer and NFT references.
    constructor(
        string memory _baseURI,
        string memory _originalBaseURI,
        address emitableNft,
        address _signer
    ) {
        baseURI = _baseURI;
        originalBaseURI = _originalBaseURI;
        metadataEmit = ITokenMetadataEmit(emitableNft);
        signer = _signer;
        _grantRoles(msg.sender, TRUST_AND_SAFETY | METADATA | SIGNER);
        _initializeOwner(msg.sender);
    }

    uint256 internal constant TRUST_AND_SAFETY = 1 << 0;

    /// @dev Returns the role that can reset tokens to original metadata.
    /// @return The role that can reset tokens to original metadata.
    /// @notice The trust role is used to reset tokens to original metadata. Only the trust role can reset tokens to original metadata.
    function trustRole() public pure returns (uint256) {
        return TRUST_AND_SAFETY;
    }

    uint256 internal constant METADATA = 1 << 1;

    /// @dev Returns the role that can update base URIs.
    /// @return The role that can update the base URIs.
    /// @notice The metadata role is used to update the base URIs. Only the metadata role can update the base URIs.
    function metadataRole() public pure returns (uint256) {
        return METADATA;
    }

    uint256 internal constant SIGNER = 1 << 2;

    /// @dev Returns the role that can update the signer address.
    /// @return The role that can update the signer address.
    /// @notice The signer role is used to authorize the URI updates. Only the signer can update the URI of a token.
    function signerRole() public pure returns (uint256) {
        return SIGNER;
    }

    /// @dev Restricts calls to the token owner or an approved operator.
    /// @param tokenId The token ID to check the ownership for.
    /// @notice The caller must be the owner of the token or an approved operator.
    modifier onlyTokenOwnerOrApproved(uint256 tokenId) {
        address owner = metadataEmit.ownerOf(tokenId);
        if (msg.sender != owner && !metadataEmit.isApprovedForAll(owner, msg.sender)) {
            revert NotTokenOwnerOrApproved();
        }
        _;
    }

    /// @dev Returns the metadata URI using the priority: override -> original (reset) -> named base.
    /// @param tokenId The token ID to return the URI for.
    /// @return The metadata URI for the token.
    /// @notice The URI is returned using the priority: override -> original (reset) -> named base.
    function tokenURI(uint256 tokenId) external view override returns (string memory) {
        if (bytes(tokenUris[tokenId]).length > 0) {
            return tokenUris[tokenId];
        }
        if (_isReset(tokenId)) {
            return string(abi.encodePacked(originalBaseURI, tokenId.toString()));
        }
        return string(abi.encodePacked(baseURI, tokenId.toString()));
    }

    /// @dev Sets a per-token URI override with signer authorization.
    /// @param tokenId The token ID to update the URI for.
    /// @param uri The URI to update the token to.
    /// @param signature The signature of the update request.
    /// @notice The signature is used to authorize the URI updates. Only the signer can update the URI of a token.
    function setTokenUri(
        uint256 tokenId,
        string calldata uri,
        bytes calldata signature
    ) external onlyTokenOwnerOrApproved(tokenId) {
        if (_isReset(tokenId)) {
            revert TokenIsReset();
        }
        bytes32 hash = hashUpdateRequest(tokenId, uri, signatureNonces[msg.sender]);
        signatureNonces[msg.sender]++;
        if (
            !signer.isValidSignatureNow(
                SignatureCheckerLib.toEthSignedMessageHash(hash),
                signature
            )
        ) {
            revert InvalidSignature();
        }
        tokenUris[tokenId] = uri;
        metadataEmit.emitMetadataUpdate(tokenId);
    }

    /// @dev Returns the current signature nonce for the sender.
    /// @param sender The address to return the nonce for.
    /// @return The current signature nonce for the sender.
    /// @notice The nonce is used to prevent replay attacks.
    function currentNonce(address sender) external view returns (uint256) {
        return signatureNonces[sender];
    }

    /// @dev Resets a token to original metadata and clears any overrides.
    /// @param tokenId The token ID to reset to original metadata.
    /// @notice The token will be reset to original metadata and any overrides will be cleared.
    function ban(uint256 tokenId) external onlyRolesOrOwner(TRUST_AND_SAFETY) {
        tokenUris[tokenId] = "";
        _setReset(tokenId, true);
        metadataEmit.emitMetadataUpdate(tokenId);
    }

    /// @dev Restores a token to the named metadata default.
    /// @param tokenId The token ID to restore to the named metadata default.
    /// @notice The token will be restored to the named metadata default.
    function restore(uint256 tokenId) external onlyRolesOrOwner(TRUST_AND_SAFETY) {
        _setReset(tokenId, false);
        metadataEmit.emitMetadataUpdate(tokenId);
    }

    /// @dev Returns true if the token is reset to original metadata.
    /// @param tokenId The token ID to check the reset status for.
    /// @return True if the token is reset to original metadata, false otherwise.
    /// @notice The reset status is stored in a packed bitmap, where each word is 256 bits and the token ID is used to index into the word.
    function isReset(uint256 tokenId) external view returns (bool) {
        return _isReset(tokenId);
    }

    /// @dev Updates the named metadata base URI.
    /// @param _baseURI The new named metadata base URI to use. This is the base URI that will be used for tokens that are not reset to original metadata.
    /// @notice The named base URI is used to serve the named metadata for tokens that are not reset to original metadata.
    function setBaseURI(string memory _baseURI) external onlyRolesOrOwner(METADATA) {
        baseURI = _baseURI;
    }

    /// @dev Updates the original metadata base URI.
    /// @param _originalBaseURI The new original metadata base URI to use. This is the base URI that will be used for tokens that are reset to original metadata.
    /// @notice The original base URI is used to serve the original metadata for tokens that are reset to original metadata.
    function setOriginalBaseURI(
        string memory _originalBaseURI
    ) external onlyRolesOrOwner(METADATA) {
        originalBaseURI = _originalBaseURI;
    }

    /// @dev Updates the signer used for URI overrides.
    /// @param _signer The new signer address to use for URI overrides. This is the address that will be used to sign the update requests.
    /// @notice The signer is used to authorize the URI updates. Only the signer can update the URI of a token.
    function setSigner(address _signer) external onlyRolesOrOwner(SIGNER) {
        signer = _signer;
    }

    /// @dev Hash used for signature authorization of URI updates.
    /// @param tokenId The token ID to update the URI for.
    /// @param uri The URI to update the token to.
    /// @param nonce The nonce for the update request.
    /// @return The hash of the update request.
    /// @notice The hash is computed by concatenating the token ID, URI, and nonce.
    function hashUpdateRequest(
        uint256 tokenId,
        string calldata uri,
        uint256 nonce
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(tokenId, uri, nonce));
    }

    /// @dev Computes the reset bitmap word and mask for a token ID.
    /// @param tokenId The token ID to compute the reset bitmap word and mask for.
    /// @return wordIndex The index of the word in the bitmap.
    /// @return mask The mask for the token ID.
    /// @notice The reset status is stored in a packed bitmap, where each word is 256 bits and the token ID is used to index into the word.
    function _resetWord(uint256 tokenId) private pure returns (uint256 wordIndex, uint256 mask) {
        wordIndex = tokenId >> 8;
        mask = 1 << (tokenId & 0xff);
    }

    /// @dev Checks reset status using a packed bitmap.
    /// @param tokenId The token ID to check the reset status for.
    /// @return True if the token is reset to original metadata, false otherwise.
    /// @notice The reset status is stored in a packed bitmap, where each word is 256 bits and the token ID is used to index into the word.
    function _isReset(uint256 tokenId) private view returns (bool) {
        (uint256 wordIndex, uint256 mask) = _resetWord(tokenId);
        return (resetBitmap[wordIndex] & mask) != 0;
    }

    /// @dev Sets or clears the reset status using a packed bitmap.
    /// @param tokenId The token ID to set or clear the reset status for.
    /// @param value The value to set the reset status to.
    function _setReset(uint256 tokenId, bool value) private {
        (uint256 wordIndex, uint256 mask) = _resetWord(tokenId);
        if (value) {
            resetBitmap[wordIndex] |= mask;
        } else {
            resetBitmap[wordIndex] &= ~mask;
        }
    }
}
