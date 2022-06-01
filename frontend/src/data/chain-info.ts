import { fantomTestnetInfo } from "./chains-data/fantom-testnet";
import { IChainInfo } from './chains-data/interfaces';
import { kovanInfo } from './chains-data/kovan';
import { unsupportedChain } from './chains-data/unsupported';


export const ChainInfo: { [chainId: string]: IChainInfo; } = {
    "42": kovanInfo,
    "4002": fantomTestnetInfo,
};

export const GetCurrentChain = (chainId: string): IChainInfo =>
    IsChainSupported(chainId) ? ChainInfo[chainId] : unsupportedChain;

export const IsChainSupported = (chainId: string): boolean =>
    !!ChainInfo[chainId];

export const GetAvailableChains = (): IChainInfo[] =>
    Object.values(ChainInfo);

export const ZeroAddress = '0x0000000000000000000000000000000000000000';
export const ZeroId = '0x0000000000000000000000000000000000000000000000000000000000000000';
