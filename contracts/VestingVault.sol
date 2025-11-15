// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title VestingVault
 * @notice Manages vesting schedules with configurable cliffs and linear vesting periods.
 */
contract VestingVault is Ownable {
    using SafeERC20 for IERC20;

    struct Schedule {
        uint256 totalAllocation;
        uint256 released;
        uint64 startTimestamp;
        uint64 cliffDuration;
        uint64 vestingDuration;
    }

    IERC20 public immutable token;

    mapping(address => Schedule) private _schedules;

    event BeneficiaryAdded(address indexed beneficiary, uint256 amount, uint256 cliff, uint256 duration);
    event TokensReleased(address indexed beneficiary, uint256 amount);

    error BeneficiaryExists();
    error InvalidParameters();
    error NothingToRelease();

    /**
     * @param tokenAddress Address of the token being vested.
     * @param owner_ Address that will own the vault.
     */
    constructor(address tokenAddress, address owner_) Ownable(owner_) {
        require(tokenAddress != address(0), "Vault: token zero");
        require(owner_ != address(0), "Vault: owner zero");
        token = IERC20(tokenAddress);
    }

    /**
     * @notice Adds a new beneficiary schedule.
     * @param beneficiary Address of the beneficiary.
     * @param amount Total amount to vest.
     * @param cliff Duration of the cliff in seconds.
     * @param duration Total vesting duration including the cliff in seconds.
     */
    function addBeneficiary(address beneficiary, uint256 amount, uint256 cliff, uint256 duration) external onlyOwner {
        if (beneficiary == address(0) || amount == 0) revert InvalidParameters();
        if (duration == 0 || duration < cliff) revert InvalidParameters();
        if (_schedules[beneficiary].totalAllocation != 0) revert BeneficiaryExists();

        _schedules[beneficiary] = Schedule({
            totalAllocation: amount,
            released: 0,
            startTimestamp: uint64(block.timestamp),
            cliffDuration: uint64(cliff),
            vestingDuration: uint64(duration)
        });

        emit BeneficiaryAdded(beneficiary, amount, cliff, duration);
    }

    /**
     * @notice Returns the schedule for a beneficiary.
     */
    function getSchedule(address beneficiary) external view returns (Schedule memory) {
        return _schedules[beneficiary];
    }

    /**
     * @notice Calculates the total vested amount for a beneficiary.
     * @param beneficiary Address to query.
     * @return Amount vested (including already withdrawn tokens).
     */
    function vestedAmount(address beneficiary) public view returns (uint256) {
        Schedule memory schedule = _schedules[beneficiary];
        if (schedule.totalAllocation == 0) {
            return 0;
        }

        uint256 start = schedule.startTimestamp;
        uint256 cliffTime = start + schedule.cliffDuration;
        uint256 end = start + schedule.vestingDuration;

        if (block.timestamp < cliffTime) {
            return 0;
        }

        if (block.timestamp >= end) {
            return schedule.totalAllocation;
        }

        uint256 vestedTime = block.timestamp - cliffTime;
        uint256 vestingPeriod = schedule.vestingDuration - schedule.cliffDuration;
        return (schedule.totalAllocation * vestedTime) / vestingPeriod;
    }

    /**
     * @notice Calculates the releasable amount for a beneficiary.
     */
    function releasableAmount(address beneficiary) public view returns (uint256) {
        Schedule memory schedule = _schedules[beneficiary];
        if (schedule.totalAllocation == 0) {
            return 0;
        }

        uint256 vested = vestedAmount(beneficiary);
        if (vested <= schedule.released) {
            return 0;
        }
        return vested - schedule.released;
    }

    /**
     * @notice Withdraws vested tokens for the caller.
     */
    function withdraw() external {
        Schedule storage schedule = _schedules[msg.sender];
        if (schedule.totalAllocation == 0) revert InvalidParameters();

        uint256 amount = releasableAmount(msg.sender);
        if (amount == 0) revert NothingToRelease();

        schedule.released += amount;
        token.safeTransfer(msg.sender, amount);

        emit TokensReleased(msg.sender, amount);
    }
}
