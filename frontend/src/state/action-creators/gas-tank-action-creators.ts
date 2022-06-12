import { Dispatch } from "redux";
import { ActionType } from "../action-types";
import { gasTankABI } from "@daemons-fi/abis";
import { GasTankAction } from "../actions/gas-tank-actions";
import { BigNumber, Contract } from "ethers";
import { GetCurrentChain, IsChainSupported } from "../../data/chain-info";
import { bigNumberToFloat } from "../../utils/big-number-to-float";

const getGasTankContract = async (chainId: string): Promise<Contract> => {
    const ethers = require("ethers");
    const provider = new ethers.providers.Web3Provider((window as any).ethereum);

    if (!IsChainSupported(chainId)) throw new Error(`Chain ${chainId} is not supported!`);
    const contractAddress = GetCurrentChain(chainId).contracts.GasTank;

    return new ethers.Contract(contractAddress, gasTankABI, provider);
};

export const fetchGasTankBalance = (address?: string, chainId?: string) => {
    return async (dispatch: Dispatch<GasTankAction>) => {
        if (!address || !chainId) {
            console.log("Address or chainId missing, balance check aborted");
            dispatch({
                type: ActionType.GAS_TANK_BALANCE,
                balance: undefined
            });
            return;
        }

        console.log("Checking balance in gas tank for", address);

        const gasTank = await getGasTankContract(chainId);
        const rawBalance: BigNumber = await gasTank.gasBalanceOf(address);
        const balance = bigNumberToFloat(rawBalance);

        dispatch({
            type: ActionType.GAS_TANK_BALANCE,
            balance
        });
    };
};

export const fetchGasTankClaimable = (address?: string, chainId?: string) => {
    return async (dispatch: Dispatch<GasTankAction>) => {
        if (!address || !chainId) {
            console.log("Address or chainId missing, balance check aborted");
            dispatch({
                type: ActionType.GAS_TANK_CLAIMABLE,
                balance: undefined
            });
            return;
        }

        console.log("Checking claimable DAEM for", address);

        const gasTank = await getGasTankContract(chainId);
        const rawBalance: BigNumber = await gasTank.claimable(address);
        const balance = bigNumberToFloat(rawBalance);

        dispatch({
            type: ActionType.GAS_TANK_CLAIMABLE,
            balance
        });
    };
};

export const setGasTankClaimableToZero = () => {
    return async (dispatch: Dispatch<GasTankAction>) => {
        dispatch({
            type: ActionType.GAS_TANK_CLAIMABLE,
            balance: 0
        });
    };
};
