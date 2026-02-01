// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "solmate/src/tokens/ERC721.sol";
import {OwnableRoles} from "solady/src/auth/OwnableRoles.sol";
import {LibString} from "solady/src/utils/LibString.sol";
import {SignatureCheckerLib} from "solady/src/utils/SignatureCheckerLib.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IERC4906} from "./IERC4906.sol";
import {ITokenURIGenerator} from "./ITokenURIGenerator.sol";

/// @title FLSNaming - Fame Lady Society Identity Contract
/// @notice A naming and identity system for NFT holders using commit-reveal claiming
/// @dev Creates soulbound NFTs with key/value metadata and verified address management.
///      Each identity is bound to a specific gate NFT token (primaryTokenId).
contract FLSNaming is ERC721, OwnableRoles, IERC4906 {
    using LibString for uint256;

    // ============ Constants ============

    /// @notice Role for updating metadata URI
    uint256 internal constant METADATA_ADMIN = 1 << 0;

    /// @notice Role for updating metadata renderer and base URI
    uint256 internal constant METADATA_UPDATER = 1 << 1;

    /// @notice Role for emitting metadata update events
    uint256 internal constant MEADATA = 1 << 2;

    /// @notice Minimum wait time between commit and reveal (10 seconds)
    uint256 public constant MIN_COMMIT_AGE = 10 seconds;

    /// @notice Maximum time a commitment is valid (24 hours)
    uint256 public constant MAX_COMMIT_AGE = 24 hours;

    /// @notice Maximum length for a name (in bytes)
    uint256 public constant MAX_NAME_LENGTH = 64;

    // ============ EIP-712 Constants ============

    /// @notice EIP-712 domain type hash
    bytes32 private constant DOMAIN_TYPEHASH =
        keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");

    /// @notice EIP-712 type hash for AddVerifiedAddress
    bytes32 private constant ADD_VERIFIED_ADDRESS_TYPEHASH =
        keccak256("AddVerifiedAddress(uint256 tokenId,address addr,uint256 nonce)");

    /// @notice Cached domain separator (set in constructor)
    bytes32 private immutable _CACHED_DOMAIN_SEPARATOR;

    /// @notice Cached chain ID for domain separator
    uint256 private immutable _CACHED_CHAIN_ID;

    // ============ Storage ============

    /// @notice Identity data for each token
    /// @param name The claimed name
    /// @param primaryAddress The primary address that controls the identity
    /// @param primaryTokenId The gate NFT token ID bound to this identity
    struct Identity {
        string name;
        address primaryAddress;
        uint256 primaryTokenId;
    }

    /// @notice Commitment data for commit-reveal claiming
    /// @dev Packed into single storage slot: uint248 (31 bytes) + bool (1 byte) = 32 bytes
    /// @param timestamp When the commitment was made (max ~14 quintillion years, effectively unlimited)
    /// @param used Whether the commitment has been used
    struct Commitment {
        uint248 timestamp;
        bool used;
    }

    /// @notice The NFT contract used to gate identity claiming
    IERC721 public immutable gateNft;

    /// @notice Base URI for token metadata
    string public baseTokenURI;

    /// @notice Optional token URI renderer
    ITokenURIGenerator public renderer;

    /// @notice Next token ID to mint
    uint256 private _nextTokenId;

    /// @notice Identity token ID to identity data
    mapping(uint256 => Identity) public identities;

    /// @notice Identity token ID to array of verified addresses
    mapping(uint256 => address[]) private _verifiedAddresses;

    /// @notice Identity token ID to address to verified status
    mapping(uint256 => mapping(address => bool)) private _isVerified;

    /// @notice Identity token ID to array of metadata keys
    mapping(uint256 => bytes32[]) private _metadataKeys;

    /// @notice Identity token ID to metadata key to value
    mapping(uint256 => mapping(bytes32 => bytes)) private _metadata;

    /// @notice Identity token ID to metadata key to existence flag
    mapping(uint256 => mapping(bytes32 => bool)) private _metadataExists;

    /// @notice Address to identity token ID (0 = no identity)
    mapping(address => uint256) public addressToTokenId;

    /// @notice Name hash to identity token ID (0 = not claimed)
    mapping(bytes32 => uint256) public nameHashToTokenId;

    /// @notice Commitment hash to commitment data
    mapping(bytes32 => Commitment) public commitments;

    /// @notice Gate NFT token ID to identity token ID (for reverse lookup)
    mapping(uint256 => uint256) public gateTokenIdToIdentityTokenId;

    /// @notice Nonces for EIP-712 signatures (per address)
    mapping(address => uint256) public nonces;

    // ============ Errors ============

    error NotNFTHolder();
    error NameAlreadyClaimed();
    error NotPrimaryAddress();
    error AddressNotVerified();
    error CannotRemovePrimary();
    error PrimaryMustOwnTokenId();
    error TransferDisabled();
    error IdentityNotFound();
    error AddressAlreadyLinked();
    error EmptyName();
    error NameTooLong();
    error CommitmentNotFound();
    error CommitmentTooNew();
    error CommitmentExpired();
    error CommitmentAlreadyUsed();
    error AlreadyHasIdentity();
    error InvalidPrimaryTokenId();
    error GateTokenAlreadyUsed();
    error InvalidAddress();
    error InvalidSignature();
    error InvalidMetadataBatch();

    // ============ Events ============

    /// @notice Emitted when a name commitment is made
    event NameCommitted(address indexed committer, bytes32 indexed commitment);

    /// @notice Emitted when a name is claimed
    event NameClaimed(uint256 indexed tokenId, address indexed primary, string name, uint256 primaryTokenId);

    /// @notice Emitted when a verified address is added
    event VerifiedAddressAdded(uint256 indexed tokenId, address indexed addr);

    /// @notice Emitted when a verified address is removed
    event VerifiedAddressRemoved(uint256 indexed tokenId, address indexed addr);

    /// @notice Emitted when the primary address changes
    event PrimaryAddressChanged(uint256 indexed tokenId, address indexed oldPrimary, address indexed newPrimary);

    /// @notice Emitted when the primary token ID changes
    event PrimaryTokenIdChanged(uint256 indexed tokenId, uint256 oldPrimaryTokenId, uint256 newPrimaryTokenId);

    /// @notice Emitted when metadata is updated
    event MetadataUpdated(uint256 indexed tokenId, bytes32 indexed key);

    /// @notice Emitted when metadata is deleted
    event MetadataDeleted(uint256 indexed tokenId, bytes32 indexed key);

    /// @notice Emitted when an identity is synced (burned due to lost token ownership)
    event IdentitySynced(uint256 indexed tokenId, address indexed oldPrimary);

    // ============ Constructor ============

    /// @notice Create a new FLSNaming contract
    /// @param _gateNft The NFT contract used to gate identity claiming
    constructor(address _gateNft) ERC721("FLS Identity", "FLSID") {
        _initializeOwner(msg.sender);
        gateNft = IERC721(_gateNft);
        _nextTokenId = 1;

        _CACHED_CHAIN_ID = block.chainid;
        _CACHED_DOMAIN_SEPARATOR = _buildDomainSeparator();
    }

    // ============ Commit-Reveal Functions ============

    /// @notice Generate a commitment hash for claiming a name
    /// @param _name The name to claim
    /// @param _salt A random salt for hiding the name
    /// @param _owner The address that will own the identity
    /// @return The commitment hash
    function makeCommitment(string calldata _name, bytes32 _salt, address _owner) external pure returns (bytes32) {
        return keccak256(abi.encodePacked(_name, _salt, _owner));
    }

    /// @notice Require the name is not claimed and the primary token ID is valid and not already used
    /// @param _name The name to claim
    /// @param _primaryTokenId The gate NFT token ID to bind to this identity
    function checkNameNotClaimed(string calldata _name, uint256 _primaryTokenId) public view returns (bytes32 nameHash) {
        uint256 nameLen = bytes(_name).length;
        if (nameLen == 0) revert EmptyName();
        if (nameLen > MAX_NAME_LENGTH) revert NameTooLong();
        if (balanceOf(msg.sender) > 0) revert AlreadyHasIdentity();
        if (gateNft.ownerOf(_primaryTokenId) != msg.sender) revert InvalidPrimaryTokenId();
        if (gateTokenIdToIdentityTokenId[_primaryTokenId] != 0) revert GateTokenAlreadyUsed();

        nameHash = keccak256(bytes(_name));
        if (nameHashToTokenId[nameHash] != 0) revert NameAlreadyClaimed();
    }

    /// @notice Commit to claiming a name (step 1 of commit-reveal)
    /// @param commitment The commitment hash from makeCommitment
    function commitName(bytes32 commitment) external {
        if (commitments[commitment].timestamp != 0) revert CommitmentAlreadyUsed();
        commitments[commitment] = Commitment(uint248(block.timestamp), false);
        emit NameCommitted(msg.sender, commitment);
    }

    /// @notice Claim a name by revealing the commitment (step 2 of commit-reveal)
    /// @param _name The name to claim
    /// @param _salt The salt used in the commitment
    /// @param _primaryTokenId The gate NFT token ID to bind to this identity
    function claimName(string calldata _name, bytes32 _salt, uint256 _primaryTokenId) external {
        bytes32 nameHash = checkNameNotClaimed(_name, _primaryTokenId);
        bytes32 commitment = keccak256(abi.encodePacked(_name, _salt, msg.sender));
        Commitment storage c = commitments[commitment];
        
        if (c.timestamp == 0) revert CommitmentNotFound();
        if (c.used) revert CommitmentAlreadyUsed();
        if (block.timestamp < c.timestamp + MIN_COMMIT_AGE) revert CommitmentTooNew();
        if (block.timestamp > c.timestamp + MAX_COMMIT_AGE) revert CommitmentExpired();

        c.used = true;

        uint256 tokenId = _nextTokenId++;
        identities[tokenId] = Identity(_name, msg.sender, _primaryTokenId);
        nameHashToTokenId[nameHash] = tokenId;
        gateTokenIdToIdentityTokenId[_primaryTokenId] = tokenId;

        _verifiedAddresses[tokenId].push(msg.sender);
        _isVerified[tokenId][msg.sender] = true;
        addressToTokenId[msg.sender] = tokenId;

        _mint(msg.sender, tokenId);
        emit NameClaimed(tokenId, msg.sender, _name, _primaryTokenId);
    }

    // ============ Verified Address Functions ============

    /// @notice Add a verified address to an identity with EIP-712 signature verification
    /// @param addr The address to add
    /// @param signature The EIP-712 signature from addr authorizing the link
    /// @dev The signature must be over AddVerifiedAddress(tokenId, addr, nonce)
    function addVerifiedAddress(address addr, bytes calldata signature) external {
        if (addr == address(0)) revert InvalidAddress();
        uint256 tokenId = _requirePrimaryAndOwnsToken();
        if (addressToTokenId[addr] != 0) revert AddressAlreadyLinked();

        uint256 nonce = nonces[addr]++;
        bytes32 structHash = keccak256(abi.encode(ADD_VERIFIED_ADDRESS_TYPEHASH, tokenId, addr, nonce));
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR(), structHash));

        if (!SignatureCheckerLib.isValidSignatureNowCalldata(addr, digest, signature)) {
            revert InvalidSignature();
        }

        _verifiedAddresses[tokenId].push(addr);
        _isVerified[tokenId][addr] = true;
        addressToTokenId[addr] = tokenId;

        emit VerifiedAddressAdded(tokenId, addr);
    }

    /// @notice Remove a verified address from an identity
    /// @param addr The address to remove
    function removeVerifiedAddress(address addr) external {
        uint256 tokenId = _requirePrimaryAndOwnsToken();
        Identity storage identity = identities[tokenId];
        if (addr == identity.primaryAddress) revert CannotRemovePrimary();
        if (!_isVerified[tokenId][addr]) revert AddressNotVerified();

        _removeAddress(_verifiedAddresses[tokenId], addr);
        _isVerified[tokenId][addr] = false;
        addressToTokenId[addr] = 0;

        emit VerifiedAddressRemoved(tokenId, addr);
    }

    /// @notice Set a new primary address (must be in verified set)
    /// @dev The primaryTokenId must be owned by either the old or new primary
    /// @param newPrimary The new primary address
    function setPrimaryAddress(address newPrimary) external {
        uint256 tokenId = addressToTokenId[msg.sender];
        if (tokenId == 0) revert IdentityNotFound();

        Identity storage identity = identities[tokenId];
        if (identity.primaryAddress != msg.sender) revert NotPrimaryAddress();
        if (!_isVerified[tokenId][newPrimary]) revert AddressNotVerified();

        address tokenOwner = gateNft.ownerOf(identity.primaryTokenId);
        if (tokenOwner != newPrimary && tokenOwner != msg.sender) revert PrimaryMustOwnTokenId();

        address oldPrimary = identity.primaryAddress;
        identity.primaryAddress = newPrimary;

        // SAFETY: Direct storage manipulation required for soulbound primary transfer.
        // This bypasses transferFrom (which reverts for soulbound tokens) while maintaining
        // correct ERC721 balance/ownership state. Verified against solmate ERC721 v6.x.
        // The unchecked block is safe: oldPrimary balance >= 1 (owns this token),
        // newPrimary balance won't overflow (uint256 max is unreachable).
        unchecked {
            _balanceOf[oldPrimary]--;
            _balanceOf[newPrimary]++;
        }
        _ownerOf[tokenId] = newPrimary;
        delete getApproved[tokenId];
        emit Transfer(oldPrimary, newPrimary, tokenId);

        emit PrimaryAddressChanged(tokenId, oldPrimary, newPrimary);
    }

    /// @notice Set a new primary token ID (must be owned by a verified address)
    /// @dev Can be called even if primary no longer owns current primaryTokenId
    /// @param newPrimaryTokenId The new primary token ID
    function setPrimaryTokenId(uint256 newPrimaryTokenId) external {
        uint256 tokenId = addressToTokenId[msg.sender];
        if (tokenId == 0) revert IdentityNotFound();

        Identity storage identity = identities[tokenId];
        if (identity.primaryAddress != msg.sender) revert NotPrimaryAddress();

        uint256 existingIdentity = gateTokenIdToIdentityTokenId[newPrimaryTokenId];
        if (existingIdentity != 0 && existingIdentity != tokenId) revert GateTokenAlreadyUsed();

        address tokenOwner = gateNft.ownerOf(newPrimaryTokenId);
        if (!_isVerified[tokenId][tokenOwner]) revert InvalidPrimaryTokenId();

        uint256 oldPrimaryTokenId = identity.primaryTokenId;
        gateTokenIdToIdentityTokenId[oldPrimaryTokenId] = 0;
        identity.primaryTokenId = newPrimaryTokenId;
        gateTokenIdToIdentityTokenId[newPrimaryTokenId] = tokenId;

        emit PrimaryTokenIdChanged(tokenId, oldPrimaryTokenId, newPrimaryTokenId);
    }

    // ============ Metadata Functions ============

    /// @notice Set a metadata key/value pair
    /// @param key The metadata key (typically keccak256 of a string like "twitter")
    /// @param value The metadata value
    function setMetadata(bytes32 key, bytes calldata value) external {
        uint256 tokenId = _requirePrimaryAndOwnsToken();

        if (!_metadataExists[tokenId][key]) {
            _metadataKeys[tokenId].push(key);
            _metadataExists[tokenId][key] = true;
        }
        _metadata[tokenId][key] = value;
        emit MetadataUpdated(tokenId, key);
    }

    /// @notice Set multiple metadata key/value pairs
    /// @param keys The metadata keys
    /// @param values The metadata values
    function setMetadataBatch(bytes32[] calldata keys, bytes[] calldata values) external {
        uint256 tokenId = _requirePrimaryAndOwnsToken();
        uint256 len = keys.length;
        if (len != values.length) revert InvalidMetadataBatch();

        for (uint256 i; i < len;) {
            bytes32 key = keys[i];
            if (!_metadataExists[tokenId][key]) {
                _metadataKeys[tokenId].push(key);
                _metadataExists[tokenId][key] = true;
            }
            _metadata[tokenId][key] = values[i];
            emit MetadataUpdated(tokenId, key);
            unchecked {
                ++i;
            }
        }
    }

    /// @notice Delete a metadata key
    /// @param key The metadata key to delete
    function deleteMetadata(bytes32 key) external {
        uint256 tokenId = _requirePrimaryAndOwnsToken();
        if (!_metadataExists[tokenId][key]) return;

        _removeBytes32(_metadataKeys[tokenId], key);
        delete _metadata[tokenId][key];
        _metadataExists[tokenId][key] = false;
        emit MetadataDeleted(tokenId, key);
    }

    // ============ Sync Function ============

    /// @notice Sync an identity - burns it if primaryTokenId is no longer owned by a verified address
    /// @dev Anyone can call this function to clean up stale identities.
    ///      WARNING: If a user sells/transfers their gateNFT without first calling setPrimaryTokenId
    ///      to bind to a different token owned by a verified address, anyone can call sync() to
    ///      immediately burn their identity. Users should update primaryTokenId BEFORE transferring
    ///      their bound gateNFT, or ensure a verified address retains ownership.
    /// @param target The primary address to check
    function sync(address target) external {
        uint256 tokenId = addressToTokenId[target];
        if (tokenId == 0) revert IdentityNotFound();

        Identity storage identity = identities[tokenId];
        if (identity.primaryAddress != target) return;

        uint256 primaryTokenId = identity.primaryTokenId;
        address tokenOwner = gateNft.ownerOf(primaryTokenId);
        if (_isVerified[tokenId][tokenOwner]) return;

        address oldPrimary = identity.primaryAddress;
        gateTokenIdToIdentityTokenId[primaryTokenId] = 0;

        address[] storage verified = _verifiedAddresses[tokenId];
        uint256 len = verified.length;
        for (uint256 i; i < len;) {
            addressToTokenId[verified[i]] = 0;
            _isVerified[tokenId][verified[i]] = false;
            unchecked { ++i; }
        }
        delete _verifiedAddresses[tokenId];

        bytes32[] storage keys = _metadataKeys[tokenId];
        len = keys.length;
        for (uint256 i; i < len;) {
            delete _metadata[tokenId][keys[i]];
            _metadataExists[tokenId][keys[i]] = false;
            unchecked { ++i; }
        }
        delete _metadataKeys[tokenId];

        nameHashToTokenId[keccak256(bytes(identity.name))] = 0;
        delete identities[tokenId];
        _burn(tokenId);

        emit IdentitySynced(tokenId, oldPrimary);
    }

    // ============ Admin Functions ============

    /// @notice Update the base token URI
    /// @param uri The new base URI
    function setBaseTokenURI(string calldata uri) external onlyOwnerOrRoles(METADATA_ADMIN | METADATA_UPDATER) {
        baseTokenURI = uri;
    }

    /// @notice Update the token renderer
    /// @param newRenderer The new renderer contract (set to address(0) to use baseTokenURI)
    function setRenderer(address newRenderer) external onlyOwnerOrRoles(METADATA_ADMIN | METADATA_UPDATER) {
        address previousRenderer = address(renderer);
        if (previousRenderer != address(0)) {
            _removeRoles(previousRenderer, MEADATA);
        }
        renderer = ITokenURIGenerator(newRenderer);
        if (newRenderer != address(0)) {
            _grantRoles(newRenderer, MEADATA);
        }
        if (_nextTokenId > 1) {
            emit BatchMetadataUpdate(1, _nextTokenId - 1);
        }
    }

    /// @notice Emit a metadata update event for a token
    /// @param tokenId The identity token ID
    function emitMetadataUpdate(uint256 tokenId) external onlyOwnerOrRoles(MEADATA) {
        emit MetadataUpdate(tokenId);
    }

    // ============ View Functions ============

    /// @notice Get the metadata admin role constant
    function roleMetadataAdmin() external pure returns (uint256) { return METADATA_ADMIN; }

    /// @notice Get the metadata updater role constant
    function roleMetadataUpdater() external pure returns (uint256) { return METADATA_UPDATER; }

    /// @notice Get the metadata emitter role constant
    function roleMeadata() external pure returns (uint256) { return MEADATA; }

    /// @notice Get the next token ID (useful for iteration bounds)
    /// @return The next token ID that will be minted
    function nextTokenId() external view returns (uint256) { return _nextTokenId; }

    /// @notice Get identity data for a token
    /// @param tokenId The identity token ID
    /// @return name The claimed name
    /// @return primaryAddress The primary address
    /// @return primaryTokenId The bound gate NFT token ID
    function getIdentity(uint256 tokenId) external view returns (string memory, address, uint256) {
        Identity storage i = identities[tokenId];
        return (i.name, i.primaryAddress, i.primaryTokenId);
    }

    /// @notice Get all verified addresses for an identity
    /// @param tokenId The identity token ID
    /// @return Array of verified addresses
    function getVerifiedAddresses(uint256 tokenId) external view returns (address[] memory) {
        return _verifiedAddresses[tokenId];
    }

    /// @notice Check if an address is verified for an identity
    /// @param tokenId The identity token ID
    /// @param addr The address to check
    /// @return Whether the address is verified
    function isVerified(uint256 tokenId, address addr) external view returns (bool) {
        return _isVerified[tokenId][addr];
    }

    /// @notice Get a metadata value
    /// @param tokenId The identity token ID
    /// @param key The metadata key
    /// @return The metadata value
    function getMetadata(uint256 tokenId, bytes32 key) external view returns (bytes memory) {
        return _metadata[tokenId][key];
    }

    /// @notice Get all metadata keys for an identity
    /// @param tokenId The identity token ID
    /// @return Array of metadata keys
    function getMetadataKeys(uint256 tokenId) external view returns (bytes32[] memory) {
        return _metadataKeys[tokenId];
    }

    /// @notice Compute the hash of a name (for verification or lookup)
    /// @dev External systems can use this to verify they're using the same hashing method
    /// @param _name The name to hash
    /// @return The keccak256 hash of the name bytes
    function hashName(string calldata _name) external pure returns (bytes32) {
        return keccak256(bytes(_name));
    }

    /// @notice Resolve a name to an identity token ID
    /// @param _name The name to resolve
    /// @return The identity token ID (0 if not found)
    function resolveName(string calldata _name) external view returns (uint256) {
        return nameHashToTokenId[keccak256(bytes(_name))];
    }

    /// @notice Resolve a name hash directly to identity data
    /// @dev Useful for external systems that have pre-computed normalized hashes
    /// @param nameHash The keccak256 hash of the name
    /// @return name The stored name string (empty if not found)
    /// @return primaryAddress The primary address (address(0) if not found)
    /// @return primaryTokenId The bound gate NFT token ID (0 if not found)
    function resolveByNameHash(bytes32 nameHash) external view returns (string memory name, address primaryAddress, uint256 primaryTokenId) {
        uint256 tokenId = nameHashToTokenId[nameHash];
        if (tokenId == 0) return ("", address(0), 0);
        Identity storage i = identities[tokenId];
        return (i.name, i.primaryAddress, i.primaryTokenId);
    }

    /// @notice Resolve a name directly to its primary address
    /// @param _name The name to resolve
    /// @return The primary address (address(0) if not found)
    function resolvePrimaryByName(string calldata _name) external view returns (address) {
        uint256 id = nameHashToTokenId[keccak256(bytes(_name))];
        if (id == 0) return address(0);
        return identities[id].primaryAddress;
    }

    /// @notice Resolve a gate NFT token ID to the primary address of its identity
    /// @dev Returns address(0) if the token is not bound or if owned by non-verified address
    /// @param gateTokenId The gate NFT token ID
    /// @return The primary address (address(0) if not found or invalid)
    function resolvePrimaryByGateTokenId(uint256 gateTokenId) external view returns (address) {
        uint256 id = gateTokenIdToIdentityTokenId[gateTokenId];
        if (id == 0 || !_isVerified[id][gateNft.ownerOf(gateTokenId)]) return address(0);
        return identities[id].primaryAddress;
    }

    /// @notice Check if an address owns any gate NFT
    /// @param addr The address to check
    /// @return Whether the address owns a gate NFT
    function hasGateNFT(address addr) external view returns (bool) {
        return gateNft.balanceOf(addr) > 0;
    }

    /// @notice Get commitment data
    /// @param commitment The commitment hash
    /// @return timestamp When the commitment was made
    /// @return used Whether the commitment has been used
    function getCommitment(bytes32 commitment) external view returns (uint256, bool) {
        Commitment storage c = commitments[commitment];
        return (c.timestamp, c.used);
    }

    // ============ EIP-712 View Functions ============

    /// @notice Get the EIP-712 domain separator
    /// @return The domain separator
    function DOMAIN_SEPARATOR() public view returns (bytes32) {
        if (block.chainid == _CACHED_CHAIN_ID) {
            return _CACHED_DOMAIN_SEPARATOR;
        }
        return _buildDomainSeparator();
    }

    /// @notice Build the EIP-712 digest for adding a verified address
    /// @dev Used by front-ends to construct the message for signing
    /// @param tokenId The identity token ID
    /// @param addr The address to be added
    /// @param nonce The current nonce for addr (use nonces(addr) to get current value)
    /// @return The digest to be signed
    function buildAddVerifiedAddressDigest(uint256 tokenId, address addr, uint256 nonce) external view returns (bytes32) {
        bytes32 structHash = keccak256(abi.encode(ADD_VERIFIED_ADDRESS_TYPEHASH, tokenId, addr, nonce));
        return keccak256(abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR(), structHash));
    }

    // ============ ERC721 Overrides ============

    /// @notice Get token URI
    /// @param tokenId The identity token ID
    /// @return The token URI
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        if (identities[tokenId].primaryAddress == address(0)) revert IdentityNotFound();
        ITokenURIGenerator currentRenderer = renderer;
        if (address(currentRenderer) != address(0)) {
            return currentRenderer.tokenURI(tokenId);
        }
        return string(abi.encodePacked(baseTokenURI, tokenId.toString()));
    }

    /// @notice Transfer is disabled for soulbound tokens
    function transferFrom(address, address, uint256) public pure override {
        revert TransferDisabled();
    }

    /// @notice Safe transfer is disabled for soulbound tokens
    function safeTransferFrom(address, address, uint256) public pure override {
        revert TransferDisabled();
    }

    /// @notice Safe transfer with data is disabled for soulbound tokens
    function safeTransferFrom(address, address, uint256, bytes calldata) public pure override {
        revert TransferDisabled();
    }

    /// @notice Approval is disabled for soulbound tokens
    function approve(address, uint256) public pure override {
        revert TransferDisabled();
    }

    /// @notice Approval for all is disabled for soulbound tokens
    function setApprovalForAll(address, bool) public pure override {
        revert TransferDisabled();
    }

    // ============ Internal Functions ============

    /// @dev Build the EIP-712 domain separator
    function _buildDomainSeparator() internal view returns (bytes32) {
        return keccak256(
            abi.encode(
                DOMAIN_TYPEHASH,
                keccak256(bytes("FLS Identity")),
                keccak256(bytes("1")),
                block.chainid,
                address(this)
            )
        );
    }

    /// @dev Require caller is primary and primaryTokenId is owned by a verified address
    function _requirePrimaryAndOwnsToken() internal view returns (uint256 tokenId) {
        tokenId = addressToTokenId[msg.sender];
        if (tokenId == 0) revert IdentityNotFound();
        Identity storage identity = identities[tokenId];
        if (identity.primaryAddress != msg.sender) revert NotPrimaryAddress();
        if (!_isVerified[tokenId][gateNft.ownerOf(identity.primaryTokenId)]) revert PrimaryMustOwnTokenId();
    }

    /// @dev Remove an address from an array using swap-and-pop
    function _removeAddress(address[] storage arr, address value) internal {
        uint256 len = arr.length;
        for (uint256 i; i < len;) {
            if (arr[i] == value) {
                arr[i] = arr[len - 1];
                arr.pop();
                return;
            }
            unchecked { ++i; }
        }
    }

    /// @dev Remove a bytes32 from an array using swap-and-pop
    function _removeBytes32(bytes32[] storage arr, bytes32 value) internal {
        uint256 len = arr.length;
        for (uint256 i; i < len;) {
            if (arr[i] == value) {
                arr[i] = arr[len - 1];
                arr.pop();
                return;
            }
            unchecked { ++i; }
        }
    }
}
