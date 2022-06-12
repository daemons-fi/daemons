import { kovanContracts } from "@daemons-fi/addresses/build";
import { IChainInfo } from '../interfaces';
import { AaveMMAdvancedAction, AaveMMBaseAction, SwapAction, TransferAction, ZapInAction, ZapOutAction } from './action-forms';
import { kovanTokens } from './tokens';


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
    contracts: kovanContracts,
    actions: [TransferAction, SwapAction, AaveMMBaseAction, AaveMMAdvancedAction, ZapInAction, ZapOutAction],
};
