// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title AchievementBadges
 * @notice Soulbound ERC721 badge collection with configurable badge types and metadata URIs.
 */
contract AchievementBadges is ERC721, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    struct BadgeType {
        string uri;
        bool enabled;
    }

    uint256 private _nextTokenId;
    mapping(uint256 => BadgeType) private _badgeTypes;
    mapping(uint256 => uint256) private _badgeTypeOfToken;

    event BadgeTypeUpdated(uint256 indexed badgeType, string uri, bool enabled);
    event BadgeMinted(address indexed to, uint256 indexed badgeType, uint256 tokenId);

    error BadgeTypeDisabled();
    error NonTransferable();
    error UnknownBadgeType();
    error NonexistentToken();

    constructor(string memory name_, string memory symbol_, address admin) ERC721(name_, symbol_) {
        require(admin != address(0), "Badges: admin zero");
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
        _nextTokenId = 1;
    }

    function setBadgeType(uint256 badgeType, string calldata uri, bool enabled)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        if (badgeType == 0) revert UnknownBadgeType();
        _badgeTypes[badgeType] = BadgeType({uri: uri, enabled: enabled});
        emit BadgeTypeUpdated(badgeType, uri, enabled);
    }

    function getBadgeType(uint256 badgeType) external view returns (BadgeType memory) {
        BadgeType memory meta = _badgeTypes[badgeType];
        if (badgeType == 0) revert UnknownBadgeType();
        return meta;
    }

    function mintBadge(address to, uint256 badgeType) external onlyRole(MINTER_ROLE) returns (uint256 tokenId) {
        BadgeType memory meta = _badgeTypes[badgeType];
        if (!meta.enabled) revert BadgeTypeDisabled();
        if (to == address(0)) revert ERC721InvalidReceiver(address(0));

        tokenId = _nextTokenId++;
        _badgeTypeOfToken[tokenId] = badgeType;
        _safeMint(to, tokenId);
        emit BadgeMinted(to, badgeType, tokenId);
    }

    function badgeTypeOf(uint256 tokenId) external view returns (uint256) {
        if (!_exists(tokenId)) revert NonexistentToken();
        return _badgeTypeOfToken[tokenId];
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        if (!_exists(tokenId)) revert NonexistentToken();
        uint256 badgeType = _badgeTypeOfToken[tokenId];
        BadgeType memory meta = _badgeTypes[badgeType];
        return meta.uri;
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = super._update(to, tokenId, auth);
        if (from != address(0) && to != address(0)) {
            revert NonTransferable();
        }
        return from;
    }
}
