// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title POIToken
 * @notice Proof Of Influence ERC20 token with role based minting, pausing and blacklist controls.
 */
contract POIToken is ERC20, ERC20Permit, ERC20Burnable, AccessControl, Pausable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    address public treasury;
    mapping(address => bool) public blacklist;

    event Minted(address indexed to, uint256 amount);
    event Burned(address indexed from, uint256 amount);
    event TreasuryUpdated(address indexed previousTreasury, address indexed newTreasury);
    event BlacklistUpdated(address indexed account, bool isBlacklisted);

    error InvalidAddress();
    error BlacklistedAddress(address account);

    constructor(address admin, address treasury_, uint256 initialSupply)
        ERC20("Proof Of Influence", "POI")
        ERC20Permit("Proof Of Influence")
    {
        if (admin == address(0) || treasury_ == address(0)) {
            revert InvalidAddress();
        }

        treasury = treasury_;
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);

        if (initialSupply > 0) {
            _mint(treasury_, initialSupply);
            emit Minted(treasury_, initialSupply);
        }
    }

    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        _mint(to, amount);
        emit Minted(to, amount);
    }

    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function setTreasury(address newTreasury) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (newTreasury == address(0)) revert InvalidAddress();
        address previousTreasury = treasury;
        treasury = newTreasury;
        emit TreasuryUpdated(previousTreasury, newTreasury);
    }

    function updateMinter(address account, bool allowed) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (account == address(0)) revert InvalidAddress();
        if (allowed) {
            _grantRole(MINTER_ROLE, account);
        } else {
            _revokeRole(MINTER_ROLE, account);
        }
    }

    function updateBlacklist(address account, bool isBlacklisted) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (account == address(0)) revert InvalidAddress();
        blacklist[account] = isBlacklisted;
        emit BlacklistUpdated(account, isBlacklisted);
    }

    function decimals() public pure override returns (uint8) {
        return 18;
    }

    function _update(address from, address to, uint256 value) internal override(ERC20) {
        if (paused()) {
            revert("Pausable: paused");
        }
        if (from != address(0) && blacklist[from]) {
            revert BlacklistedAddress(from);
        }
        if (to != address(0) && blacklist[to]) {
            revert BlacklistedAddress(to);
        }
        super._update(from, to, value);
    }

    // Note: ERC20 v5 _burn is not virtual; burn events can be emitted at call sites if needed.

    function supportsInterface(bytes4 interfaceId) public view override(AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
