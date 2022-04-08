import { IScriptActionForm } from './action-form-interfaces';
import { IScriptConditionForm } from './condition-form-interfaces';


export interface IToken {
    name: string;
    symbol: string;
    address: string;
    logoURI: string;
    decimals: number;
    hasPriceFeed?: boolean;
}

export type Token = IToken;

export type MoneyMarket = {
    name: string;
    poolAddress: string;
    supportedTokens: Token[];
    aTokens: { [tokenAddress: string]: Token; };
};


export interface IAction {
    title: string;
    description: string;
    conditions: ICondition[];
    form: IScriptActionForm;
}

export interface ICondition {
    title: string;
    description: string;
    form: IScriptConditionForm;
}

export interface IChainInfo {
    name: string;
    id: string;
    hex: string;
    defaultRPC: string;
    iconPath: string;
    coinName: string;
    coinSymbol: string;
    coinDecimals: number;
    explorerUrl: string;
    explorerTxUrl: string;
    tokens: Token[];
    moneyMarket: MoneyMarket;
    actions: IAction[];
}
