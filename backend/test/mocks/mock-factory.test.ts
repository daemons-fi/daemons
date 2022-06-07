import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

describe("Mock Uniswap Factory", function () {
    let owner: SignerWithAddress;
    let otherUser: SignerWithAddress;
    let fooToken: Contract;
    let barToken: Contract;
    let fooBarLP: Contract;
    let mockFactory: Contract;

    this.beforeEach(async () => {
        // get some wallets
        [owner, otherUser] = await ethers.getSigners();

        // instantiate Mock token contracts
        const MockTokenContract = await ethers.getContractFactory("MockToken");
        fooToken = await MockTokenContract.deploy("Foo Token", "FOO");
        barToken = await MockTokenContract.deploy("Bar Token", "BAR");
        fooBarLP = await MockTokenContract.deploy("FOO-BAR-LP", "FOO-BAR-LP");

        // instantiate Mock factory contract
        const MockFactoryContract = await ethers.getContractFactory("MockUniswapV2Factory");
        mockFactory = await MockFactoryContract.deploy();
        await mockFactory.setFakePair(fooToken.address, barToken.address, fooBarLP.address);
    });

    describe("getPair", function () {
        it("gets the fake pair", async () => {
            const pairAddress = await mockFactory.getPair(fooToken.address, barToken.address);

            expect(pairAddress).to.equal(fooBarLP.address);
        });

        it("gets the fake pair even when token order is inverted", async () => {
            const pairAddress_foobar = await mockFactory.getPair(fooToken.address, barToken.address);
            const pairAddress_barfoo = await mockFactory.getPair(barToken.address, fooToken.address);

            expect(pairAddress_foobar).to.equal(pairAddress_barfoo);
        });
    });
});
