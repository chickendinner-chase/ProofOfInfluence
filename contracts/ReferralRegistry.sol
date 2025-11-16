// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title ReferralRegistry
 * @notice Records inviter relationships and optionally streams POI rewards to inviters.
 */
contract ReferralRegistry is AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");
    bytes32 public constant REWARDER_ROLE = keccak256("REWARDER_ROLE");

    struct Referral {
        address inviter;
        bytes32 code;
        uint64 timestamp;
        bool exists;
    }

    IERC20 public rewardToken;

    mapping(address => Referral) private _referrals;
    mapping(address => uint256) public referralCounts;
    mapping(address => uint256) public totalRewardsEarned;

    event Registered(address indexed inviter, address indexed invitee, bytes32 code);
    event Rewarded(address indexed inviter, address indexed invitee, uint256 amount);
    event RewardTokenUpdated(address indexed token);

    error AlreadyRegistered();
    error InvalidInviter();
    error UnknownReferral();
    error RewardTokenNotSet();
    error InvalidAmount();

    constructor(address admin) {
        require(admin != address(0), "Registry: admin zero");
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(REGISTRAR_ROLE, admin);
        _grantRole(REWARDER_ROLE, admin);
    }

    function setRewardToken(address token) external onlyRole(DEFAULT_ADMIN_ROLE) {
        rewardToken = IERC20(token);
        emit RewardTokenUpdated(token);
    }

    function register(address inviter, address invitee, bytes32 code) external onlyRole(REGISTRAR_ROLE) {
        _register(inviter, invitee, code);
    }

    function selfRegister(address inviter, bytes32 code) external {
        _register(inviter, msg.sender, code);
    }

    function reward(address inviter, address invitee, uint256 amount) external onlyRole(REWARDER_ROLE) nonReentrant {
        if (address(rewardToken) == address(0)) revert RewardTokenNotSet();
        Referral memory referral = _referrals[invitee];
        if (!referral.exists || referral.inviter != inviter) revert UnknownReferral();
        if (amount == 0) revert InvalidAmount();

        rewardToken.safeTransfer(inviter, amount);
        totalRewardsEarned[inviter] += amount;

        emit Rewarded(inviter, invitee, amount);
    }

    function getReferral(address invitee) external view returns (Referral memory) {
        return _referrals[invitee];
    }

    function hasReferral(address invitee) external view returns (bool) {
        return _referrals[invitee].exists;
    }

    function _register(address inviter, address invitee, bytes32 code) internal {
        if (inviter == address(0) || inviter == invitee) revert InvalidInviter();
        if (_referrals[invitee].exists) revert AlreadyRegistered();

        _referrals[invitee] = Referral({
            inviter: inviter,
            code: code,
            timestamp: uint64(block.timestamp),
            exists: true
        });
        referralCounts[inviter] += 1;

        emit Registered(inviter, invitee, code);
    }

    function supportsInterface(bytes4 interfaceId) public view override(AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
