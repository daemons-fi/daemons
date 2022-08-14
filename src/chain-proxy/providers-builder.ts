import { ethers } from "ethers";
import { IContractsList, kovanContracts, mumbaiTestnetContracts } from "@daemons-fi/contracts";

export interface IChainWithContracts {
    id: string;
    name: string;
    rpc_url: () => string;
    contracts: IContractsList;
}

export const supportedChains: { [chain: string]: IChainWithContracts } = {
    "42": {
        id: "42",
        name: "kovan",
        rpc_url: () => process.env.KOVAN_RPC!,
        contracts: kovanContracts
    },
    "80001": {
        id: "80001",
        name: "Mumbai Testnet",
        rpc_url: () => process.env.MUMBAI_RPC!,
        contracts: mumbaiTestnetContracts
    }
};

export const getProvider = (chainId: string): ethers.providers.JsonRpcProvider => {
    const chainInfo = supportedChains[chainId];
    if (!chainInfo) throw new Error(`Chain ${chainId} does not seem to be supported`);
    return instantiateProvider(chainInfo.rpc_url());
};

const instantiateProvider = (rpcUrl: string): ethers.providers.JsonRpcProvider => {
    if (rpcUrl.startsWith("wss")) return new ethers.providers.WebSocketProvider(rpcUrl);
    return new ethers.providers.JsonRpcProvider(rpcUrl);
};
