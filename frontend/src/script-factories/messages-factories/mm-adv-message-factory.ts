import { BigNumber, utils } from "ethers";
import { AmountType, IMMAdvancedAction, InterestRateMode } from "@daemons-fi/shared-definitions";
import { IChainInfo } from "../../data/chains-data/interfaces";
import { ICurrentScript } from "../i-current-script";
import { IAdvancedMMActionForm, ScriptAction } from "../../data/chains-data/action-form-interfaces";
import { FrequencyConditionFactory } from "../conditions-factories/frequency-condition-factory";
import { BalanceConditionFactory } from "../conditions-factories/balance-condition-factory";
import { PriceConditionFactory } from "../conditions-factories/price-condition-factory";
import { RepetitionsConditionFactory } from "../conditions-factories/repetitions-condition-factory";
import { FollowConditionFactory } from "../conditions-factories/follow-condition-factory";
import { HealthFactorConditionFactory } from "../conditions-factories/health-factor-condition-factory";

export class MmAdvMessageFactory {
    public static async create(
        bundle: ICurrentScript,
        chain: IChainInfo,
        provider: any
    ): Promise<IMMAdvancedAction> {
        const mmAdvActionForm = bundle.action.form as IAdvancedMMActionForm;
        if (mmAdvActionForm.type !== ScriptAction.MM_ADV)
            throw new Error(
                `Cannot build MmAdvanced message with this form: ${JSON.stringify(mmAdvActionForm)}`
            );

        if (!mmAdvActionForm.valid)
            throw new Error(`Cannot build MmAdvanced message with an invalid form`);

        const tokens = chain.tokens;

        const frequencyCondition = await FrequencyConditionFactory.fromBundle(bundle, provider);
        const balanceCondition = BalanceConditionFactory.fromBundle(bundle, tokens);
        const priceCondition = PriceConditionFactory.fromBundle(bundle, tokens);
        const maxRepetitions = RepetitionsConditionFactory.fromBundle(bundle);
        const followCondition = FollowConditionFactory.fromBundle(bundle);
        const healthFactorCondition = HealthFactorConditionFactory.fromBundle(bundle);

        const moneyMarket = mmAdvActionForm.moneyMarket;
        const token = moneyMarket.supportedTokens.filter(
            (token) => token.address === mmAdvActionForm.tokenAddress
        )[0];

        const mmTokens = moneyMarket.mmTokens[token.address];
        const debtTokenAddress =
            mmAdvActionForm.interestType === InterestRateMode.Fixed
                ? mmTokens.fixDebtToken
                : mmTokens.varDebtToken;

        let amount: BigNumber;
        if (mmAdvActionForm.amountType === AmountType.Absolute) {
            // absolute amount
            amount = utils.parseUnits(mmAdvActionForm.floatAmount.toString(), token.decimals);
        } else {
            // percentage amount
            amount = BigNumber.from(mmAdvActionForm.floatAmount.toString());
        }

        const tip = utils.parseEther(mmAdvActionForm.floatTip.toString());

        return {
            scriptId: bundle.id,
            token: mmAdvActionForm.tokenAddress,
            debtToken: debtTokenAddress,
            action: mmAdvActionForm.actionType,
            typeAmt: mmAdvActionForm.amountType,
            rateMode: mmAdvActionForm.interestType,
            amount: amount,
            tip: tip,
            user: await provider.getSigner().getAddress(),
            kontract: moneyMarket.poolAddress,
            executor: chain.contracts.MmAdvancedExecutor,
            chainId: BigNumber.from(chain.id),
            frequency: frequencyCondition,
            balance: balanceCondition,
            price: priceCondition,
            repetitions: maxRepetitions,
            follow: followCondition,
            healthFactor: healthFactorCondition
        };
    }
}
