import { IChainInfo } from '../interfaces';
import { AaveMMBaseAction, SwapAction, TransferAction } from './action-forms';
import { kovanAaveMM, kovanTokens } from './tokens';

export const kovanInfo: IChainInfo = {
    name: "Kovan",
    id: "42",
    hex: "0x2a",
    defaultRPC: "https://kovan.infura.io/v3/",
    iconPath: "/icons/kovan.jpg",
    coinName: 'Ether',
    coinSymbol: 'ETH',
    coinDecimals: 18,
    explorerUrl: 'https://kovan.etherscan.io/',
    explorerTxUrl: 'https://kovan.etherscan.io/tx/',
    tokens: kovanTokens,
    moneyMarket: kovanAaveMM,
    actions: [TransferAction, SwapAction, AaveMMBaseAction]
};
