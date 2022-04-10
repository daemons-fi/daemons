import { BigNumber, utils } from 'ethers';
import { BaseScript } from '../../data/script/base-script';
import { SwapScript } from '../../data/script/swap-script';
import { TransferScript } from '../../data/script/transfer-script';
import { ISwapAction, swapDomain, swapTypes } from '@daemons-fi/shared-definitions';
import { ITransferAction, transferDomain, transferTypes } from '@daemons-fi/shared-definitions';
import { IMMBaseAction, mmBaseDomain, mmBaseTypes } from '@daemons-fi/shared-definitions';
import { IBaseMMActionForm, ISwapActionForm, ITransferActionForm, ScriptAction } from './blocks/actions/actions-interfaces';
import { INewScriptBundle } from './i-new-script-form';
import { FrequencyConditionFactory } from '../../script-factories/conditions-factories/frequency-condition-factory';
import { BalanceConditionFactory } from '../../script-factories/conditions-factories/balance-condition-factory';
import { PriceConditionFactory } from '../../script-factories/conditions-factories/price-condition-factory';
import { RepetitionsConditionFactory } from '../../script-factories/conditions-factories/repetitions-condition-factory';
import { FollowConditionFactory } from '../../script-factories/conditions-factories/follow-condition-factory';
import { AmountType } from '@daemons-fi/shared-definitions';
import { MmBaseScript } from '../../data/script/mm-base-script';
import { Token } from '../../data/chains-data/interfaces';
import { GetCurrentChain } from "../../data/chain-info";

type ScriptDefinition = ISwapAction | ITransferAction | IMMBaseAction;

interface IMessage {
    script: ScriptDefinition;
    domain: any;
    types: any;
}

/**
 * Class used to compose the script from the form and ask the user to sign it with metamask.
 * Caches user wallet for internal operations, so do not reuse, create anew every time.
 * */
export class ScriptFactory {

    private readonly ethers: any;
    private readonly provider: any;
    private readonly signer: any;
    private readonly tokens: Token[];
    private readonly chainId: string;

    public constructor(chainId: string, tokens: Token[]) {
        this.ethers = require('ethers');
        this.provider = new this.ethers.providers.Web3Provider((window as any).ethereum, "any");
        this.signer = this.provider.getSigner();
        this.tokens = tokens;
        this.chainId = chainId;
    }

    public async SubmitScriptsForSignature(bundle: INewScriptBundle): Promise<BaseScript> {
        const getSignature = async (message: IMessage) => (await this.signer._signTypedData(message.domain, message.types, message.script)) as string;

        switch (bundle.actionForm.action) {
            case ScriptAction.Swap:
                const swapMessage = {
                    script: await this.createSwapScript(bundle),
                    domain: swapDomain,
                    types: swapTypes
                };
                const swapScriptSignature = await getSignature(swapMessage);
                const swapScriptDescription = SwapScript.getDefaultDescription(swapMessage.script, this.tokens);
                return new SwapScript(swapMessage.script, swapScriptSignature, swapScriptDescription);

            case ScriptAction.Transfer:
                const transferMessage = {
                    script: await this.createTransferScript(bundle),
                    domain: transferDomain,
                    types: transferTypes
                };
                const transferScriptSignature = await getSignature(transferMessage);
                const transferScriptDescription = TransferScript.getDefaultDescription(transferMessage.script, this.tokens);
                return new TransferScript(transferMessage.script, transferScriptSignature, transferScriptDescription);

            case ScriptAction.MmBase:
                const mmBaseMessage = {
                    script: await this.createMmBaseScript(bundle),
                    domain: mmBaseDomain,
                    types: mmBaseTypes
                };
                const mmBaseScriptSignature = await getSignature(mmBaseMessage);
                const mmBaseScriptDescription = MmBaseScript.getDefaultDescription(mmBaseMessage.script, this.tokens);
                return new MmBaseScript(mmBaseMessage.script, mmBaseScriptSignature, mmBaseScriptDescription);

            default:
                throw new Error("Not implemented");
        }
    }


