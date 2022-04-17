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

export interface IContractsList {
    GasTank: string;
    DAEMToken: string;
    Treasury: string;
    GasPriceFeed: string;
    PriceRetriever: string;

    // executors
    SwapExecutor: string;
    TransferExecutor: string;
    MmBaseExecutor: string;
    MmAdvancedExecutor: string;
}

export interface IAction {
    title: string;
    info: string;
    conditions: ICondition[];
    form: IScriptActionForm;
}

export interface ICondition {
    title: string;
    info: string;
    form: IScriptConditionForm;
}

export enum ConditionTitles {
    FREQUENCY = "Frequency",
    BALANCE = "Balance",
    PRICE = "Price",
    REPETITIONS = "Repetitions",
    FOLLOW = "Chain Scripts",
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
    contracts: IContractsList;
    actions: IAction[];
}
