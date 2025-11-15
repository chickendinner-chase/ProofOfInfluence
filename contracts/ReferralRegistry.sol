// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ReferralRegistry
 * @notice Records inviter relationships on-chain.
 */
contract ReferralRegistry is Ownable {
    mapping(address => address) private _referrers;
    mapping(address => uint256) private _referralCounts;

    event RefBound(address indexed child, address indexed parent, uint256 timestamp);

    error InvalidReferrer();
    error ReferrerAlreadySet();

    constructor(address owner_) Ownable(owner_) {}

    /**
     * @notice Binds the caller to a referrer.
     * @param parent Address of the referrer.
     */
    function setReferrer(address parent) external {
        if (parent == address(0) || parent == msg.sender) revert InvalidReferrer();
        if (_referrers[msg.sender] != address(0)) revert ReferrerAlreadySet();

        _referrers[msg.sender] = parent;
        _referralCounts[parent] += 1;

        emit RefBound(msg.sender, parent, block.timestamp);
    }

    /**
     * @notice Returns the referrer for a child address.
     */
    function getReferrer(address child) public view returns (address) {
        return _referrers[child];
    }

    /**
     * @notice Returns the number of referrals for a parent address.
     */
    function getReferralCount(address parent) public view returns (uint256) {
        return _referralCounts[parent];
    }
}
