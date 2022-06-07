import { Dispatch } from 'redux';
import { ActionType } from '../action-types';
import { treasuryABI } from "@daemons-fi/abis";
import { BigNumber, Contract } from 'ethers';
import { StakingAction } from '../actions/staking-actions';
import { GetCurrentChain, IsChainSupported } from "../../data/chain-info";
import { bigNumberToFloat } from "../../utils/big-number-to-float";

const getTreasuryContract = async (chainId: string): Promise<Contract> => {
    const ethers = require('ethers');
    const provider = new ethers.providers.Web3Provider((window as any).ethereum);

    if (!IsChainSupported(chainId)) throw new Error(`Chain ${chainId} is not supported!`);
    const contractAddress = GetCurrentChain(chainId).contracts.Treasury;

    return new ethers.Contract(contractAddress, treasuryABI, provider);
};

export const fetchStakingBalance = (address?: string, chainId?: string) => {

    return async (dispatch: Dispatch<StakingAction>) => {
        if (!address || !chainId) {
            console.log('Address or ChainId missing, staking balance check aborted');
            dispatch({
                type: ActionType.STAKING_BALANCE,
                balance: undefined,
            });
            return;
        }

        console.log('Checking staking balance for', address);

        const treasury = await getTreasuryContract(chainId);
        const rawBalance: BigNumber = await treasury.balanceOf(address);
        const balance = bigNumberToFloat(rawBalance);

        dispatch({
            type: ActionType.STAKING_BALANCE,
            balance,
        });
    };
};

export const fetchStakingClaimable = (address?: string, chainId?: string) => {

    return async (dispatch: Dispatch<StakingAction>) => {
        if (!address || !chainId) {
            console.log('Address or ChainId missing, staking claimable check aborted');
            dispatch({
                type: ActionType.STAKING_CLAIMABLE,
                balance: undefined,
            });
            return;
        }

        console.log('Checking claimable staking reward for', address);

        const treasury = await getTreasuryContract(chainId);
        const rawBalance: BigNumber = await treasury.earned(address);
        const balance = bigNumberToFloat(rawBalance);

        dispatch({
            type: ActionType.STAKING_CLAIMABLE,
            balance,
        });
    };
};
