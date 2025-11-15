// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title Proof Of Influence Token
 * @notice ERC20 token with permit support, role based minting and pausable transfers.
 */
contract POI is ERC20, ERC20Permit, ERC20Burnable, AccessControl, Pausable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant OFFCHAIN_DISTRIBUTOR_ROLE = keccak256("OFFCHAIN_DISTRIBUTOR_ROLE");

    /**
     * @notice Initializes the token, roles and optionally mints the initial supply.
     * @param admin The address that will receive the default admin, minter and pauser roles.
     * @param initialRecipient The address that receives the initial supply if `initialSupply` is greater than zero.
     * @param initialSupply Amount of tokens to mint on deployment.
     */
    constructor(address admin, address initialRecipient, uint256 initialSupply)
        ERC20("Proof Of Influence", "POI")
        ERC20Permit("Proof Of Influence")
    {
        require(admin != address(0), "POI: admin is zero");
        require(initialRecipient != address(0), "POI: recipient is zero");

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
        _grantRole(OFFCHAIN_DISTRIBUTOR_ROLE, admin);

        if (initialSupply > 0) {
            _mint(initialRecipient, initialSupply);
        }
    }

    /**
     * @notice Mints new tokens to the given address.
     * @param account Recipient of the newly minted tokens.
     * @param amount Amount of tokens to mint.
     */
    function mint(address account, uint256 amount) external onlyRole(MINTER_ROLE) {
        _mint(account, amount);
    }

    /**
     * @notice Mints tokens that will be distributed based on off-chain purchase flows.
     * @param account Recipient of the newly minted tokens.
     * @param amount Amount of tokens to mint.
     */
    function mintForDistribution(address account, uint256 amount) external onlyRole(OFFCHAIN_DISTRIBUTOR_ROLE) {
        _mint(account, amount);
    }

    /**
     * @notice Pauses all token transfers.
     */
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /**
     * @notice Unpauses token transfers.
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /**
     * @inheritdoc ERC20
     */
    function decimals() public pure override returns (uint8) {
        return 18;
    }

    /**
     * @inheritdoc ERC20
     */
    function _update(address from, address to, uint256 value) internal override(ERC20) {
        require(!paused(), "POI: token paused");
        super._update(from, to, value);
    }

    /**
     * @inheritdoc AccessControl
     */
    function supportsInterface(bytes4 interfaceId) public view override(AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
