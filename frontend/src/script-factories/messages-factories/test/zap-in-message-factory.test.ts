import { assert, expect } from "chai";
import { AmountType, IZapInAction } from "@daemons-fi/shared-definitions";
import { DEX, Token } from "../../../data/chains-data/interfaces";
import { ICurrentScript } from "../../i-current-script";
import { IZapInActionForm } from "../../../data/chains-data/action-form-interfaces";
import { ScriptAction } from "../../../data/chains-data/action-form-interfaces";
import { BigNumber, ethers } from "ethers";
import { FrequencyConditionFactory } from "../../conditions-factories/frequency-condition-factory";
import { BalanceConditionFactory } from "../../conditions-factories/balance-condition-factory";
import { PriceConditionFactory } from "../../conditions-factories/price-condition-factory";
import { RepetitionsConditionFactory } from "../../conditions-factories/repetitions-condition-factory";
import { FollowConditionFactory } from "../../conditions-factories/follow-condition-factory";
import { ZapInMessageFactory } from "../zap-in-message-factory";

describe("ZapIn Message Factory", () => {
    const tokens: Token[] = [
        {
            name: "FooToken",
            symbol: "FOO",
            address: "0x123",
            logoURI: "",
            decimals: 18
        },
        {
            name: "BarToken",
            symbol: "BAR",
            address: "0x987",
            logoURI: "",
            decimals: 18
        }
    ];

    const fakeDEX: DEX = {
        name: "Sushi",
        poolAddress: "0xE0fBa4Fc209b4948668006B2bE61711b7f465bAe"
    };

    const form: IZapInActionForm = {
        type: ScriptAction.ZAP_IN,
        valid: true,
        amountTypeA: AmountType.Percentage,
        amountTypeB: AmountType.Absolute,
        floatAmountA: 5000,
        floatAmountB: 5.68,
        floatTip: 1,
        tokenA: tokens[0].address,
        tokenB: tokens[1].address,
        dex: fakeDEX
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
        contracts: { ZapInExecutor: "0x88884444" },
        tokens: tokens
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
            ZapInMessageFactory.create(bundleWithWrongAction, fakeChain, fakeProvider);
        await expect(gonnaThrowPromise()).to.be.rejectedWith(
            `Cannot build ZapIn message with this form: ${JSON.stringify({
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
            ZapInMessageFactory.create(bundleWithInvalidForm, fakeChain, fakeProvider);
        await expect(gonnaThrowPromise()).to.be.rejectedWith(
            `Cannot build ZapIn message with an invalid form`
        );
    });

    it("successfully creates a zapIn script", async () => {
        const result = await ZapInMessageFactory.create(bundle, fakeChain, fakeProvider);

        const expectedResult = {
            scriptId: result.scriptId, // <- taken from real object as it is randomly generated
            typeAmtA: form.amountTypeA,
            typeAmtB: form.amountTypeB,
            amountA: BigNumber.from("5000"), // <- 50%
            amountB: ethers.utils.parseUnits("5.68", 18), // <- token has 18 decimals
            tip: ethers.utils.parseEther("1"),
            tokenA: "0x123",
            tokenB: "0x987",
            user: "0x1234567890",
            kontract: "0xE0fBa4Fc209b4948668006B2bE61711b7f465bAe",
            frequency: FrequencyConditionFactory.empty(),
            balance: BalanceConditionFactory.empty(),
            price: PriceConditionFactory.empty(),
            repetitions: RepetitionsConditionFactory.empty(),
            follow: FollowConditionFactory.empty(),
            executor: "0x88884444",
            chainId: BigNumber.from(fakeChain.id)
        } as IZapInAction;

        assert.deepEqual(result, expectedResult);
    });
});
