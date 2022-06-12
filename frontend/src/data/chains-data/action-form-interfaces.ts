import { AdvancedMoneyMarketActionType, AmountType, InterestRateMode, ZapOutputChoice } from '@daemons-fi/shared-definitions';
import { BaseMoneyMarketActionType } from '@daemons-fi/shared-definitions';
import { DEX, MoneyMarket } from './interfaces';


export enum ScriptAction {
    NONE = "NONE",
    SWAP = "SWAP",
    TRANSFER = "TRANSFER",
    MM_BASE = "MM_BASE",
    MM_ADV = "MM_ADV",
    ZAP_IN = "ZAP_IN",
    ZAP_OUT = "ZAP_OUT",
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
    floatTip: number;
    dex: DEX;
}

export interface ITransferActionForm extends IScriptActionForm {
    type: ScriptAction.TRANSFER;
    tokenAddress: string;
    destinationAddress: string;
    amountType: AmountType;
    floatAmount: number;
    floatTip: number;
}

export interface IBaseMMActionForm extends IScriptActionForm {
    type: ScriptAction.MM_BASE;
    tokenAddress: string;
    actionType: BaseMoneyMarketActionType;
    amountType: AmountType;
    floatAmount: number;
    floatTip: number;
    moneyMarket: MoneyMarket;
}

export interface IAdvancedMMActionForm extends IScriptActionForm {
    type: ScriptAction.MM_ADV;
    tokenAddress: string;
    actionType: AdvancedMoneyMarketActionType;
    interestType: InterestRateMode;
    amountType: AmountType;
    floatAmount: number;
    floatTip: number;
    moneyMarket: MoneyMarket;
}

export interface IZapInActionForm extends IScriptActionForm {
    type: ScriptAction.ZAP_IN,
    tokenA: string;
    tokenB: string;
    floatAmountA: number;
    floatAmountB: number;
    amountTypeA: AmountType;
    amountTypeB: AmountType;
    floatTip: number;
    dex: DEX;
}

export interface IZapOutActionForm extends IScriptActionForm {
    type: ScriptAction.ZAP_OUT,
    tokenA: string;
    tokenB: string;
    floatAmount: number;
    amountType: AmountType;
    outputChoice: ZapOutputChoice;
    floatTip: number;
    dex: DEX;
}

export interface INoActionForm extends IScriptActionForm {
    type: ScriptAction.NONE;
    valid: false;
}
