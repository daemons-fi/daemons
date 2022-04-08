import { IChainInfo } from '../interfaces';

export const unsupportedChain: IChainInfo = {
    name: "Unsupported",
    id: "-1",
    hex: "0x00",
    defaultRPC: "",
    iconPath: "/icons/unknown.png",
    coinName: 'Ether',
    coinSymbol: 'ETH',
    coinDecimals: 18,
    explorerUrl: 'https://kovan.etherscan.io/',
    explorerTxUrl: 'https://kovan.etherscan.io/tx/',
    tokens: [],
    moneyMarket: { aTokens: {}, name: "Unsupported", supportedTokens: [], poolAddress: '' },
    actions: [],
};
