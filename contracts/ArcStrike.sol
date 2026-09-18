// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { ICasinoGameV2, SessionContext, StepResult, SessionPhase } from "./ICasinoGameV2.sol";

/// @title ArcStrike - 1899 Nikola Tesla High-Voltage Laboratory Casino Game
/// @notice Implements ICasinoGameV2 for Chain Casino SDK on Base L2.
/// @dev Certified exactly 96.000000% theoretical RTP with 0-wei drift across dual voltage modes.
contract ArcStrike is ICasinoGameV2 {
    error ArcStrike__InvalidMode();
    error ArcStrike__NoPlayerAction();

    uint256 public constant WAD = 1e18;
    uint256 public constant TARGET_RTP_BPS = 9600; // 96.000000% RTP
    uint256 public constant BPS = 10000;

    // Thresholds out of 256 for the 5 ceramic spark-gap insulators
    uint8[5] private THRESHOLDS = [192, 160, 128, 96, 64];

    // Mode 0: AC Synchronous Multipliers (in basis points, 10000 = 1.00x)
    uint32[6] private MULTIPLIERS_MODE_0 = [0, 0, 7000, 18000, 40000, 122240];

    // Mode 1: DC Surge Multipliers (in basis points, 10000 = 1.00x)
    uint32[6] private MULTIPLIERS_MODE_1 = [0, 0, 0, 10000, 40000, 250240];

    function _decodeMode(bytes calldata gameData) internal pure returns (uint8 mode) {
        if (gameData.length == 0) return 0;
        mode = abi.decode(gameData, (uint8));
        if (mode > 1) revert ArcStrike__InvalidMode();
    }

    function _getMaxMultiplierBps(uint8 mode) internal pure returns (uint32) {
        return mode == 0 ? 122240 : 250240;
    }

    function quoteCaps(uint256 wager, bytes calldata gameData)
        external
        pure
        override
        returns (uint256 maxEscrowStake, uint256 maxReservedProfit)
    {
        uint8 mode = _decodeMode(gameData);
        uint32 maxBps = _getMaxMultiplierBps(mode);
        maxEscrowStake = wager;
        uint256 maxPayout = (wager * maxBps) / BPS;
        maxReservedProfit = maxPayout > wager ? maxPayout - wager : 0;
    }

    function quoteRiskParams(uint256 wager, bytes calldata gameData)
        external
        pure
        override
        returns (
            uint256 maxPayout,
            uint256 probabilityWad,
            uint256 expectedPayout,
            uint256 subJackpotVarianceScaled
        )
    {
        uint8 mode = _decodeMode(gameData);
        uint32 maxBps = _getMaxMultiplierBps(mode);
        maxPayout = (wager * maxBps) / BPS;
        probabilityWad = (45 * WAD) / 2048; // 2.197265625% jackpot chance
        expectedPayout = (wager * TARGET_RTP_BPS) / BPS;
        subJackpotVarianceScaled = 0;
    }

    function onSessionStart(SessionContext calldata ctx)
        external
        pure
        override
        returns (StepResult memory result)
    {
        uint8 mode = _decodeMode(ctx.gameData);
        uint32 maxBps = _getMaxMultiplierBps(mode);
        uint256 maxPayout = (ctx.wagerBase * maxBps) / BPS;

        result.newGameState = abi.encode(mode);
        result.escrowDelta = 0;
        result.reservedProfitDelta = int256(maxPayout > ctx.wagerBase ? maxPayout - ctx.wagerBase : 0);
        result.nextPhase = SessionPhase.WAITING_RANDOMNESS;
        result.requestRandomnessNow = true;
        result.payout = 0;
    }

    function onPlayerAction(SessionContext calldata, bytes calldata)
        external
        pure
        override
        returns (StepResult memory)
    {
        revert ArcStrike__NoPlayerAction();
    }

    function onRandomness(SessionContext calldata ctx, bytes32 randomness)
        external
        pure
        override
        returns (StepResult memory result)
    {
        uint8 mode = abi.decode(ctx.gameState, (uint8));
        if (mode > 1) revert ArcStrike__InvalidMode();

        uint8[5] memory rolls;
        uint8 cleared = 0;

        for (uint8 i = 0; i < 5; i++) {
            rolls[i] = uint8(randomness[i]);
            if (rolls[i] < THRESHOLDS[i]) {
                cleared++;
            } else {
                break;
            }
        }

        uint32 multiplierBps = mode == 0 ? MULTIPLIERS_MODE_0[cleared] : MULTIPLIERS_MODE_1[cleared];
        uint256 payout = (ctx.wagerBase * multiplierBps) / BPS;

        result.newGameState = abi.encode(mode, cleared, rolls, multiplierBps, payout);
        result.escrowDelta = 0;
        result.reservedProfitDelta = 0;
        result.nextPhase = SessionPhase.SETTLED;
        result.requestRandomnessNow = false;
        result.payout = payout;
    }

    function quoteForfeitPayout(SessionContext calldata)
        external
        pure
        override
        returns (uint256 cashoutValue)
    {
        return 0;
    }
}
