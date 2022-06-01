//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

interface ITreasury {
    /** The percentage that will be given to the executor after the taxes on tips have been calculated */
    function TIPS_AFTER_TAXES_PERCENTAGE() external view returns (uint16);

    /** The amount of DAEM tokens left to be distributed */
    function tokensForDistribution() external view returns (uint256);

    /** Function called by the gas tank to initialize a payout to the specified user */
    function requestPayout(address user, uint256 dueFromTips) external payable;

    /** Function called by the gas tank to immediately stake the payout of the specified user */
    function stakePayout(address user, uint256 dueFromTips) external payable;

    /** Given an amount of Ethereum, calculates how many DAEM it corresponds to */
    function ethToDAEM(uint256 ethAmount) external view returns (uint256);
}
