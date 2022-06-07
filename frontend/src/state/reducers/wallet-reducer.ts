import { ActionType } from "../action-types/index";
import { WalletAction } from "../actions/wallet-actions";

export type WalletState = {
    connected: boolean;
    address?: string;
    chainId?: string;
    authenticated: boolean;
    supportedChain: boolean;
    DAEMBalance: number;
    ETHBalance: number;
};

const initialState: WalletState = {
    connected: false,
    authenticated: false,
    supportedChain: false,
    DAEMBalance: 0,
    ETHBalance: 0
};

export const walletReducer = (
    state: WalletState = initialState,
    action: WalletAction
): WalletState => {
    switch (action.type) {
        case ActionType.WALLET_UPDATE:
            return {
                ...state,
                connected: action.connected,
                address: action.address,
                chainId: action.chainId,
                supportedChain: action.supportedChain
            };
        case ActionType.AUTH_CHECK:
            return {
                ...state,
                authenticated: action.authenticated
            };
        case ActionType.FETCH_DAEM_BALANCE:
            return {
                ...state,
                DAEMBalance: action.balance
            };
        case ActionType.FETCH_ETH_BALANCE:
            return {
                ...state,
                ETHBalance: action.balance
            };
        default:
            return state;
    }
};
