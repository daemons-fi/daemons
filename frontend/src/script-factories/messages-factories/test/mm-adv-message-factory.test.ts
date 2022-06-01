import { assert, expect } from "chai";
import { AdvancedMoneyMarketActionType } from "@daemons-fi/shared-definitions";
import { AmountType } from "@daemons-fi/shared-definitions";
import { IMMAdvancedAction } from "@daemons-fi/shared-definitions";
import { InterestRateMode } from "@daemons-fi/shared-definitions";
import { MoneyMarket, Token } from "../../../data/chains-data/interfaces";
import { ICurrentScript } from "../../i-current-script";
import { IAdvancedMMActionForm } from "../../../data/chains-data/action-form-interfaces";
import { ScriptAction } from "../../../data/chains-data/action-form-interfaces";
import { BigNumber, ethers } from "ethers";
import { FrequencyConditionFactory } from "../../conditions-factories/frequency-condition-factory";
import { BalanceConditionFactory } from "../../conditions-factories/balance-condition-factory";
import { PriceConditionFactory } from "../../conditions-factories/price-condition-factory";
import { RepetitionsConditionFactory } from "../../conditions-factories/repetitions-condition-factory";
import { FollowConditionFactory } from "../../conditions-factories/follow-condition-factory";
import { HealthFactorConditionFactory } from "../../conditions-factories/health-factor-condition-factory";
import { MmAdvMessageFactory } from "../mm-adv-message-factory";

describe("MM Advanced Message Factory", () => {
    const FooToken: Token = {
        name: "FooToken",
        symbol: "FOO",
        address: "0x123",
        logoURI: "",
        decimals: 18
    };

    const fakeMM: MoneyMarket = {
        name: "AAVE",
        poolAddress: "0xE0fBa4Fc209b4948668006B2bE61711b7f465bAe",
        supportedTokens: [FooToken],
        mmTokens: { "0x123": { aToken: "0x987", fixDebtToken: "0x876", varDebtToken: "0x765" } }
    };

    const form: IAdvancedMMActionForm = {
        type: ScriptAction.MM_ADV,
        valid: true,
        amountType: AmountType.Absolute,
        floatAmount: 12.22,
        floatTip: 1,
        tokenAddress: FooToken.address,
        moneyMarket: fakeMM,
        actionType: AdvancedMoneyMarketActionType.Borrow,
        interestType: InterestRateMode.Fixed
    };

    const bundle: ICurrentScript = {
        id: "0x11111111111",
        description: "lorem ipsum",
        action: {
            title: "FakeAction",
            info: "Whatevs",
            conditions: [],
            form
        },
        conditions: {}
    };

    const fakeProvider: any = {
        getSigner: () => ({ getAddress: () => "0x1234567890" })
    };

    const fakeChain: any = {
        id: "42",
        contracts: { MmAdvancedExecutor: "0x88884444" }
    };

    it("throws an error if the action type does not correspond", async () => {
        const bundleWithWrongAction: ICurrentScript = {
            id: "0x11111111111",
            description: "lorem ipsum",
            action: {
                title: "FakeAction",
                info: "Whatevs",
                conditions: [],
                form: { type: ScriptAction.NONE, valid: true }
            },
            conditions: {}
        };

        const gonnaThrowPromise = () =>
            MmAdvMessageFactory.create(bundleWithWrongAction, fakeChain, fakeProvider);
        await expect(gonnaThrowPromise()).to.be.rejectedWith(
            `Cannot build MmAdvanced message with this form: ${JSON.stringify({
                type: ScriptAction.NONE,
                valid: true
            })}`
        );
    });

    it("throws an error if the action form is invalid", async () => {
        const invalidForm = JSON.parse(JSON.stringify(form));
        invalidForm.valid = false;
        const bundleWithInvalidForm: ICurrentScript = {
            id: "0x11111111111",
            description: "lorem ipsum",
            action: {
                title: "FakeAction",
                info: "Whatevs",
                conditions: [],
                form: invalidForm
            },
            conditions: {}
        };

        const gonnaThrowPromise = () =>
            MmAdvMessageFactory.create(bundleWithInvalidForm, fakeChain, fakeProvider);
        await expect(gonnaThrowPromise()).to.be.rejectedWith(
            `Cannot build MmAdvanced message with an invalid form`
        );
    });

    it("successfully creates a mmAdvanced script", async () => {
        const result = await MmAdvMessageFactory.create(bundle, fakeChain, fakeProvider);

        const expectedResult = {
            scriptId: result.scriptId, // <- taken from real object as it is randomly generated
            typeAmt: form.amountType,
            amount: ethers.utils.parseUnits("12.22", 18), // <- token has 18 decimals
            tip: ethers.utils.parseEther("1"),
            action: AdvancedMoneyMarketActionType.Borrow,
            debtToken: "0x876",
            rateMode: InterestRateMode.Fixed,
            token: "0x123",
            user: "0x1234567890",
            kontract: fakeMM.poolAddress,
            frequency: FrequencyConditionFactory.empty(),
            balance: BalanceConditionFactory.empty(),
            price: PriceConditionFactory.empty(),
            repetitions: RepetitionsConditionFactory.empty(),
            follow: FollowConditionFactory.empty(),
            healthFactor: HealthFactorConditionFactory.empty(),
            executor: "0x88884444",
            chainId: BigNumber.from(fakeChain.id)
        } as IMMAdvancedAction;

        assert.deepEqual(result, expectedResult);
    });

    it("choses the variable debtToken if interest rate mode is variable", async () => {
        const variableInterestsBundle = JSON.parse(JSON.stringify(bundle)) as ICurrentScript;
        (variableInterestsBundle.action.form as IAdvancedMMActionForm).interestType =
            InterestRateMode.Variable;

        const resultVariable = await MmAdvMessageFactory.create(
            variableInterestsBundle,
            fakeChain,
            fakeProvider
        );
        expect(resultVariable.rateMode).to.be.equal(InterestRateMode.Variable);
        expect(resultVariable.debtToken).to.be.equal("0x765");
    });

    it("choses the fixed debtToken if the interest rate mode is fixed", async () => {
        const fixedInterestsBundle = JSON.parse(JSON.stringify(bundle)) as ICurrentScript;
        (fixedInterestsBundle.action.form as IAdvancedMMActionForm).interestType =
            InterestRateMode.Fixed;

        const resultFixed = await MmAdvMessageFactory.create(
            fixedInterestsBundle,
            fakeChain,
            fakeProvider
        );
        expect(resultFixed.rateMode).to.be.equal(InterestRateMode.Fixed);
        expect(resultFixed.debtToken).to.be.equal("0x876");
    });
});
