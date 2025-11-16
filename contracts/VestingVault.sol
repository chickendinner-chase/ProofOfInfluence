// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title VestingVault
 * @notice Configurable vesting vault that supports multiple schedules per beneficiary with linear release and optional
 * revocation.
 */
contract VestingVault is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct Schedule {
        address beneficiary;
        uint256 totalAmount;
        uint256 released;
        uint64 start;
        uint64 cliff;
        uint64 duration;
        uint64 slicePeriodSeconds;
        bool revocable;
        bool revoked;
    }

    IERC20 public immutable token;
    uint256 private _scheduleCount;
    mapping(uint256 => Schedule) private _schedules;
    mapping(address => uint256[]) private _beneficiarySchedules;

    event ScheduleCreated(
        uint256 indexed scheduleId,
        address indexed beneficiary,
        uint256 totalAmount,
        uint64 start,
        uint64 cliff,
        uint64 duration,
        uint64 slicePeriod,
        bool revocable
    );
    event Released(uint256 indexed scheduleId, address indexed beneficiary, uint256 amount);
    event Revoked(uint256 indexed scheduleId, address indexed beneficiary, uint256 refundAmount);

    error InvalidSchedule();
    error NothingToRelease();
    error NotRevocable();
    error AlreadyRevoked();

    constructor(address tokenAddress, address owner_) Ownable(owner_) {
        if (tokenAddress == address(0) || owner_ == address(0)) {
            revert InvalidSchedule();
        }
        token = IERC20(tokenAddress);
    }

    function createSchedule(
        address beneficiary,
        uint256 totalAmount,
        uint64 start,
        uint64 cliff,
        uint64 duration,
        uint64 slicePeriodSeconds,
        bool revocable
    ) external onlyOwner returns (uint256 scheduleId) {
        if (beneficiary == address(0) || totalAmount == 0) revert InvalidSchedule();
        if (duration == 0 || duration < cliff) revert InvalidSchedule();
        if (slicePeriodSeconds == 0 || slicePeriodSeconds > duration) revert InvalidSchedule();

        scheduleId = ++_scheduleCount;
        _schedules[scheduleId] = Schedule({
            beneficiary: beneficiary,
            totalAmount: totalAmount,
            released: 0,
            start: start,
            cliff: cliff,
            duration: duration,
            slicePeriodSeconds: slicePeriodSeconds,
            revocable: revocable,
            revoked: false
        });

        _beneficiarySchedules[beneficiary].push(scheduleId);

        emit ScheduleCreated(scheduleId, beneficiary, totalAmount, start, cliff, duration, slicePeriodSeconds, revocable);
    }

    function getSchedule(uint256 scheduleId) external view returns (Schedule memory) {
        Schedule memory schedule = _schedules[scheduleId];
        if (schedule.beneficiary == address(0)) revert InvalidSchedule();
        return schedule;
    }

    function schedulesOf(address beneficiary) external view returns (uint256[] memory) {
        return _beneficiarySchedules[beneficiary];
    }

    function releasableAmount(uint256 scheduleId) public view returns (uint256) {
        Schedule memory schedule = _schedules[scheduleId];
        if (schedule.beneficiary == address(0)) return 0;
        if (schedule.revoked) {
            return 0;
        }
        return _vestedAmount(schedule) - schedule.released;
    }

    function release(uint256 scheduleId) external nonReentrant {
        Schedule storage schedule = _schedules[scheduleId];
        if (schedule.beneficiary == address(0) || schedule.revoked) revert InvalidSchedule();

        uint256 amount = releasableAmount(scheduleId);
        if (amount == 0) revert NothingToRelease();

        schedule.released += amount;
        token.safeTransfer(schedule.beneficiary, amount);
        emit Released(scheduleId, schedule.beneficiary, amount);
    }

    function revoke(uint256 scheduleId) external onlyOwner nonReentrant {
        Schedule storage schedule = _schedules[scheduleId];
        if (schedule.beneficiary == address(0)) revert InvalidSchedule();
        if (!schedule.revocable) revert NotRevocable();
        if (schedule.revoked) revert AlreadyRevoked();

        uint256 releasable = releasableAmount(scheduleId);
        if (releasable > 0) {
            schedule.released += releasable;
            token.safeTransfer(schedule.beneficiary, releasable);
            emit Released(scheduleId, schedule.beneficiary, releasable);
        }

        uint256 refund = schedule.totalAmount - schedule.released;
        schedule.revoked = true;

        if (refund > 0) {
            token.safeTransfer(owner(), refund);
        }

        emit Revoked(scheduleId, schedule.beneficiary, refund);
    }

    function _vestedAmount(Schedule memory schedule) internal view returns (uint256) {
        if (schedule.revoked) {
            return schedule.released;
        }
        if (block.timestamp < schedule.start + schedule.cliff) {
            return 0;
        }
        if (block.timestamp >= schedule.start + schedule.duration) {
            return schedule.totalAmount;
        }

        uint256 elapsed = block.timestamp - schedule.start;
        uint256 vestedSeconds = (elapsed / schedule.slicePeriodSeconds) * schedule.slicePeriodSeconds;
        return (schedule.totalAmount * vestedSeconds) / schedule.duration;
    }
}
