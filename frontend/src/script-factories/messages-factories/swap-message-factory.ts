import { BigNumber, ethers, utils } from "ethers";
import { AmountType, ISwapAction } from "@daemons-fi/shared-definitions";
import { IChainInfo } from "../../data/chains-data/interfaces";
import { ICurrentScript } from "../i-current-script";
import { ISwapActionForm, ScriptAction } from "../../data/chains-data/action-form-interfaces";
import { FrequencyConditionFactory } from "../conditions-factories/frequency-condition-factory";
import { BalanceConditionFactory } from "../conditions-factories/balance-condition-factory";
import { PriceConditionFactory } from "../conditions-factories/price-condition-factory";
import { RepetitionsConditionFactory } from "../conditions-factories/repetitions-condition-factory";
import { FollowConditionFactory } from "../conditions-factories/follow-condition-factory";

export class SwapMessageFactory {
    public static async create(
        bundle: ICurrentScript,
        chain: IChainInfo,
        provider: any
    ): Promise<ISwapAction> {
        const swapActionForm = bundle.action.form as ISwapActionForm;
        if (swapActionForm.type !== ScriptAction.SWAP)
            throw new Error(
                `Cannot build Swap message with this form: ${JSON.stringify(swapActionForm)}`
            );

        if (!swapActionForm.valid)
            throw new Error(`Cannot build Swap message with an invalid form`);

        const tokens = chain.tokens;

        const frequencyCondition = await FrequencyConditionFactory.fromBundle(bundle, provider);
        const balanceCondition = BalanceConditionFactory.fromBundle(bundle, tokens);
        const priceCondition = PriceConditionFactory.fromBundle(bundle, tokens);
        const maxRepetitions = RepetitionsConditionFactory.fromBundle(bundle);
        const followCondition = await FollowConditionFactory.fromBundle(bundle);

        const tokenFrom = tokens.filter(
            (token) => token.address === swapActionForm.tokenFromAddress
        )[0];

        let amount: BigNumber;
        if (swapActionForm.amountType === AmountType.Absolute) {
            // absolute amount
            amount = utils.parseUnits(swapActionForm.floatAmount.toString(), tokenFrom.decimals);
        } else {
            // percentage amount
            amount = BigNumber.from(swapActionForm.floatAmount.toString());
        }

        return {
            scriptId: bundle.id,
            typeAmt: swapActionForm.amountType,
            amount: amount,
            tokenFrom: tokenFrom.address,
            tokenTo: swapActionForm.tokenToAddress,
            user: await provider.getSigner().getAddress(),
            frequency: frequencyCondition,
            balance: balanceCondition,
            price: priceCondition,
            repetitions: maxRepetitions,
            follow: followCondition,
            executor: chain.contracts.SwapExecutor,
            chainId: BigNumber.from(chain.id)
        };
    }
}
