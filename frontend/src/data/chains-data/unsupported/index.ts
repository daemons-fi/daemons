import { IContractsList } from "@daemons-fi/addresses/build";
import { IChainInfo } from '../interfaces';


const unsupportedContracts: IContractsList = {
    DEXRouter: '',

    GasTank: '',
    DAEMToken: '',
    Treasury: '',
    GasPriceFeed: '',
    PriceRetriever: '',

    SwapExecutor: '',
    TransferExecutor: '',
    MmBaseExecutor: '',
    MmAdvancedExecutor: '',
};

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
    contracts: unsupportedContracts,
    actions: [],
};
