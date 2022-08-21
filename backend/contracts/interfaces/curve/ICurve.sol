// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

interface ICurveFi_Minter {
    function mint(address gauge_addr) external;
    function minted(address _for, address gauge_addr) external view returns(uint256);

    function toggle_approve_mint(address minting_user) external;
    function token() external view returns(address);
}

interface IYERC20 is IERC20 {
    //Y-token functions
    function deposit(uint256 amount) external;
    function withdraw(uint256 shares) external;
    function getPricePerFullShare() external view returns (uint256);

    function token() external returns(address);
}

interface ICurveFi_DepositY {
    function add_liquidity(uint256[4] calldata uamounts, uint256 min_mint_amount) external;
    function remove_liquidity(uint256 _amount, uint256[4] calldata min_uamounts) external;
    function remove_liquidity_imbalance(uint256[4] calldata uamounts, uint256 max_burn_amount) external;

    function coins(int128 i) external view returns (address);
    function underlying_coins(int128 i) external view returns (address);
    function underlying_coins() external view returns (address[4] memory);
    function curve() external view returns (address);
    function token() external view returns (address);
}

interface ICurveFi_SwapY {
    function add_liquidity(uint256[4] calldata amounts, uint256 min_mint_amount) external;
    function remove_liquidity(uint256 _amount, uint256[4] calldata min_amounts) external;
    function remove_liquidity_imbalance(uint256[4] calldata amounts, uint256 max_burn_amount) external;
    function calc_token_amount(uint256[4] calldata amounts, bool deposit) external view returns(uint256);

    function balances(int128 i) external view returns(uint256);
    function coins(int128 i) external view returns (address);
}

interface ICurveFi_Gauge {
    function lp_token() external view returns(address);
    function crv_token() external view returns(address);

    function balanceOf(address addr) external view returns (uint256);
    function deposit(uint256 _value) external;
    function withdraw(uint256 _value) external;

    function claimable_tokens(address addr) external returns (uint256);
    function minter() external view returns(address); //use minter().mint(gauge_addr) to claim CRV

    function integrate_fraction(address _for) external view returns(uint256);
    function user_checkpoint(address _for) external returns(bool);
}
