import { ethers } from "ethers";
import { BaseProvider } from "@ethersproject/providers";
import { fantomTestnetContracts, kovanContracts } from "@daemons-fi/addresses/build";
import { IContractsList } from "@daemons-fi/addresses/build";

export interface IChainWithContracts {
    id: string;
    name: string;
    rpc_url: () => string;
    contracts: IContractsList;
}

/**
 * The chains currently supported by Daemons
 */
export const supportedChains: { [chain: string]: IChainWithContracts } = {
    "42": {
        id: "42",
        name: "kovan",
        rpc_url: () => process.env.KOVAN_RPC!,
        contracts: kovanContracts
    },
    "4002": {
        id: "4002",
        name: "Fantom Testnet",
        rpc_url: () => process.env.FANTOM_TESTNET_RPC!,
        contracts: fantomTestnetContracts
    }
};

const providers: { [chainId: string]: ethers.providers.Provider } = {};

/**
 * Get a provider. If one has already been instantiated for this chain, it will use that.
 * @param chainId The chain the provider should be connected to.
 */
export const getProvider = (chainId: string): ethers.providers.Provider => {
    if (!providers[chainId]) {
        const chainInfo = supportedChains[chainId];
        if (!chainInfo) throw new Error(`Chain ${chainId} does not seem to be supported`);
        providers[chainId] = instantiateProvider(chainInfo.rpc_url());
    }
    return providers[chainId];
};

const instantiateProvider = (rpcUrl: string): BaseProvider => {
    if (rpcUrl.startsWith("wss")) return new ethers.providers.WebSocketProvider(rpcUrl);
    return new ethers.providers.JsonRpcProvider(rpcUrl);
};
