import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

describe("Mock Uniswap Router", function () {
    let owner: SignerWithAddress;
    let otherUser: SignerWithAddress;
    let fooToken: Contract;
    let barToken: Contract;
    let fooBarLP: Contract;
    let mockRouter: Contract;

    this.beforeEach(async () => {
        // get some wallets
        [owner, otherUser] = await ethers.getSigners();

        // instantiate Mock token contracts
        const MockTokenContract = await ethers.getContractFactory("MockToken");
        fooToken = await MockTokenContract.deploy("Foo Token", "FOO");
        barToken = await MockTokenContract.deploy("Bar Token", "BAR");
        fooBarLP = await MockTokenContract.deploy("FooBarToken", "FOO-BAR-LP");

        // instantiate Mock router contract
        const MockRouterContract = await ethers.getContractFactory("MockUniswapV2Router");
        mockRouter = await MockRouterContract.deploy();

        // give allowance to router
        fooToken.approve(mockRouter.address, ethers.utils.parseEther("9999999"));
        barToken.approve(mockRouter.address, ethers.utils.parseEther("9999999"));
        fooBarLP.approve(mockRouter.address, ethers.utils.parseEther("9999999"));

        // set factory to mock router
        const MockFactoryContract = await ethers.getContractFactory("MockUniswapV2Factory");
        const mockFactory = await MockFactoryContract.deploy();
        await mockRouter.setFactory(mockFactory.address);
        await mockFactory.setFakePair(fooToken.address, barToken.address, fooBarLP.address);
    });

    describe("swapExactTokensForTokens", function () {
        it("gets tokens from callee", async () => {
            // add tokens to owner's wallet
            await fooToken.mint(owner.address, 150000);
            expect(await fooToken.balanceOf(owner.address)).to.equal(150000);

            // swap tokens
            await mockRouter.swapExactTokensForTokens(
                150000,
                0,
                [fooToken.address, barToken.address],
                owner.address,
                0
            );

            // verify tokens have been taken from owner
            expect(await fooToken.balanceOf(owner.address)).to.equal(0);
        });
        it('"to" address receives the desired token', async () => {
            // add tokens to owner's wallet
            await fooToken.mint(owner.address, 150000);
            expect(await fooToken.balanceOf(owner.address)).to.equal(150000);

            // swap tokens
            await mockRouter.swapExactTokensForTokens(
                150000,
                0,
                [fooToken.address, barToken.address],
                owner.address,
                0
            );

            // verify owner received new tokens
            expect(await fooToken.balanceOf(owner.address)).to.equal(0);
        });
    });

    describe("addLiquidity", function () {
        it("gets tokens from callee", async () => {
            // add tokens to owner's wallet
            await fooToken.mint(owner.address, 150000);
            await barToken.mint(owner.address, 190000);
            expect(await fooToken.balanceOf(owner.address)).to.equal(150000);
            expect(await barToken.balanceOf(owner.address)).to.equal(190000);

            // add liquidity
            await mockRouter.addLiquidity(
                fooToken.address,
                barToken.address,
                150000,
                190000,
                0,
                0,
                owner.address,
                0
            );

            // verify tokens have been taken from owner
            expect(await fooToken.balanceOf(owner.address)).to.equal(0);
            expect(await barToken.balanceOf(owner.address)).to.equal(0);
        });
        it('"to" address receives the LP', async () => {
            // add tokens to owner's wallet
            await fooToken.mint(owner.address, 150000);
            await barToken.mint(owner.address, 190000);

            // check that user does NOT have any LP yet
            expect(await fooBarLP.balanceOf(owner.address)).to.equal(0);

            // add liquidity
            await mockRouter.addLiquidity(
                fooToken.address,
                barToken.address,
                150000,
                190000,
                0,
                0,
                owner.address,
                0
            );

            // verify owner received the LP (340K is just a fictional number)
            expect(await fooBarLP.balanceOf(owner.address)).to.equal(340000);
        });
    });

    describe("removeLiquidity", function () {
        it("gets LP token from callee", async () => {
            // add LP to owner's wallet
            await fooBarLP.mint(owner.address, 300000);
            expect(await fooBarLP.balanceOf(owner.address)).to.equal(300000);

            // remove liquidity
            await mockRouter.removeLiquidity(
                fooToken.address,
                barToken.address,
                300000,
                0,
                0,
                owner.address,
                0
            );

            // verify tokens have been taken from owner
            expect(await fooBarLP.balanceOf(owner.address)).to.equal(0);
        });
        it('"to" address receives the tokens composing the LP', async () => {
            // add LP to owner's wallet
            await fooBarLP.mint(owner.address, 300000);
            expect(await fooBarLP.balanceOf(owner.address)).to.equal(300000);

            // check that user does NOT have any token yet
            expect(await fooToken.balanceOf(owner.address)).to.equal(0);
            expect(await barToken.balanceOf(owner.address)).to.equal(0);

            // remove liquidity
            await mockRouter.removeLiquidity(
                fooToken.address,
                barToken.address,
                300000,
                0,
                0,
                owner.address,
                0
            );

            // verify owner received the LP
            expect(await fooToken.balanceOf(owner.address)).to.equal(150000);
            expect(await barToken.balanceOf(owner.address)).to.equal(150000);
        });
    });

    describe("addLiquidityETH", function () {
        it("gets tokens from callee", async () => {
            // add tokens to owner's wallet
            await fooToken.mint(owner.address, 150000);
            expect(await fooToken.balanceOf(owner.address)).to.equal(150000);

            // add liquidity
            await mockRouter.addLiquidityETH(fooToken.address, 150000, 0, 0, owner.address, 0, {
                value: 100
            });

            // verify tokens have been taken from owner
            expect(await fooToken.balanceOf(owner.address)).to.equal(0);
        });
    });
});
