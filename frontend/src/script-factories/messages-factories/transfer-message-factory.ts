import { BigNumber, ethers, utils } from "ethers";
import { AmountType, ITransferAction } from "@daemons-fi/shared-definitions";
import { IChainInfo } from "../../data/chains-data/interfaces";
import { ICurrentScript } from "../i-current-script";
import { ITransferActionForm, ScriptAction } from "../../data/chains-data/action-form-interfaces";
import { FrequencyConditionFactory } from "../conditions-factories/frequency-condition-factory";
import { BalanceConditionFactory } from "../conditions-factories/balance-condition-factory";
import { PriceConditionFactory } from "../conditions-factories/price-condition-factory";
import { RepetitionsConditionFactory } from "../conditions-factories/repetitions-condition-factory";
import { FollowConditionFactory } from "../conditions-factories/follow-condition-factory";

export class TransferMessageFactory {
    public static async create(
        bundle: ICurrentScript,
        chain: IChainInfo,
        provider: any
    ): Promise<ITransferAction> {
        const transferActionForm = bundle.action.form as ITransferActionForm;
        if (transferActionForm.type !== ScriptAction.TRANSFER)
            throw new Error(`Cannot build Transfer message with this form: ${transferActionForm}`);

        if (!transferActionForm.valid)
            throw new Error(`Cannot build Transfer message with an invalid form`);

        const tokens = chain.tokens;

        const frequencyCondition = await FrequencyConditionFactory.fromBundle(bundle, provider);
        const balanceCondition = BalanceConditionFactory.fromBundle(bundle, tokens);
        const priceCondition = PriceConditionFactory.fromBundle(bundle, tokens);
        const maxRepetitions = RepetitionsConditionFactory.fromBundle(bundle);
        const followCondition = await FollowConditionFactory.fromBundle(bundle);

        const token = tokens.filter(
            (token) => token.address === transferActionForm.tokenAddress
        )[0];

        let amount: BigNumber;
        if (transferActionForm.amountType === AmountType.Absolute) {
            // absolute amount
            amount = utils.parseUnits(transferActionForm.floatAmount.toString(), token.decimals);
        } else {
            // percentage amount
            amount = BigNumber.from(transferActionForm.floatAmount.toString());
        }

        return {
            scriptId: ethers.utils.hexlify(ethers.utils.randomBytes(32)),
            typeAmt: transferActionForm.amountType,
            amount: amount,
            token: token.address,
            destination: transferActionForm.destinationAddress,
            user: await provider.getSigner().getAddress(),
            frequency: frequencyCondition,
            balance: balanceCondition,
            price: priceCondition,
            repetitions: maxRepetitions,
            follow: followCondition,
            executor: chain.contracts.TransferExecutor,
            chainId: BigNumber.from(chain.id)
        };
    }
}
