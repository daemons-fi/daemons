import { BigNumber, ethers, utils } from "ethers";
import { AmountType, IMMBaseAction } from "@daemons-fi/shared-definitions";
import { IChainInfo } from "../../data/chains-data/interfaces";
import { ICurrentScript } from "../i-current-script";
import { IBaseMMActionForm, ScriptAction } from "../../data/chains-data/action-form-interfaces";
import { FrequencyConditionFactory } from "../conditions-factories/frequency-condition-factory";
import { BalanceConditionFactory } from "../conditions-factories/balance-condition-factory";
import { PriceConditionFactory } from "../conditions-factories/price-condition-factory";
import { RepetitionsConditionFactory } from "../conditions-factories/repetitions-condition-factory";
import { FollowConditionFactory } from "../conditions-factories/follow-condition-factory";

export class MmBaseMessageFactory {
    public static async create(
        bundle: ICurrentScript,
        chain: IChainInfo,
        provider: any
    ): Promise<IMMBaseAction> {
        const mmBaseActionForm = bundle.action.form as IBaseMMActionForm;
        if (mmBaseActionForm.type !== ScriptAction.MMBASE)
            throw new Error(`Cannot build MmBase message with this form: ${mmBaseActionForm}`);

        if (!mmBaseActionForm.valid)
            throw new Error(`Cannot build MmBase message with an invalid form`);

        const tokens = chain.tokens;

        const frequencyCondition = await FrequencyConditionFactory.fromBundle(bundle, provider);
        const balanceCondition = BalanceConditionFactory.fromBundle(bundle, tokens);
        const priceCondition = PriceConditionFactory.fromBundle(bundle, tokens);
        const maxRepetitions = RepetitionsConditionFactory.fromBundle(bundle);
        const followCondition = await FollowConditionFactory.fromBundle(bundle);

        const moneyMarket = mmBaseActionForm.moneyMarket;
        const token = moneyMarket.supportedTokens.filter(
            (token) => token.address === mmBaseActionForm.tokenAddress
        )[0];
        const aToken = moneyMarket.aTokens[token.address];

        let amount: BigNumber;
        if (mmBaseActionForm.amountType === AmountType.Absolute) {
            // absolute amount
            amount = utils.parseUnits(mmBaseActionForm.floatAmount.toString(), token.decimals);
        } else {
            // percentage amount
            amount = BigNumber.from(mmBaseActionForm.floatAmount.toString());
        }

        return {
            scriptId: ethers.utils.hexlify(ethers.utils.randomBytes(32)),
            typeAmt: mmBaseActionForm.amountType,
            amount: amount,
            action: mmBaseActionForm.actionType,
            token: mmBaseActionForm.tokenAddress,
            aToken: aToken.address,
            user: await provider.getSigner().getAddress(),
            kontract: moneyMarket.poolAddress,
            frequency: frequencyCondition,
            balance: balanceCondition,
            price: priceCondition,
            repetitions: maxRepetitions,
            follow: followCondition,
            executor: chain.contracts.MmBaseExecutor,
            chainId: BigNumber.from(chain.id)
        };
    }
}
