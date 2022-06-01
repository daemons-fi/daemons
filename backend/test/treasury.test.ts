import { BaseProvider } from "@ethersproject/providers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import chaiAlmost from "chai-almost";
import { BigNumber, Contract } from "ethers";
import { ethers, network } from "hardhat";
const chai = require("chai");

describe("Treasury", function () {
    let snapshotId: string;

    let provider: BaseProvider;
    let owner: SignerWithAddress;
    let user1: SignerWithAddress;
    let gasTank: SignerWithAddress;
    let treasury: Contract;
    let fooToken: Contract;

    this.beforeEach(async () => {
        if (snapshotId) await network.provider.send("evm_revert", [snapshotId]);

        // save snapshot (needed because we advance/reset time)
        snapshotId = await network.provider.send("evm_snapshot", []);

        // get the default provider
        provider = ethers.provider;

        // get some wallets
        [owner, user1, gasTank] = await ethers.getSigners();

        // Token contracts
        const FooTokenContract = await ethers.getContractFactory("MockToken");
        fooToken = await FooTokenContract.deploy("Foo Token", "FOO");

        // Mock router contract
        const MockRouterContract = await ethers.getContractFactory("MockRouter");
        const mockRouter = await MockRouterContract.deploy();

        // Treasury contract
        const TreasuryContract = await ethers.getContractFactory("Treasury");
        treasury = await TreasuryContract.deploy(
            fooToken.address,
            gasTank.address,
            mockRouter.address
        );

        // add some tokens to treasury
        fooToken.mint(treasury.address, ethers.utils.parseEther("100"));
    });

    this.afterEach(async () => {
        // restore from snapshot
        await network.provider.send("evm_revert", [snapshotId]);
    });

    describe("Owner controlled setters", function () {
        it("can change commission percentage", async () => {
            // initially commission is set to 1%
            expect(await treasury.PERCENTAGE_COMMISSION()).to.equal(100);

            // owner can change it
            await treasury.setCommissionPercentage(50);
            expect(await treasury.PERCENTAGE_COMMISSION()).to.equal(50);

            // anyone else cannot
            await expect(treasury.connect(user1).setCommissionPercentage(150)).to.be.revertedWith(
                "Ownable: caller is not the owner"
            );
        });

        it("throws an error if trying to set commission percentage outside bounds", async () => {
            // too high commission
            await expect(treasury.setCommissionPercentage(1500)).to.be.revertedWith(
                "Commission must be at most 5%"
            );
        });

        it("can change protocol owned liquidity (POL) percentage", async () => {
            // initially POL percentage is set to 49%
            expect(await treasury.PERCENTAGE_POL()).to.equal(4900);

            // owner can change it
            await treasury.setPolPercentage(3000);
            expect(await treasury.PERCENTAGE_POL()).to.equal(3000);

            // anyone else cannot
            await expect(treasury.connect(user1).setPolPercentage(2500)).to.be.revertedWith(
                "Ownable: caller is not the owner"
            );
        });

        it("throws an error if trying to set POL percentage outside bounds", async () => {
            // too high pol percentage
            await expect(treasury.setPolPercentage(8000)).to.be.revertedWith(
                "POL must be at most 50%"
            );

            // too low pol percentage
            await expect(treasury.setPolPercentage(50)).to.be.revertedWith(
                "POL must be at least 5%"
            );
        });

        it("can change redistribution interval", async () => {
            // initially redistributionInterval is set to 180 days (15552000 seconds)
            expect(await treasury.redistributionInterval()).to.equal(15552000);

            // owner can change it (setting to 365 days)
            await treasury.setRedistributionInterval(31536000);
            expect(await treasury.redistributionInterval()).to.equal(31536000);

            // anyone else cannot
            await expect(
                treasury.connect(user1).setRedistributionInterval(15552000)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("throws an error if trying to set redistribution interval outside bounds", async () => {
            // too high redistribution interval (setting 731 days)
            await expect(treasury.setRedistributionInterval(63158400)).to.be.revertedWith(
                "RI must be at most 730 days"
            );

            // too low redistribution interval (setting 29 days)
            await expect(treasury.setRedistributionInterval(2505600)).to.be.revertedWith(
                "RI must be at least 30 days"
            );
        });
    });

    describe("Rewards payouts requests", function () {
        it("only gas tank can initialize payout requests", async () => {
            const amountEth = ethers.utils.parseEther("1.0");
            const amountTip = ethers.utils.parseEther("1.0");

            await expect(
                treasury.requestPayout(user1.address, amountTip, { value: amountEth })
            ).to.be.revertedWith("Unauthorized. Only GasTank");
        });

        it("payout causes tokens to be sent to the user", async () => {
            const amountEth = ethers.utils.parseEther("1.0");
            const amountTip = ethers.utils.parseEther("1.0");

            await treasury
                .connect(gasTank)
                .requestPayout(user1.address, amountTip, { value: amountEth });

            // treasury got the eth
            expect(await provider.getBalance(treasury.address)).to.equal(amountEth);

            // user got the token
            const expectedAmount = ethers.utils.parseEther("1.8"); // 1.0 from reward, 0.8 from tip (20% tax)
            expect(await fooToken.balanceOf(user1.address)).to.equal(expectedAmount);
        });

        it("payout causes ETH to be distributed into pools accordingly", async () => {
            const amountEth = ethers.utils.parseEther("1.0");
            const amountTip = ethers.utils.parseEther("1.0");

            await treasury
                .connect(gasTank)
                .requestPayout(user1.address, amountTip, { value: amountEth });

            // 1% commission, 49% POL, 50% redistribution
            expect(await treasury.commissionsPool()).to.equal(ethers.utils.parseEther("0.01"));
            expect(await treasury.polPool()).to.equal(ethers.utils.parseEther("0.49"));
            expect(await treasury.redistributionPool()).to.equal(ethers.utils.parseEther("0.50"));
        });
    });

    describe("Staking payouts requests", function () {
        it("only gas tank can initialize staking payout requests", async () => {
            const amountEth = ethers.utils.parseEther("1.0");
            const amountTip = ethers.utils.parseEther("1.0");

            await expect(
                treasury.stakePayout(user1.address, amountTip, { value: amountEth })
            ).to.be.revertedWith("Unauthorized. Only GasTank");
        });

        it("staking payout causes tokens to staked on behalf of the user", async () => {
            const amountEth = ethers.utils.parseEther("1.0");
            const amountTip = ethers.utils.parseEther("1.0");

            await treasury
                .connect(gasTank)
                .stakePayout(user1.address, amountTip, { value: amountEth });

            // treasury got the eth
            expect(await provider.getBalance(treasury.address)).to.equal(amountEth);

            // and user got the tokens staked into the treasury
            const expectedAmount = ethers.utils.parseEther("1.8"); // 1.0 from reward, 0.8 from tip (20% tax)
            expect(await treasury.balanceOf(user1.address)).to.equal(expectedAmount);
        });

        it("staking payout causes ETH to be distributed into pools accordingly", async () => {
            const amountEth = ethers.utils.parseEther("1.0");
            const amountTip = ethers.utils.parseEther("1.0");

            await treasury
                .connect(gasTank)
                .stakePayout(user1.address, amountTip, { value: amountEth });

            // 1% commission, 49% POL, 50% redistribution
            expect(await treasury.commissionsPool()).to.equal(ethers.utils.parseEther("0.01"));
            expect(await treasury.polPool()).to.equal(ethers.utils.parseEther("0.49"));
            expect(await treasury.redistributionPool()).to.equal(ethers.utils.parseEther("0.50"));
        });

        it("staking payout doesn't change treasury balance", async () => {
            const initialTreasuryBalance = await fooToken.balanceOf(treasury.address);
            const initialAmountOfTokensToDistribute = await treasury.tokensForDistribution();

            const amountEth = ethers.utils.parseEther("1.0");
            const amountTip = ethers.utils.parseEther("1.0");
            await treasury
                .connect(gasTank)
                .stakePayout(user1.address, amountTip, { value: amountEth });

            const finalTreasuryBalance = await fooToken.balanceOf(treasury.address);
            const finalAmountOfTokensToDistribute = await treasury.tokensForDistribution();

            // balance will be the same
            expect(initialTreasuryBalance).to.be.equal(finalTreasuryBalance);

            // while the amount of tokens to be distributed will have decreased
            expect(initialAmountOfTokensToDistribute).to.not.be.equal(
                finalAmountOfTokensToDistribute
            );
        });
    });

    describe("Staking", function () {
        const now = () => Math.floor(new Date().getTime() / 1000);
        const oneDay = 60 * 60 * 24;

        it("the user cannot stake funds they don't own", async () => {
            // give allowance to treasury contract
            await fooToken.approve(treasury.address, ethers.utils.parseEther("500"));

            const amount = ethers.utils.parseEther("1.0");
            await expect(treasury.stake(amount)).to.be.revertedWith(
                "ERC20: transfer amount exceeds balance"
            );

            await expect(treasury.stake(0)).to.be.revertedWith("Cannot stake 0");
        });

        it("the user cannot withdraw funds they don't own", async () => {
            const amount = ethers.utils.parseEther("1.0");
            await expect(treasury.withdraw(amount)).to.be.revertedWith("Insufficient staked funds");

            await expect(treasury.withdraw(0)).to.be.revertedWith("Cannot withdraw 0");
        });

        it("is not possible to withdraw ALL funds from the treasury", async () => {
            // stake payout for user1 and wait some time
            const amountEth = ethers.utils.parseEther("1.0");
            const zero = ethers.utils.parseEther("0");
            await treasury
                .connect(gasTank)
                .stakePayout(user1.address, zero, { value: amountEth });

            await network.provider.send("evm_setNextBlockTimestamp", [now() + 60]);
            await network.provider.send("evm_mine");

            // withdraw all
            await expect(treasury.connect(user1).withdraw(amountEth)).to.be.revertedWith(
                "Cannot withdraw all funds"
            );
        });

        it("user balance is updated after staking and withdrawing", async () => {
            // add 1 ETH that will stay in the treasury
            const zero = ethers.utils.parseEther("0");
            await treasury.connect(gasTank).stakePayout(owner.address, zero, { value: 1 });

            // give some tokens to a user
            const amount = ethers.utils.parseEther("1.0");
            fooToken.mint(user1.address, amount);

            // give allowance to treasury contract
            await fooToken.connect(user1).approve(treasury.address, ethers.utils.parseEther("500"));

            // verify balances are updated when user stakes DAEM
            await treasury.connect(user1).stake(amount);
            expect(await treasury.balanceOf(user1.address)).to.equal(amount);
            expect(await fooToken.balanceOf(user1.address)).to.equal(zero);

            // verify balances are updated when user withdraws DAEM
            await treasury.connect(user1).withdraw(amount);
            expect(await fooToken.balanceOf(user1.address)).to.equal(amount);
            expect(await treasury.balanceOf(user1.address)).to.equal(zero);
        });

        it("reward rate depends on the amount of ETH in the treasury and redistributionInterval", async () => {
          const amountEth = ethers.utils.parseEther("1.0");
          const zero = ethers.utils.parseEther("0");
          await treasury
              .connect(gasTank)
              .stakePayout(user1.address, zero, { value: amountEth });

            const rewardRate = await treasury.getRewardRate();
            const redistributionPool = await treasury.redistributionPool(); // 50% of 1ETH
            const expectedRate = redistributionPool.div(15552000); //0.5 / 180 Days
            expect(rewardRate).to.be.equal(expectedRate);

            // try again, the reward rate should be doubled
            await treasury.connect(gasTank).requestPayout(user1.address, zero, { value: amountEth });
            expect(await treasury.getRewardRate()).to.be.equal(expectedRate.mul(2));
        });

        it("reward is accumulated over time", async () => {
            // stake payout for user1.
            const amountEth = ethers.utils.parseEther("1.0");
            const zero = ethers.utils.parseEther("0");
            await treasury
                .connect(gasTank)
                .stakePayout(user1.address, zero, { value: amountEth });

            // current state: 0.5ETH are in the redistribution pool and 1 DAEM staked for the user
            expect(await treasury.redistributionPool()).to.be.equal(ethers.utils.parseEther("0.5"));
            expect(await treasury.balanceOf(user1.address)).to.be.equal(
                ethers.utils.parseEther("1")
            );

            // claimable amount at this time is 0
            expect(await treasury.earned(user1.address)).to.be.equal(ethers.utils.parseEther("0"));

            // but after some time...
            await network.provider.send("evm_setNextBlockTimestamp", [now() + oneDay]);
            await network.provider.send("evm_mine");

            // It should increase (by rewardRate * seconds elapsed)
            const rewardRate = await treasury.getRewardRate();
            const expectedReward = rewardRate.mul(oneDay - 1);

            chai.use(chaiAlmost(rewardRate.toNumber() * 2)); // We might be a few seconds off
            const earnedReward: BigNumber = await treasury.earned(user1.address);
            expect(earnedReward.sub(expectedReward).abs().toNumber()).to.be.almost.equal(0);
        });

        it("reward zeroed after claiming", async () => {
            // stake payout for user1 and wait some time
            const amountEth = ethers.utils.parseEther("1.0");
            const zero = ethers.utils.parseEther("0");
            await treasury
                .connect(gasTank)
                .stakePayout(user1.address, zero, { value: amountEth });

            await network.provider.send("evm_setNextBlockTimestamp", [now() + oneDay]);
            await network.provider.send("evm_mine");

            // from previous test, we know that after 1 day the reward is
            // (almost) equal to 2777713477338878
            chai.use(chaiAlmost(32150205761 * 2));
            const earnedReward: BigNumber = await treasury.earned(user1.address);
            expect(earnedReward.sub("2777713477338878").abs().toNumber()).to.be.almost.equal(0);

            // let's claim the reward
            const balanceBefore = await provider.getBalance(user1.address);
            await treasury.connect(user1).getReward();

            // it should have been sent to the user (that also spent gas, so we cannot
            // measure the balance precisely and we'll just check it has increased)
            const balanceAfter = await provider.getBalance(user1.address);
            expect(balanceAfter.sub(balanceBefore).gt(0)).to.be.true;

            // and the treasury counter should have been zeroed
            const earnedRewardAfterClaim: BigNumber = await treasury.earned(user1.address);
            expect(earnedRewardAfterClaim.toNumber()).to.be.almost.equal(0);
        });

        it("rewards are accounted each time are claimed", async () => {
            // stake payout for user1 and wait some time
            const amountEth = ethers.utils.parseEther("1.0");
            const zero = ethers.utils.parseEther("0");
            await treasury
                .connect(gasTank)
                .stakePayout(user1.address, zero, { value: amountEth });

            await network.provider.send("evm_setNextBlockTimestamp", [now() + oneDay]);
            await network.provider.send("evm_mine");

            // from previous test, we know that after 1 day the reward is
            // (almost) equal to 2777713477338878
            chai.use(chaiAlmost(32150205761 * 2));
            const earnedReward: BigNumber = await treasury.earned(user1.address);
            expect(earnedReward.sub("2777713477338878").abs().toNumber()).to.be.almost.equal(0);

            // let's claim the reward
            await treasury.connect(user1).getReward();

            // the 'distributed' variable should have been increased;
            const distributed: BigNumber = await treasury.distributed();
            expect(distributed.sub("2777713477338878").abs().toNumber()).to.be.almost.equal(0);
        });

        it("exit function gets both reward and staked amount", async () => {
            // add 1 DAEM that will stay in the treasury
            await treasury.connect(gasTank).stakePayout(owner.address, 0, { value: 1 });

            // stake payout for user1 and wait some time
            const amount = ethers.utils.parseEther("1.0");
            await treasury.connect(gasTank).stakePayout(user1.address, 0, { value: amount });
            await network.provider.send("evm_setNextBlockTimestamp", [now() + oneDay]);
            await network.provider.send("evm_mine");

            // from previous test, we know that after 1 day the reward is
            // (almost) equal to 2777713477338878
            chai.use(chaiAlmost(32150205761 * 3));
            const earnedReward: BigNumber = await treasury.earned(user1.address);
            expect(earnedReward.sub("2777713477338878").abs().toNumber()).to.be.almost.equal(0);

            // let's exit
            const balanceBefore = await provider.getBalance(user1.address);
            await treasury.connect(user1).exit();

            // ETH has been sent to the user
            const balanceAfter = await provider.getBalance(user1.address);
            expect(balanceAfter.sub(balanceBefore).gt(0)).to.be.true;

            // As well as the token
            const userTokenBalance = await fooToken.balanceOf(user1.address);
            expect(userTokenBalance).to.be.equal(ethers.utils.parseEther("1.0"));

            // and the balance of the user in the treasury has been zeroed
            const userStakedAmount: BigNumber = await treasury.balanceOf(user1.address);
            expect(userStakedAmount.toNumber()).to.be.almost.equal(0);
        });

        it("user can stake and unstake", async () => {
            await treasury.connect(gasTank).stakePayout(owner.address, 0, { value: 1 });

            // stake payout for user1 and wait some time
            const amount = ethers.utils.parseEther("1.0");
            await treasury.connect(gasTank).stakePayout(user1.address, 0, { value: amount });
            await network.provider.send("evm_setNextBlockTimestamp", [now() + 60]);
            await network.provider.send("evm_mine");

            const half = ethers.utils.parseEther("0.5");
            const zero = ethers.utils.parseEther("0");

            // withdraw all
            await treasury.connect(user1).withdraw(amount);
            expect(await fooToken.balanceOf(user1.address)).to.be.equal(amount);
            expect(await treasury.balanceOf(user1.address)).to.be.equal(zero);

            // re-stake again
            await fooToken.connect(user1).approve(treasury.address, ethers.utils.parseEther("500"));
            await treasury.connect(user1).stake(ethers.utils.parseEther("1.0"));
            expect(await fooToken.balanceOf(user1.address)).to.be.equal(zero);
            expect(await treasury.balanceOf(user1.address)).to.be.equal(amount);

            // claim
            await treasury.connect(user1).getReward();
            expect(await treasury.earned(user1.address)).to.be.equal(zero);

            // withdraw half
            await treasury.connect(user1).withdraw(half);
            expect(await fooToken.balanceOf(user1.address)).to.be.equal(half);
            expect(await treasury.balanceOf(user1.address)).to.be.equal(half);

            // withdraw the other half
            await treasury.connect(user1).withdraw(half);
            expect(await fooToken.balanceOf(user1.address)).to.be.equal(amount);
            expect(await treasury.balanceOf(user1.address)).to.be.equal(zero);
        });
    });

    describe("Commissions", function () {
        it("owner can withdraw commission from the pool", async () => {
            const ownerInitialBalance = await provider.getBalance(owner.address);

            const amountEth = ethers.utils.parseEther("1.0");
            const zero = ethers.utils.parseEther("0");
            await treasury.connect(gasTank).requestPayout(user1.address, zero, { value: amountEth });

            // anyone else will cause error
            await expect(treasury.connect(user1).claimCommission()).to.be.revertedWith(
                "Ownable: caller is not the owner"
            );
            expect(await treasury.commissionsPool()).to.equal(ethers.utils.parseEther("0.01"));

            // but owner can claim commission
            await treasury.connect(owner).claimCommission();

            // commission pool is emptied
            expect(await treasury.commissionsPool()).to.equal(ethers.utils.parseEther("0"));

            // ETH is in user wallet (as the user pays for gas,
            // we just check they have more than what they started with)
            const ownerFinalBalance = await provider.getBalance(owner.address);
            expect(ownerFinalBalance.gt(ownerInitialBalance)).to.be.true;
        });
    });

    describe("Protocol Owned Liquidity", function () {
        it("LP creation can only be executed by admin", async () => {
            await expect(treasury.connect(user1).createLP()).to.be.revertedWith(
                "Ownable: caller is not the owner"
            );
        });

        it("LP funding can only be executed by admin", async () => {
            await expect(treasury.connect(user1).fundLP()).to.be.revertedWith(
                "Ownable: caller is not the owner"
            );
        });

        it("LP creation can only be executed once", async () => {
            // send some ETH to the treasury for the LP
            const ETHamount = ethers.utils.parseEther("1.0");
            await owner.sendTransaction({ to: treasury.address, value: ETHamount });

            await treasury.connect(owner).createLP();
            await expect(treasury.connect(owner).createLP()).to.be.revertedWith(
                "PoL already initialized"
            );
        });

        it("LP creation uses all the ETH in the treasury + an equal amount of DAEM", async () => {
            // send some ETH to the treasury for the LP
            const ETHamount = ethers.utils.parseEther("1.0");
            await owner.sendTransaction({ to: treasury.address, value: ETHamount });
            expect(await provider.getBalance(treasury.address)).to.equal(ETHamount);

            await treasury.connect(owner).createLP();
            expect(await provider.getBalance(treasury.address)).to.equal(
                ethers.utils.parseEther("0")
            );
            // as we use a mock we can only verify the ETH
        });

        it("LP funding cannot be used before of LP creation", async () => {
            await expect(treasury.connect(owner).fundLP()).to.be.revertedWith(
                "PoL not initialized yet"
            );
        });

        it("LP funding uses all the ETH in the polPool + a proportional amount of DAEM", async () => {
            const OneEth = ethers.utils.parseEther("1.0");

            // send some ETH and initialize the LP
            await owner.sendTransaction({ to: treasury.address, value: OneEth });
            await treasury.connect(owner).createLP();

            // add funds to the polPool by having the gasTank faking a payout
            const zero = ethers.utils.parseEther("0");
            await treasury.connect(gasTank).stakePayout(user1.address, zero, { value: OneEth });
            expect(await treasury.polPool()).to.equal(ethers.utils.parseEther("0.49"));

            // fund the LP and verify polPool has been emptied
            await treasury.connect(owner).fundLP();
            expect(await treasury.polPool()).to.equal(ethers.utils.parseEther("0"));
        });
    });
});
