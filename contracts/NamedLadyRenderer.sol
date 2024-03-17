// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.9 <0.9.0;

// StringLib
import {LibString} from "solady/src/utils/LibString.sol";
import {OwnableRoles} from "solady/src/auth/OwnableRoles.sol";
import {ITokenURIGenerator} from "./ITokenURIGenerator.sol";
import {SignatureCheckerLib} from "solady/src/utils/SignatureCheckerLib.sol";

interface ITokenMetadataEmit {
  function emitMetadataUpdate(uint256 tokenId) external;
  function ownerOf(uint256 tokenId) external view returns (address);
  function isApprovedForAll(
    address owner,
    address operator
  ) external view returns (bool);
}

contract NamedLadyRenderer is ITokenURIGenerator, OwnableRoles {
  using LibString for uint256;
  using SignatureCheckerLib for address;

  string private baseURI;
  ITokenMetadataEmit public metadataEmit;
  address private signer;

  mapping(uint256 => string) private tokenUris;
  mapping(address => uint256) private signatureNonces;

  error NotTokenOwnerOrApproved();
  error InvalidSignature();

  constructor(string memory _baseURI, address emitableNft, address _signer) {
    baseURI = _baseURI;
    metadataEmit = ITokenMetadataEmit(emitableNft);
    signer = _signer;
    _grantRoles(msg.sender, TRUST_AND_SAFETY | METADATA | SIGNER);
    _initializeOwner(msg.sender);
  }

  uint256 internal constant TRUST_AND_SAFETY = 1 << 0;

  /**
   * @dev Returns the role that controls the trust and safety of the contract. This role can clear the metadata of a token in cases of vulgar or illegal content.
   */
  function trustRole() public pure returns (uint256) {
    return TRUST_AND_SAFETY;
  }

  uint256 internal constant METADATA = 1 << 1;

  /*
   * @dev Returns the role that controls the metadata of the contract. This role can set the base URI.
   */
  function metadataRole() public pure returns (uint256) {
    return METADATA;
  }

  uint256 internal constant SIGNER = 1 << 2;

  /*
   * @dev Returns the role that controls the signer of the contract. This role can set the signer address.
   */
  function signerRole() public pure returns (uint256) {
    return SIGNER;
  }

  /**
   * @dev Throws if called by any account other than the owner or an approved operator of the token.
   */
  modifier onlyTokenOwnerOrApproved(uint256 tokenId) {
    address owner = metadataEmit.ownerOf(tokenId);
    if (
      msg.sender != owner && !metadataEmit.isApprovedForAll(owner, msg.sender)
    ) {
      revert NotTokenOwnerOrApproved();
    }
    _;
  }

  /**
   * @dev Returns the URI for a token ID.
   */
  function tokenURI(
    uint256 tokenId
  ) external view override returns (string memory) {
    if (bytes(tokenUris[tokenId]).length > 0) {
      return tokenUris[tokenId];
    }
    return string(abi.encodePacked(baseURI, tokenId.toString()));
  }

  /**
   * @dev Sets the token URI for a token.
   * @param tokenId uint256 ID of the token to set its URI.
   * @param uri string URI to assign.
   * @param signature bytes Signature of the update request.
   */
  function setTokenUri(
    uint256 tokenId,
    string calldata uri,
    bytes calldata signature
  ) external onlyTokenOwnerOrApproved(tokenId) {
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

  /**
   * @dev Returns the current nonce for a given address.
   */
  function currentNonce(address sender) external view returns (uint256) {
    return signatureNonces[sender];
  }

  /**
   * @dev Bans a token by setting its URI to an empty string. To be only called by the trust and safety role in cases of vulgar or illegal content.
   * @param tokenId uint256 ID of the token to ban.
   */
  function ban(uint256 tokenId) external onlyRolesOrOwner(TRUST_AND_SAFETY) {
    tokenUris[tokenId] = "";
    metadataEmit.emitMetadataUpdate(tokenId);
  }

  /**
   * @dev Sets the base URI for all token IDs.
   * @param _baseURI string URI to assign.
   */
  function setBaseURI(
    string memory _baseURI
  ) external onlyRolesOrOwner(METADATA) {
    baseURI = _baseURI;
  }

  /**
   * @dev Sets the signer address.
   * @param _signer address Signer address to assign.
   */
  function setSigner(address _signer) external onlyRolesOrOwner(SIGNER) {
    signer = _signer;
  }

  /**
   * @dev Returns the hash of an update request.
   * @param tokenId uint256 ID of the token to set its URI.
   * @param uri string URI to assign.
   * @param nonce uint256 Nonce of the update request.
   */
  function hashUpdateRequest(
    uint256 tokenId,
    string calldata uri,
    uint256 nonce
  ) public pure returns (bytes32) {
    return keccak256(abi.encodePacked(tokenId, uri, nonce));
  }
}
