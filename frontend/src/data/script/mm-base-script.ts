import { BigNumber, Contract } from 'ethers';
import { getAbiFor } from '../../utils/get-abi';
import { BaseScript } from './base-script';
import { BalanceConditionFactory } from '../../script-factories/conditions-factories/balance-condition-factory';
import { FollowConditionFactory } from '../../script-factories/conditions-factories/follow-condition-factory';
import { FrequencyConditionFactory } from '../../script-factories/conditions-factories/frequency-condition-factory';
import { PriceConditionFactory } from '../../script-factories/conditions-factories/price-condition-factory';
import { RepetitionsConditionFactory } from '../../script-factories/conditions-factories/repetitions-condition-factory';
import { BaseMoneyMarketActionType, IMMBaseAction } from '@daemons-fi/shared-definitions';
import { Token } from '../chains-data/interfaces';

export class MmBaseScript extends BaseScript {
    public constructor(private readonly message: IMMBaseAction, signature: string, private readonly description: string) {
        super(signature);
    }

    public readonly ScriptType = "MmBaseScript";
    public getMessage = () => this.message;
    public getUser = () => this.message.user;
    public getId = () => this.message.scriptId;
    public getDescription = () => this.description;
    public getExecutorAddress = () => this.message.executor;
    protected getAmount = () => this.message.amount;
    protected getTokenForAllowance = () => {
        switch (this.message.action) {
            case BaseMoneyMarketActionType.Deposit:
                return this.message.token;
            case BaseMoneyMarketActionType.Withdraw:
                return this.message.aToken;
            default:
                throw new Error(`Unsupported action ${this.message.action}`);
        }
    };

    public async getExecutor(): Promise<Contract> {
        const ethers = require('ethers');
        const provider = new ethers.providers.Web3Provider((window as any).ethereum);
        const signer = provider.getSigner();

        const contractAddress = this.message.executor;
        const contractAbi = await getAbiFor('MmBaseScriptExecutor');
        return new ethers.Contract(contractAddress, contractAbi, signer);
    }

    public static getDefaultDescription(message: IMMBaseAction, tokens: Token[]): string {
        const token = tokens.filter(t => t.address === message.token)[0]?.symbol ?? message.token;
        switch (message.action) {
            case BaseMoneyMarketActionType.Deposit:
                return `Deposit ${token} in AAVE`;

            case BaseMoneyMarketActionType.Withdraw:
                return `Withdraw ${token} from AAVE`;

            default:
                throw new Error(`Unsupported action ${message.action}`);
        }
    }

    public static async fromStorageJson(object: any) {
        const message: IMMBaseAction = object;

        // complex objects are broken down and need to be recreated. Sigh.
        message.chainId = BigNumber.from(object.chainId);
        message.amount = BigNumber.from(object.amount);

        message.balance = BalanceConditionFactory.fromJson(message.balance);
        message.frequency = FrequencyConditionFactory.fromJson(message.frequency);
        message.price = PriceConditionFactory.fromJson(message.price);
        message.repetitions = RepetitionsConditionFactory.fromJson(message.repetitions);
        message.follow = FollowConditionFactory.fromJson(object.follow);

        return new MmBaseScript(message, object.signature, object.description);
    }
}
