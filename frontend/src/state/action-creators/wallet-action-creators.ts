import { BigNumber, Contract, ethers } from "ethers";
import { Dispatch } from "redux";
import { GetCurrentChain, IsChainSupported } from "../../data/chain-info";
import { StorageProxy } from "../../data/storage-proxy";
import { ERC20Abi } from "@daemons-fi/abis";
import { ActionType } from "../action-types";
import { WalletAction } from "../actions/wallet-actions";
import { bigNumberToFloat } from "../../utils/big-number-to-float";

const getDAEMContract = async (chainId: string): Promise<Contract> => {
    const provider = new ethers.providers.Web3Provider((window as any).ethereum);

    if (!IsChainSupported(chainId)) throw new Error(`Chain ${chainId} is not supported!`);
    const DAEMAddress = GetCurrentChain(chainId).contracts.DAEMToken;

    return new ethers.Contract(DAEMAddress, ERC20Abi, provider);
};

export const updateWalletAddress = (
    connected: boolean,
    supportedChain: boolean,
    address?: string,
    chainId?: string
) => {
    return (dispatch: Dispatch<WalletAction>) => {
        dispatch({
            type: ActionType.WALLET_UPDATE,
            connected,
            address,
            chainId,
            supportedChain
        });
    };
};

export const authenticationCheck = (address?: string) => {
    return async (dispatch: Dispatch<WalletAction>) => {
        if (!address) {
            dispatch({
                type: ActionType.AUTH_CHECK,
                authenticated: false,
                banned: false
            });
            return;
        }

        const user = await StorageProxy.auth.checkAuthentication(address);
        if (!user) {
            // not authenticated
            dispatch({
                type: ActionType.AUTH_CHECK,
                authenticated: false,
                banned: false
            });
            return;
        }

        // authenticated
        dispatch({
            type: ActionType.AUTH_CHECK,
            authenticated: true,
            banned: user.banned
        });
    };
};

export const fetchDaemBalance = (address?: string, chainId?: string) => {
    return async (dispatch: Dispatch<WalletAction>) => {
        if (!address || !chainId) {
            console.log("Address or ChainId missing, DAEM balance check aborted");
            dispatch({
                type: ActionType.FETCH_DAEM_BALANCE,
                balance: 0
            });
            return;
        }

        console.log("Checking DAEM balance for", address);

        const DAEM = await getDAEMContract(chainId);
        const rawBalance: BigNumber = await DAEM.balanceOf(address);
        const balance = bigNumberToFloat(rawBalance);

        dispatch({
            type: ActionType.FETCH_DAEM_BALANCE,
            balance
        });
    };
};

export const fetchEthBalance = (address?: string, chainId?: string) => {
    return async (dispatch: Dispatch<WalletAction>) => {
        if (!address || !chainId) {
            console.log("Address or ChainId missing, ETH balance check aborted");
            dispatch({
                type: ActionType.FETCH_ETH_BALANCE,
                balance: 0
            });
            return;
        }

        console.log("Checking ETH balance for", address);

        const provider = new ethers.providers.Web3Provider((window as any).ethereum);
        const rawBalance: BigNumber = await provider.getBalance(address);
        const balance = bigNumberToFloat(rawBalance, 6);

        dispatch({
            type: ActionType.FETCH_ETH_BALANCE,
            balance
        });
    };
};
