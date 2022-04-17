import { assert, expect } from "chai";
import { AmountType, ITransferAction } from "@daemons-fi/shared-definitions";
import { ZeroAddress } from "../../../data/chain-info";
import { Token } from "../../../data/chains-data/interfaces";
import { ICurrentScript } from "../../i-current-script";
import { ITransferActionForm } from "../../../data/chains-data/action-form-interfaces";
import { ScriptAction } from "../../../data/chains-data/action-form-interfaces";
import { TransferMessageFactory } from "../transfer-message-factory";
import { BigNumber, ethers } from "ethers";
import { FrequencyConditionFactory } from "../../conditions-factories/frequency-condition-factory";
import { BalanceConditionFactory } from "../../conditions-factories/balance-condition-factory";
import { PriceConditionFactory } from "../../conditions-factories/price-condition-factory";
import { RepetitionsConditionFactory } from "../../conditions-factories/repetitions-condition-factory";
import { FollowConditionFactory } from "../../conditions-factories/follow-condition-factory";

describe("Transfer Message Factory", () => {
    const tokens: Token[] = [
        {
            name: "FooToken",
            symbol: "FOO",
            address: "0x123",
            logoURI: "",
            decimals: 18
        }
    ];

    const form: ITransferActionForm = {
        type: ScriptAction.TRANSFER,
        valid: true,
        amountType: AmountType.Absolute,
        floatAmount: 12.22,
        tokenAddress: tokens[0].address,
        destinationAddress: ZeroAddress
    };

    const bundle: ICurrentScript = {
        id: '0x11111111111',
        description: 'lorem ipsum',
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
        contracts: { TransferExecutor: "0x88884444" },
        tokens: tokens
    };

    it("throws an error if the action type does not correspond", async () => {
        const bundleWithWrongAction: ICurrentScript = {
            id: '0x11111111111',
            description: 'lorem ipsum',
            action: {
                title: "FakeAction",
                info: "Whatevs",
                conditions: [],
                form: { type: ScriptAction.NONE, valid: true }
            },
            conditions: {}
        };

        const gonnaThrowPromise = () =>
            TransferMessageFactory.create(bundleWithWrongAction, fakeChain, fakeProvider);
        await expect(gonnaThrowPromise()).to.be.rejectedWith(
            `Cannot build Transfer message with this form: ${JSON.stringify({
                type: ScriptAction.NONE,
                valid: true
            })}`
        );
    });

    it("throws an error if the action form is invalid", async () => {
        const invalidForm = JSON.parse(JSON.stringify(form));
        invalidForm.valid = false;
        const bundleWithInvalidForm: ICurrentScript = {
            id: '0x11111111111',
            description: 'lorem ipsum',
            action: {
                title: "FakeAction",
                info: "Whatevs",
                conditions: [],
                form: invalidForm
            },
            conditions: {}
        };

        const gonnaThrowPromise = () =>
            TransferMessageFactory.create(bundleWithInvalidForm, fakeChain, fakeProvider);
        await expect(gonnaThrowPromise()).to.be.rejectedWith(
            `Cannot build Transfer message with an invalid form`
        );
    });

    it("successfully creates a transfer script", async () => {
        const result = await TransferMessageFactory.create(bundle, fakeChain, fakeProvider);

        const expectedResult = {
            scriptId: result.scriptId, // <- taken from real object as it is randomly generated
            typeAmt: form.amountType,
            amount: ethers.utils.parseUnits("12.22", 18), // <- token has 18 decimals
            token: "0x123",
            destination: ZeroAddress,
            user: "0x1234567890",
            frequency: FrequencyConditionFactory.empty(),
            balance: BalanceConditionFactory.empty(),
            price: PriceConditionFactory.empty(),
            repetitions: RepetitionsConditionFactory.empty(),
            follow: FollowConditionFactory.empty(),
            executor: "0x88884444",
            chainId: BigNumber.from(fakeChain.id)
        } as ITransferAction;

        assert.deepEqual(result, expectedResult);
    });
});