    private async createSwapScript(bundle: INewScriptBundle): Promise<ISwapAction> {
        const frequencyCondition = await FrequencyConditionFactory.fromForm(bundle.frequencyCondition, this.provider);
        const balanceCondition = BalanceConditionFactory.fromForm(bundle.balanceCondition, this.tokens);
        const priceCondition = PriceConditionFactory.fromForm(bundle.priceCondition, this.tokens);
        const maxRepetitions = RepetitionsConditionFactory.fromForm(bundle.repetitionsCondition);
        const followCondition = await FollowConditionFactory.fromForm(bundle.followCondition);

        const swapActionForm = bundle.actionForm as ISwapActionForm;
        const tokenFrom = this.tokens.filter(token => token.address === swapActionForm.tokenFromAddress)[0];

        let amount: BigNumber;
        if (swapActionForm.amountType === AmountType.Absolute) {
            // absolute amount
            amount = utils.parseUnits(swapActionForm.floatAmount.toString(), tokenFrom.decimals);
        }
        else {
            // percentage amount
            amount = BigNumber.from(swapActionForm.floatAmount.toString());
        }

        return {
            scriptId: this.ethers.utils.hexlify(this.ethers.utils.randomBytes(32)),
            typeAmt: swapActionForm.amountType,
            amount: amount,
            tokenFrom: tokenFrom.address,
            tokenTo: swapActionForm.tokenToAddress,
            user: await this.signer.getAddress(),
            frequency: frequencyCondition,
            balance: balanceCondition,
            price: priceCondition,
            repetitions: maxRepetitions,
            follow: followCondition,
            executor: GetCurrentChain(this.chainId).contracts.SwapExecutor,
            chainId: BigNumber.from(this.chainId),
        };
    }

    private async createTransferScript(bundle: INewScriptBundle): Promise<ITransferAction> {
        const frequencyCondition = await FrequencyConditionFactory.fromForm(bundle.frequencyCondition, this.provider);
        const balanceCondition = BalanceConditionFactory.fromForm(bundle.balanceCondition, this.tokens);
        const priceCondition = PriceConditionFactory.fromForm(bundle.priceCondition, this.tokens);
        const maxRepetitions = RepetitionsConditionFactory.fromForm(bundle.repetitionsCondition);
        const followCondition = await FollowConditionFactory.fromForm(bundle.followCondition);

        const transferActionForm = bundle.actionForm as ITransferActionForm;
        const token = this.tokens.filter(token => token.address === transferActionForm.tokenAddress)[0];

        let amount: BigNumber;
        if (transferActionForm.amountType === AmountType.Absolute) {
            // absolute amount
            amount = utils.parseUnits(transferActionForm.floatAmount.toString(), token.decimals);
        }
        else {
            // percentage amount
            amount = BigNumber.from(transferActionForm.floatAmount.toString());
        }

        return {
            scriptId: this.ethers.utils.hexlify(this.ethers.utils.randomBytes(32)),
            typeAmt: transferActionForm.amountType,
            amount: amount,
            token: token.address,
            destination: transferActionForm.destinationAddress,
            user: await this.signer.getAddress(),
            frequency: frequencyCondition,
            balance: balanceCondition,
            price: priceCondition,
            repetitions: maxRepetitions,
            follow: followCondition,
            executor: GetCurrentChain(this.chainId).contracts.TransferExecutor,
            chainId: BigNumber.from(this.chainId),
        };
    }

    private async createMmBaseScript(bundle: INewScriptBundle): Promise<IMMBaseAction> {
        const frequencyCondition = await FrequencyConditionFactory.fromForm(bundle.frequencyCondition, this.provider);
        const balanceCondition = BalanceConditionFactory.fromForm(bundle.balanceCondition, this.tokens);
        const priceCondition = PriceConditionFactory.fromForm(bundle.priceCondition, this.tokens);
        const maxRepetitions = RepetitionsConditionFactory.fromForm(bundle.repetitionsCondition);
        const followCondition = await FollowConditionFactory.fromForm(bundle.followCondition);

        const mmBaseActionForm = bundle.actionForm as IBaseMMActionForm;
        const moneyMarket = mmBaseActionForm.moneyMarket;
        const token = moneyMarket.supportedTokens.filter(token => token.address === mmBaseActionForm.tokenAddress)[0];
        const aToken = moneyMarket.aTokens[token.address];

        let amount: BigNumber;
        if (mmBaseActionForm.amountType === AmountType.Absolute) {
            // absolute amount
            amount = utils.parseUnits(mmBaseActionForm.floatAmount.toString(), token.decimals);
        }
        else {
            // percentage amount
            amount = BigNumber.from(mmBaseActionForm.floatAmount.toString());
        }

        return {
            scriptId: this.ethers.utils.hexlify(this.ethers.utils.randomBytes(32)),
            typeAmt: mmBaseActionForm.amountType,
            amount: amount,
            action: mmBaseActionForm.actionType,
            token: mmBaseActionForm.tokenAddress,
            aToken: aToken.address,
            user: await this.signer.getAddress(),
            kontract: moneyMarket.poolAddress,
            frequency: frequencyCondition,
            balance: balanceCondition,
            price: priceCondition,
            repetitions: maxRepetitions,
            follow: followCondition,
            executor: GetCurrentChain(this.chainId).contracts.MmBaseExecutor,
            chainId: BigNumber.from(this.chainId),
        };
    }
}
