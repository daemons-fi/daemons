import { BigNumber, utils } from "ethers";
import { AmountType, IZapOutAction } from "@daemons-fi/shared-definitions";
import { IChainInfo } from "../../data/chains-data/interfaces";
import { ICurrentScript } from "../i-current-script";
import { IZapOutActionForm, ScriptAction } from "../../data/chains-data/action-form-interfaces";
import { FrequencyConditionFactory } from "../conditions-factories/frequency-condition-factory";
import { BalanceConditionFactory } from "../conditions-factories/balance-condition-factory";
import { PriceConditionFactory } from "../conditions-factories/price-condition-factory";
import { RepetitionsConditionFactory } from "../conditions-factories/repetitions-condition-factory";
import { FollowConditionFactory } from "../conditions-factories/follow-condition-factory";

export class ZapOutMessageFactory {
    public static async create(
        bundle: ICurrentScript,
        chain: IChainInfo,
        provider: any
    ): Promise<IZapOutAction> {
        const zapOutActionForm = bundle.action.form as IZapOutActionForm;
        if (zapOutActionForm.type !== ScriptAction.ZAP_OUT)
            throw new Error(
                `Cannot build ZapOut message with this form: ${JSON.stringify(
                    zapOutActionForm
                )}`
            );

        if (!zapOutActionForm.valid)
            throw new Error(`Cannot build ZapOut message with an invalid form`);

        const tokens = chain.tokens;

        const frequencyCondition = await FrequencyConditionFactory.fromBundle(bundle, provider);
        const balanceCondition = BalanceConditionFactory.fromBundle(bundle, tokens);
        const priceCondition = PriceConditionFactory.fromBundle(bundle, tokens);
        const maxRepetitions = RepetitionsConditionFactory.fromBundle(bundle);
        const followCondition = FollowConditionFactory.fromBundle(bundle);

        const tokenA = tokens.filter(
            (token) => token.address === zapOutActionForm.tokenA
        )[0];
        const tokenB = tokens.filter(
            (token) => token.address === zapOutActionForm.tokenB
        )[0];

        let amount: BigNumber;
        if (zapOutActionForm.amountType === AmountType.Absolute) {
            // absolute amount
            amount = utils.parseUnits(zapOutActionForm.floatAmount.toString(), 18);
        } else {
            // percentage amount
            amount = BigNumber.from(zapOutActionForm.floatAmount.toString());
        }

        const tip = utils.parseEther(zapOutActionForm.floatTip.toString());

        return {
            scriptId:bundle.id,
            typeAmt: zapOutActionForm.amountType,
            amount: amount,
            tip: tip,
            tokenA: tokenA.address,
            tokenB: tokenB.address,
            outputChoice: zapOutActionForm.outputChoice,
            kontract: zapOutActionForm.dex.poolAddress,
            user: await provider.getSigner().getAddress(),
            frequency: frequencyCondition,
            balance: balanceCondition,
            price: priceCondition,
            repetitions: maxRepetitions,
            follow: followCondition,
            executor: chain.contracts.ZapOutExecutor,
            chainId: BigNumber.from(chain.id)
        };
    }
}
