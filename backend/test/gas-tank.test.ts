import { BaseProvider } from "@ethersproject/providers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";

describe("GasTank", function () {
    let provider: BaseProvider;
    let owner: SignerWithAddress;
    let user1: SignerWithAddress;
    let user2: SignerWithAddress;
    let gasTank: Contract;
    let treasury: Contract;
    let fooToken: Contract;

    this.beforeEach(async () => {
        // get the default provider
        provider = ethers.provider;

        // get some wallets
        [owner, user1, user2] = await ethers.getSigners();

        // Token contracts
        const FooTokenContract = await ethers.getContractFactory("MockToken");
        fooToken = await FooTokenContract.deploy("Foo Token", "FOO");

        // GasTank contract
        const GasTankContract = await ethers.getContractFactory("GasTank");
        gasTank = await GasTankContract.deploy();

        // Mock router contract
        const MockRouterContract = await ethers.getContractFactory("MockUniswapV2Router");
        const mockRouter = await MockRouterContract.deploy();

        // Treasury contract
        const TreasuryContract = await ethers.getContractFactory("Treasury");
        treasury = await TreasuryContract.deploy(
            fooToken.address,
            gasTank.address,
            mockRouter.address
        );

        // add some tokens to treasury and users
        fooToken.mint(treasury.address, ethers.utils.parseEther("100"));
        fooToken.mint(owner.address, ethers.utils.parseEther("100"));
        fooToken.mint(user1.address, ethers.utils.parseEther("110"));

        // create token LP
        const ethAmount = ethers.utils.parseEther("5");
        const daemAmount = ethers.utils.parseEther("10");
        await treasury.createLP(daemAmount, {value: ethAmount});

        // have the users give the allowance to the gasTank
        fooToken.connect(owner).approve(gasTank.address, ethers.utils.parseEther("500"));
        fooToken.connect(user1).approve(gasTank.address, ethers.utils.parseEther("500"));

        // set gasTank dependencies
        await gasTank.setTreasury(treasury.address);
        await gasTank.addExecutor(owner.address);
        await gasTank.setDAEMToken(fooToken.address);

        // check that everything has been set correctly
        await gasTank.preliminaryCheck();
        await treasury.preliminaryCheck();
    });

    describe("GAS Withdrawals and Deposits", function () {
        it("accepts deposits and shows correct balance", async () => {
            // deposit 1 eth into the gas tank
            const oneEth = ethers.utils.parseEther("1.0");
            await gasTank.depositGas({ value: oneEth });

            // the user balance in the gas tank should be 1 eth
            const userBalanceInTank = await gasTank.gasBalanceOf(owner.address);
            expect(userBalanceInTank).to.equal(oneEth);

            // the total balance of the gas tank should also be 1 eth
            const tankTotalBalance = await provider.getBalance(gasTank.address);
            expect(tankTotalBalance).to.equal(oneEth);
        });

        it("allows users to withdraw funds", async () => {
            const oneEth = ethers.utils.parseEther("1.0");
            await gasTank.depositGas({ value: oneEth });

            const oThreeEth = ethers.utils.parseEther("0.3");
            await gasTank.withdrawGas(oThreeEth);

            // the user balance should have been updated
            const userBalanceInTank = await gasTank.gasBalanceOf(owner.address);
            expect(userBalanceInTank).to.equal(ethers.utils.parseEther("0.7"));

            // same for the total balance of the tank
            const tankTotalBalance = await provider.getBalance(gasTank.address);
            expect(tankTotalBalance).to.equal(ethers.utils.parseEther("0.7"));
        });

        it("allows users to withdraw everything", async () => {
            const oneEth = ethers.utils.parseEther("1.0");
            await gasTank.depositGas({ value: oneEth });

            await gasTank.withdrawAllGas();

            // the user balance should have been updated
            const userBalanceInTank = await gasTank.gasBalanceOf(owner.address);
            expect(userBalanceInTank).to.equal(ethers.utils.parseEther("0"));

            // same for the total balance of the tank
            const tankTotalBalance = await provider.getBalance(gasTank.address);
            expect(tankTotalBalance).to.equal(ethers.utils.parseEther("0"));
        });
    });

    describe("TIP Withdrawals and Deposits", function () {
        it("accepts deposits and shows correct balance", async () => {
            // deposit 1 eth into the gas tank
            const oneDAEM = ethers.utils.parseEther("1.0");
            await gasTank.depositTip(oneDAEM);

            // the user balance in the tip jar should be 1 DAEM
            const userBalanceInTank = await gasTank.tipBalanceOf(owner.address);
            expect(userBalanceInTank).to.equal(oneDAEM);

            // the total balance of the gas tank should also be 1 DAEM
            const tankTotalBalance = await fooToken.balanceOf(gasTank.address);
            expect(tankTotalBalance).to.equal(oneDAEM);
        });

        it("allows users to withdraw funds", async () => {
            const oneDAEM = ethers.utils.parseEther("1.0");
            await gasTank.depositTip(oneDAEM);

            const oThreeDAEM = ethers.utils.parseEther("0.3");
            await gasTank.withdrawTip(oThreeDAEM);

            // the user balance should have been updated
            const userBalanceInTank = await gasTank.tipBalanceOf(owner.address);
            expect(userBalanceInTank).to.equal(ethers.utils.parseEther("0.7"));

            // same for the total balance of the tank
            const tankTotalBalance = await fooToken.balanceOf(gasTank.address);
            expect(tankTotalBalance).to.equal(ethers.utils.parseEther("0.7"));
        });

        it("allows users to withdraw everything", async () => {
            const oneDAEM = ethers.utils.parseEther("1.0");
            await gasTank.depositTip(oneDAEM);

            await gasTank.withdrawAllTip();

            // the user balance should have been updated
            const userBalanceInTank = await gasTank.tipBalanceOf(owner.address);
            expect(userBalanceInTank).to.equal(ethers.utils.parseEther("0"));

            // same for the total balance of the tank
            const tankTotalBalance = await fooToken.balanceOf(gasTank.address);
            expect(tankTotalBalance).to.equal(ethers.utils.parseEther("0"));
        });
    });

    describe("Rewards and Claims (no tips included)", function () {
        it("allows executors to add rewards", async () => {
            // USER1 deposits 1 eth into the gas tank
            const oneEth = ethers.utils.parseEther("1.0");
            const zeroTip = ethers.utils.parseEther("0");
            await gasTank.connect(user1).depositGas({ value: oneEth });

            // the user balance in the gas tank should be 1 eth
            const userBalanceInTank = await gasTank.gasBalanceOf(user1.address);
            expect(userBalanceInTank).to.equal(oneEth);

            // owner (impersonating the executor contract) adds a reward for user2
            const rewardAmount = ethers.utils.parseEther("0.05");
            await gasTank
                .connect(owner)
                .addReward(rewardAmount, zeroTip, user1.address, user2.address);

            // balances should have been updated
            expect(await gasTank.claimable(user2.address)).to.equal(rewardAmount);
            expect(await gasTank.gasBalanceOf(user1.address)).to.equal(oneEth.sub(rewardAmount));
        });

        it("revert if non executors try to add a reward", async () => {
            // remove executor so it'll revert the tx
            await gasTank.removeExecutor(owner.address);

            const oneEth = ethers.utils.parseEther("1.0");
            const zeroTip = ethers.utils.parseEther("0");
            const rewardAmount = ethers.utils.parseEther("0.05");
            await gasTank.connect(user1).depositGas({ value: oneEth });

            // this will revert as owner is not marked as executor anymore
            await expect(
                gasTank
                    .connect(owner)
                    .addReward(rewardAmount, zeroTip, user1.address, user2.address)
            ).to.be.revertedWith("Unauthorized. Only Executors");
        });

        it("when claiming reward, ETH will be sent to treasury", async () => {
            // user 1: 0.95ETH as balance, user 2: 0.05ETH as claimable
            const oneEth = ethers.utils.parseEther("1.0");
            const zeroTip = ethers.utils.parseEther("0");
            const rewardAmount = ethers.utils.parseEther("0.05");
            await gasTank.connect(user1).depositGas({ value: oneEth });
            await gasTank
                .connect(owner)
                .addReward(rewardAmount, zeroTip, user1.address, user2.address);

            // user 2 claim their reward
            await gasTank.connect(user2).claimReward();

            // treasury received the funds
            const treasuryTotalBalance = await provider.getBalance(treasury.address);
            expect(treasuryTotalBalance).to.equal(rewardAmount);

            // claimable amount is now 0
            expect((await gasTank.claimable(user2.address)).toNumber()).to.equal(0);

            // user2 received some tokens (ETH:DAEM are converted 1:1)
            const expectedReward = rewardAmount;
            expect(await fooToken.balanceOf(user2.address)).to.equal(expectedReward);
        });

        it("when staking reward, ETH will be sent to treasury", async () => {
            // user 1: 0.95ETH as balance, user 2: 0.05ETH as claimable
            const oneEth = ethers.utils.parseEther("1.0");
            const zeroTip = ethers.utils.parseEther("0");
            const rewardAmount = ethers.utils.parseEther("0.05");
            await gasTank.connect(user1).depositGas({ value: oneEth });
            await gasTank
                .connect(owner)
                .addReward(rewardAmount, zeroTip, user1.address, user2.address);

            // user 2 claim AND STAKE their reward
            await gasTank.connect(user2).claimAndStakeReward();

            // treasury received the funds
            const treasuryTotalBalance = await provider.getBalance(treasury.address);
            expect(treasuryTotalBalance).to.equal(rewardAmount);

            // claimable amount is now 0
            expect((await gasTank.claimable(user2.address)).toNumber()).to.equal(0);

            // user2 did *NOT* receive tokens (ETH:DAEM are converted 1:1)
            const expectedReward = rewardAmount;
            expect(await fooToken.balanceOf(user2.address)).to.equal(BigNumber.from(0));

            // instead the funds are added to the user's balance of the treasury
            expect(await treasury.balanceOf(user2.address)).to.equal(expectedReward);
        });
    });

    describe("Rewards and Claims (WITH tips)", function () {
        it("allows executors to add rewards with tips", async () => {
            // USER1 deposits 1 eth into the gas tank and tip jar
            const oneEth = ethers.utils.parseEther("1.0");
            const oneDAEMTip = ethers.utils.parseEther("1.0");
            await gasTank.connect(user1).depositGas({ value: oneEth });
            await gasTank.connect(user1).depositTip(oneDAEMTip);

            // the user balance in the gas tank should be 1 eth
            const userBalanceInTank = await gasTank.gasBalanceOf(user1.address);
            expect(userBalanceInTank).to.equal(oneEth);

            // owner (impersonating the executor contract) adds a reward for user2
            const rewardAmount = ethers.utils.parseEther("0.05");
            const tipAmount = ethers.utils.parseEther("0.5"); // 0.5 DAEM
            await gasTank
                .connect(owner)
                .addReward(rewardAmount, tipAmount, user1.address, user2.address);

            // balances should have been updated
            const tipForExecutor = ethers.utils.parseEther("0.4"); // 80% of full tip
            const claimable = rewardAmount.add(tipForExecutor);
            expect(await gasTank.claimable(user2.address)).to.equal(claimable);
            expect(await gasTank.tipBalanceOf(user1.address)).to.equal(oneEth.sub(tipAmount));
        });

        it("when adding reward, DAEM tip will be sent to treasury", async () => {
            const oneEth = ethers.utils.parseEther("1.0");
            const oneDAEMTip = ethers.utils.parseEther("1.0");
            const rewardAmount = ethers.utils.parseEther("0.05");
            const tipAmount = ethers.utils.parseEther("0.5"); // 0.5 DAEM
            await gasTank.connect(user1).depositGas({ value: oneEth });
            await gasTank.connect(user1).depositTip(oneDAEMTip);
            const DAEMBalanceBeforeReward = await fooToken.balanceOf(treasury.address);

            await gasTank
                .connect(owner)
                .addReward(rewardAmount, tipAmount, user1.address, user2.address);

            const DAEMBalanceAfterReward = await fooToken.balanceOf(treasury.address);
            const difference = DAEMBalanceAfterReward.sub(DAEMBalanceBeforeReward);
            expect(difference).to.equal(tipAmount);
        });

        it("when claiming reward, DAEM tip is sent to user", async () => {
            const oneEth = ethers.utils.parseEther("1.0");
            const oneDAEMTip = ethers.utils.parseEther("1.0");
            const rewardAmount = ethers.utils.parseEther("0.05");
            const tipAmount = ethers.utils.parseEther("0.5"); // 0.5 DAEM
            await gasTank.connect(user1).depositGas({ value: oneEth });
            await gasTank.connect(user1).depositTip(oneDAEMTip);
            await gasTank
                .connect(owner)
                .addReward(rewardAmount, tipAmount, user1.address, user2.address);

            const DAEMBalanceBeforeClaiming = await fooToken.balanceOf(treasury.address);

            // user 2 claim their reward
            await gasTank.connect(user2).claimReward();

            // check how much has been sent by verifying the treasury DAEM balance
            const DAEMBalanceAfterClaiming = await fooToken.balanceOf(treasury.address);
            const difference = DAEMBalanceBeforeClaiming.sub(DAEMBalanceAfterClaiming);
            const expectedSentToUser = ethers.utils.parseEther("0.45"); // 0.4 from tip + 0.05 from reward
            expect(difference).to.equal(expectedSentToUser);

            // claimable amount is now 0
            expect((await gasTank.claimable(user2.address)).toNumber()).to.equal(0);
        });

        it("when staking reward, DAEM is staked to treasury", async () => {
            const oneEth = ethers.utils.parseEther("1.0");
            const oneDAEMTip = ethers.utils.parseEther("1.0");
            const rewardAmount = ethers.utils.parseEther("0.05");
            const tipAmount = ethers.utils.parseEther("0.5"); // 0.5 DAEM
            await gasTank.connect(user1).depositGas({ value: oneEth });
            await gasTank.connect(user1).depositTip(oneDAEMTip);
            await gasTank
                .connect(owner)
                .addReward(rewardAmount, tipAmount, user1.address, user2.address);

            const DAEMBalanceBeforeClaiming = await fooToken.balanceOf(treasury.address);

            // user 2 claim AND STAKE their reward
            await gasTank.connect(user2).claimAndStakeReward();

            // check how much has been sent by verifying the treasury DAEM balance
            const DAEMBalanceAfterClaiming = await fooToken.balanceOf(treasury.address);
            const difference = DAEMBalanceBeforeClaiming.sub(DAEMBalanceAfterClaiming);

            // user2 did *NOT* receive tokens
            const expectedSentToUser = ethers.utils.parseEther("0");
            expect(difference).to.equal(expectedSentToUser);

            // all reward has been staked
            const expectedStaked = ethers.utils.parseEther("0.45"); // 0.4 from tip + 0.05 from reward
            expect(await treasury.balanceOf(user2.address)).to.equal(expectedStaked);

            // claimable amount is now 0
            expect((await gasTank.claimable(user2.address)).toNumber()).to.equal(0);
        });
    });
});
