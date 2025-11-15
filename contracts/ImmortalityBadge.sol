// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title ImmortalityBadge
 * @notice Soulbound badge collection that powers the Immortality MVP test badge flow.
 */
contract ImmortalityBadge is ERC721, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    uint256 public constant BADGE_TYPE_TEST = 1;

    struct BadgeMeta {
        bool enabled;
        bool transferable;
        string uri;
    }

    mapping(uint256 => BadgeMeta) public badgeTypes;
    mapping(uint256 => uint256) private _badgeTypeOfToken;
    mapping(address => mapping(uint256 => bool)) private _hasBadge;

    uint256 private _nextTokenId;
    string private _baseTokenURI;

    error BadgeDisabled(uint256 badgeType);
    error BadgeAlreadyClaimed(uint256 badgeType, address account);
    error BadgeTransferDisabled(uint256 badgeType);

    event BadgeMinted(address indexed to, uint256 indexed badgeType, uint256 tokenId);

    constructor(string memory baseUri, address admin) ERC721("ImmortalityBadge", "IMBADGE") {
        require(admin != address(0), "Badge: admin zero");
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
        _nextTokenId = 1;
        _baseTokenURI = baseUri;
    }

    function configureBadgeType(uint256 badgeType, BadgeMeta calldata meta) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(badgeType != 0, "Badge: zero type");
        badgeTypes[badgeType] = meta;
    }

    function setBaseURI(string calldata newBaseUri) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _baseTokenURI = newBaseUri;
    }

    function mintBadge(address to, uint256 badgeType) external onlyRole(MINTER_ROLE) returns (uint256 tokenId) {
        BadgeMeta memory meta = badgeTypes[badgeType];
        if (!meta.enabled) {
            revert BadgeDisabled(badgeType);
        }
        if (to == address(0)) {
            revert ERC721InvalidReceiver(address(0));
        }
        if (_hasBadge[to][badgeType]) {
            revert BadgeAlreadyClaimed(badgeType, to);
        }

        tokenId = _nextTokenId++;
        _badgeTypeOfToken[tokenId] = badgeType;
        _hasBadge[to][badgeType] = true;

        _safeMint(to, tokenId);
        emit BadgeMinted(to, badgeType, tokenId);
    }

    function hasBadge(address account, uint256 badgeType) external view returns (bool) {
        return _hasBadge[account][badgeType];
    }

    function badgeTypeOf(uint256 tokenId) external view returns (uint256) {
        return _badgeTypeOfToken[tokenId];
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        BadgeMeta memory meta = badgeTypes[_badgeTypeOfToken[tokenId]];
        if (bytes(meta.uri).length > 0) {
            return meta.uri;
        }
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = super._update(to, tokenId, auth);
        if (from != address(0) && to != address(0)) {
            uint256 badgeType = _badgeTypeOfToken[tokenId];
            if (!badgeTypes[badgeType].transferable) {
                revert BadgeTransferDisabled(badgeType);
            }
        }
        return from;
    }
}
