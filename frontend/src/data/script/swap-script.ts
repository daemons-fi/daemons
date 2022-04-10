import { BigNumber, Contract } from 'ethers';
import { ISwapAction } from '@daemons-fi/shared-definitions';
import { getAbiFor } from '../../utils/get-abi';
import { BalanceConditionFactory } from '../../script-factories/conditions-factories/balance-condition-factory';
import { FollowConditionFactory } from '../../script-factories/conditions-factories/follow-condition-factory';
import { FrequencyConditionFactory } from '../../script-factories/conditions-factories/frequency-condition-factory';
import { PriceConditionFactory } from '../../script-factories/conditions-factories/price-condition-factory';
import { RepetitionsConditionFactory } from '../../script-factories/conditions-factories/repetitions-condition-factory';
import { BaseScript } from './base-script';
import { Token } from '../chains-data/interfaces';


export class SwapScript extends BaseScript {
    public constructor(private readonly message: ISwapAction, signature: string, private readonly description: string) {
        super(signature);
    }

    public readonly ScriptType = "SwapScript";
    public getMessage = () => this.message;
    public getUser = () => this.message.user;
    public getId = () => this.message.scriptId;
    public getDescription = () => this.description;
    public getExecutorAddress = () => this.message.executor;
    protected getAmount = () => this.message.amount;
    protected getTokenForAllowance = () => this.message.tokenFrom;

    public async getExecutor(): Promise<Contract> {
        const ethers = require('ethers');
        const provider = new ethers.providers.Web3Provider((window as any).ethereum);
        const signer = provider.getSigner();

        const contractAddress = this.message.executor;
        const contractAbi = await getAbiFor('SwapperScriptExecutor');
        return new ethers.Contract(contractAddress, contractAbi, signer);
    }

    public static getDefaultDescription(message: ISwapAction, tokens: Token[]): string {
        const tokenFrom = tokens.filter(t => t.address === message.tokenFrom)[0]?.symbol ?? message.tokenFrom;
        const tokenTo = tokens.filter(t => t.address === message.tokenTo)[0]?.symbol ?? message.tokenTo;
        return `Swap ${tokenFrom} for ${tokenTo}`;
    }

    public static async fromStorageJson(object: any) {
        const message: ISwapAction = object;

        // complex objects are broken down and need to be recreated. Sigh.
        message.chainId = BigNumber.from(object.chainId);
        message.amount = BigNumber.from(object.amount);

        message.balance = BalanceConditionFactory.fromJson(message.balance);
        message.frequency = FrequencyConditionFactory.fromJson(message.frequency);
        message.price = PriceConditionFactory.fromJson(message.price);
        message.repetitions = RepetitionsConditionFactory.fromJson(message.repetitions);
        message.follow = FollowConditionFactory.fromJson(object.follow);

        return new SwapScript(message, object.signature, object.description);
    }
}
