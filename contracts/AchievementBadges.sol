// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title AchievementBadges
 * @notice Soulbound ERC1155 badges controlled by roles.
 */
contract AchievementBadges is ERC1155, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    constructor(string memory baseUri, address admin) ERC1155(baseUri) {
        require(admin != address(0), "Badges: admin zero");
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
    }

    /**
     * @notice Allows authorized accounts to mint a badge.
     */
    function mint(address to, uint256 id, uint256 amount) external onlyRole(MINTER_ROLE) {
        _mint(to, id, amount, "");
    }

    /**
     * @notice Allows authorized accounts to mint multiple badges.
     */
    function mintBatch(address to, uint256[] calldata ids, uint256[] calldata amounts) external onlyRole(MINTER_ROLE) {
        _mintBatch(to, ids, amounts, "");
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC1155, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts
    ) internal override {
        if (from != address(0) && to != address(0)) {
            revert("SBT: non-transferable");
        }
        super._update(from, to, ids, amounts);
    }
}
