import { BigNumber, utils } from "ethers";
import { AmountType, IMMBaseAction } from "@daemons-fi/shared-definitions";
import { IChainInfo } from "../../data/chains-data/interfaces";
import { ICurrentScript } from "../i-current-script";
import { IBaseMMActionForm, ScriptAction } from "../../data/chains-data/action-form-interfaces";
import { FrequencyConditionFactory } from "../conditions-factories/frequency-condition-factory";
import { BalanceConditionFactory } from "../conditions-factories/balance-condition-factory";
import { PriceConditionFactory } from "../conditions-factories/price-condition-factory";
import { RepetitionsConditionFactory } from "../conditions-factories/repetitions-condition-factory";
import { FollowConditionFactory } from "../conditions-factories/follow-condition-factory";
import { HealthFactorConditionFactory } from "../conditions-factories/health-factor-condition-factory";

export class MmBaseMessageFactory {
    public static async create(
        bundle: ICurrentScript,
        chain: IChainInfo,
        provider: any
    ): Promise<IMMBaseAction> {
        const mmBaseActionForm = bundle.action.form as IBaseMMActionForm;
        if (mmBaseActionForm.type !== ScriptAction.MM_BASE)
            throw new Error(
                `Cannot build MmBase message with this form: ${JSON.stringify(mmBaseActionForm)}`
            );

        if (!mmBaseActionForm.valid)
            throw new Error(`Cannot build MmBase message with an invalid form`);

        const tokens = chain.tokens;

        const frequencyCondition = await FrequencyConditionFactory.fromBundle(bundle, provider);
        const balanceCondition = BalanceConditionFactory.fromBundle(bundle, tokens);
        const priceCondition = PriceConditionFactory.fromBundle(bundle, tokens);
        const maxRepetitions = RepetitionsConditionFactory.fromBundle(bundle);
        const followCondition = FollowConditionFactory.fromBundle(bundle);
        const healthFactorCondition = HealthFactorConditionFactory.fromBundle(bundle);

        const moneyMarket = mmBaseActionForm.moneyMarket;
        const token = moneyMarket.supportedTokens.filter(
            (token) => token.address === mmBaseActionForm.tokenAddress
        )[0];
        const aTokenAddress = moneyMarket.mmTokens[token.address].aToken;

        let amount: BigNumber;
        if (mmBaseActionForm.amountType === AmountType.Absolute) {
            // absolute amount
            amount = utils.parseUnits(mmBaseActionForm.floatAmount.toString(), token.decimals);
        } else {
            // percentage amount
            amount = BigNumber.from(mmBaseActionForm.floatAmount.toString());
        }

        const tip = utils.parseEther(mmBaseActionForm.floatTip.toString());

        return {
            scriptId: bundle.id,
            typeAmt: mmBaseActionForm.amountType,
            amount: amount,
            tip: tip,
            action: mmBaseActionForm.actionType,
            token: mmBaseActionForm.tokenAddress,
            aToken: aTokenAddress,
            user: await provider.getSigner().getAddress(),
            kontract: moneyMarket.poolAddress,
            frequency: frequencyCondition,
            balance: balanceCondition,
            price: priceCondition,
            repetitions: maxRepetitions,
            follow: followCondition,
            healthFactor: healthFactorCondition,
            executor: chain.contracts.MmBaseExecutor,
            chainId: BigNumber.from(chain.id)
        };
    }
}
