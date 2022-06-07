// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "./ConditionsChecker.sol";
import "./Messages.sol";
import "./interfaces/IUniswapV2Router.sol";
import "./interfaces/IUniswapV2Factory.sol";

contract ZapInScriptExecutor is ConditionsChecker {
    uint256 public GAS_LIMIT = 320000; // 0.00032 GWEI

    /* ========== HASH FUNCTIONS ========== */

    function hash(ZapIn calldata zapIn) private pure returns (bytes32) {
        bytes32 eip712DomainHash = keccak256(
            abi.encode(EIP712_DOMAIN_TYPEHASH, keccak256(bytes("Daemons-ZapIn-v01")))
        );

        bytes32 zapInHash = keccak256(
            bytes.concat(
                abi.encode(
                    ZAP_IN_TYPEHASH,
                    zapIn.scriptId,
                    zapIn.tokenA,
                    zapIn.tokenB,
                    zapIn.amountA,
                    zapIn.amountB,
                    zapIn.typeAmtA,
                    zapIn.typeAmtB,
                    zapIn.user,
                    zapIn.kontract,
                    zapIn.executor,
                    zapIn.chainId,
                    zapIn.tip
                ),
                abi.encodePacked(
                    hashBalance(zapIn.balance),
                    hashFrequency(zapIn.frequency),
                    hashPrice(zapIn.price),
                    hashRepetitions(zapIn.repetitions),
                    hashFollow(zapIn.follow)
                )
            )
        );

        return keccak256(abi.encodePacked("\x19\x01", eip712DomainHash, zapInHash));
    }

    /* ========== VERIFICATION FUNCTIONS ========== */

    function verify(
        ZapIn calldata message,
        bytes32 r,
        bytes32 s,
        uint8 v
    ) public view {
        require(message.chainId == chainId, "[CHAIN][ERROR]");
        verifyRevocation(message.user, message.scriptId);
        require(message.user == ecrecover(hash(message), v, r, s), "[SIGNATURE][FINAL]");
        require(!(message.amountA == 0 && message.amountB == 0), "[ZERO_AMOUNT][FINAL]");
        require(
            IUniswapV2Factory(IUniswapV2Router01(message.kontract).factory()).getPair(
                message.tokenA,
                message.tokenB
            ) != address(0),
            "[UNSUPPORTED_PAIR][FINAL]"
        );
        console.log("token A", message.tokenA);
        console.log("token B", message.tokenB);
        console.log("pair address", IUniswapV2Factory(IUniswapV2Router01(message.kontract).factory()).getPair(
                message.tokenA,
                message.tokenB
            ));
        verifyRepetitions(message.repetitions, message.scriptId);

        verifyFollow(message.follow, message.scriptId);
        verifyGasTank(message.user);
        verifyTip(message.tip, message.user);

        // the user balance of token A must be >= the specified amount
        uint256 minAmountA = message.typeAmtA == 0 ? message.amountA : 0;
        verifyAllowance(message.user, message.tokenA, minAmountA);
        require(
            ERC20(message.tokenA).balanceOf(message.user) >= minAmountA,
            "[SCRIPT_BALANCE][TMP]"
        );

        // the user balance of token B must be >= the specified amount
        uint256 minAmountB = message.typeAmtB == 0 ? message.amountB : 0;
        verifyAllowance(message.user, message.tokenB, minAmountB);
        require(
            ERC20(message.tokenB).balanceOf(message.user) >= minAmountB,
            "[SCRIPT_BALANCE][TMP]"
        );

        verifyFrequency(message.frequency, message.scriptId);
        verifyBalance(message.balance, message.user);
        verifyPrice(message.price);
    }

    /* ========== EXECUTION FUNCTIONS ========== */

    function execute(
        ZapIn calldata message,
        bytes32 r,
        bytes32 s,
        uint8 v
    ) external {
        verify(message, r, s, v);
        lastExecutions[message.scriptId] = block.timestamp;
        repetitionsCount[message.scriptId] += 1;

        // define how much should be zapped in the LP
        // absolute type: just return the given amount
        // percentage type: the amount represents a percentage on 10000
        uint256 amountA = message.typeAmtA == 0
            ? message.amountA
            : (IERC20(message.tokenA).balanceOf(message.user) * message.amountA) / 10000;
        uint256 amountB = message.typeAmtB == 0
            ? message.amountB
            : (IERC20(message.tokenB).balanceOf(message.user) * message.amountB) / 10000;

        approveTokenIfNeeded(message.tokenA, message.kontract, amountA);
        approveTokenIfNeeded(message.tokenB, message.kontract, amountB);

        // get the tokens from the user
        if (amountA > 0) IERC20(message.tokenA).transferFrom(message.user, address(this), amountA);
        if (amountB > 0) IERC20(message.tokenB).transferFrom(message.user, address(this), amountB);

        createLP(
            message.tokenA,
            amountA,
            message.tokenB,
            amountB,
            IUniswapV2Router01(message.kontract),
            message.user
        );

        // what about the dust?

        // reward executor
        gasTank.addReward(
            GAS_LIMIT * gasPriceFeed.lastGasPrice(),
            message.tip,
            message.user,
            _msgSender()
        );
    }

    function approveTokenIfNeeded(
        address token,
        address spender,
        uint256 amount
    ) private {
        if (IERC20(token).allowance(address(this), spender) <= amount) {
            IERC20(token).approve(spender, type(uint256).max);
        }
    }

    function createLP(
        address tokenA,
        uint256 amountA,
        address tokenB,
        uint256 amountB,
        IUniswapV2Router01 router,
        address user
    ) private {
        address[] memory pathAB = new address[](2);
        pathAB[0] = tokenA;
        pathAB[1] = tokenB;
        address[] memory pathBA = new address[](2);
        pathBA[0] = tokenB;
        pathBA[1] = tokenA;

        console.log("token A", tokenA);
        console.log("amount A", amountA);
        console.log("token B", tokenB);
        console.log("amount B", amountB);

        // get value of tokenA if converted to tokenB
        uint256 quotedAtoB = router.getAmountsOut(amountA, pathAB)[1];

        console.log("quotedAtoB", quotedAtoB);

        // sum the amounts and divide by 2
        uint256 halved = (quotedAtoB + amountB) / 2;

        console.log("halved", halved);

        // subtract amountB
        if (halved < amountB) {
            console.log("CONDITION 1. swapping B to A for ", amountB - halved);
            // if > 0 => swap that amount of B to A
            uint256 expectedAmount = router.getAmountsOut(amountB - halved, pathBA)[1];
            router.swapExactTokensForTokens(
                amountB - halved,
                expectedAmount * 99 / 100,
                pathBA,
                address(this),
                block.timestamp
            );
        } else {
            // if < 0 => swap that amount (converted in tokenA) from A to B
            uint256 amountAtoSwap = router.getAmountsOut(halved - amountB, pathBA)[1];
            console.log("CONDITION 2. swapping A to B for ", amountAtoSwap);
            router.swapExactTokensForTokens(
                amountAtoSwap,
                (halved - amountB) * 99 / 100,
                pathAB,
                address(this),
                block.timestamp
            );
        }

        console.log("adding liquidity");
        // add liquidity
        router.addLiquidity(
            tokenB,
            tokenA,
            halved,
            IERC20(tokenA).balanceOf(address(this)),
            0,
            0,
            user,
            block.timestamp
        );
    }
}
