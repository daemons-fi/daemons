import { BigNumber, utils } from "ethers";
import { AmountType, IZapInAction } from "@daemons-fi/shared-definitions";
import { IChainInfo } from "../../data/chains-data/interfaces";
import { ICurrentScript } from "../i-current-script";
import { IZapInActionForm, ScriptAction } from "../../data/chains-data/action-form-interfaces";
import { FrequencyConditionFactory } from "../conditions-factories/frequency-condition-factory";
import { BalanceConditionFactory } from "../conditions-factories/balance-condition-factory";
import { PriceConditionFactory } from "../conditions-factories/price-condition-factory";
import { RepetitionsConditionFactory } from "../conditions-factories/repetitions-condition-factory";
import { FollowConditionFactory } from "../conditions-factories/follow-condition-factory";

export class ZapInMessageFactory {
    public static async create(
        bundle: ICurrentScript,
        chain: IChainInfo,
        provider: any
    ): Promise<IZapInAction> {
        const zapInActionForm = bundle.action.form as IZapInActionForm;
        if (zapInActionForm.type !== ScriptAction.ZAP_IN)
            throw new Error(
                `Cannot build ZapIn message with this form: ${JSON.stringify(
                    zapInActionForm
                )}`
            );

        if (!zapInActionForm.valid)
            throw new Error(`Cannot build ZapIn message with an invalid form`);

        const tokens = chain.tokens;

        const frequencyCondition = await FrequencyConditionFactory.fromBundle(bundle, provider);
        const balanceCondition = BalanceConditionFactory.fromBundle(bundle, tokens);
        const priceCondition = PriceConditionFactory.fromBundle(bundle, tokens);
        const maxRepetitions = RepetitionsConditionFactory.fromBundle(bundle);
        const followCondition = FollowConditionFactory.fromBundle(bundle);

        const tokenA = tokens.filter(
            (token) => token.address === zapInActionForm.tokenA
        )[0];
        const tokenB = tokens.filter(
            (token) => token.address === zapInActionForm.tokenB
        )[0];

        let amountA: BigNumber;
        if (zapInActionForm.amountTypeA === AmountType.Absolute) {
            // absolute amount
            amountA = utils.parseUnits(zapInActionForm.floatAmountA.toString(), tokenA.decimals);
        } else {
            // percentage amount
            amountA = BigNumber.from(zapInActionForm.floatAmountA.toString());
        }
        let amountB: BigNumber;
        if (zapInActionForm.amountTypeB === AmountType.Absolute) {
            // absolute amount
            amountB = utils.parseUnits(zapInActionForm.floatAmountB.toString(), tokenB.decimals);
        } else {
            // percentage amount
            amountB = BigNumber.from(zapInActionForm.floatAmountB.toString());
        }

        const tip = utils.parseEther(zapInActionForm.floatTip.toString());

        return {
            scriptId:bundle.id,
            typeAmtA: zapInActionForm.amountTypeA,
            typeAmtB: zapInActionForm.amountTypeB,
            amountA: amountA,
            amountB: amountB,
            tip: tip,
            tokenA: tokenA.address,
            tokenB: tokenB.address,
            kontract: zapInActionForm.dex.poolAddress,
            user: await provider.getSigner().getAddress(),
            frequency: frequencyCondition,
            balance: balanceCondition,
            price: priceCondition,
            repetitions: maxRepetitions,
            follow: followCondition,
            executor: chain.contracts.ZapInExecutor,
            chainId: BigNumber.from(chain.id)
        };
    }
}
