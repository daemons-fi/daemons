import { AmountType } from '@daemons-fi/shared-definitions';
import { BaseMoneyMarketActionType } from '@daemons-fi/shared-definitions';
import { MoneyMarket } from './interfaces';


export enum ScriptAction {
    NONE = "NONE",
    SWAP = "SWAP",
    TRANSFER = "TRANSFER",
    MMBASE = "MMBASE",
    // DAO = "DAO",
    // FARM = "FARM",
}

export interface IScriptActionForm {
    type: ScriptAction;
    valid: boolean;
}

export interface ISwapActionForm extends IScriptActionForm {
    type: ScriptAction.SWAP;
    tokenFromAddress: string;
    tokenToAddress: string;
    amountType: AmountType;
    floatAmount: number;
}

export interface ITransferActionForm extends IScriptActionForm {
    type: ScriptAction.TRANSFER;
    tokenAddress: string;
    destinationAddress: string;
    amountType: AmountType;
    floatAmount: number;
}

export interface IBaseMMActionForm extends IScriptActionForm {
    type: ScriptAction.MMBASE;
    tokenAddress: string;
    actionType: BaseMoneyMarketActionType;
    amountType: AmountType;
    floatAmount: number;
    moneyMarket: MoneyMarket;
}

export interface INoActionForm extends IScriptActionForm {
    type: ScriptAction.NONE;
    valid: false;
}
