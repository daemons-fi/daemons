import { Dispatch } from 'redux';
import { ActionType } from '../action-types';
import { gasPriceFeedABI } from "@daemons-fi/abis";
import { BigNumber, Contract } from 'ethers';
import { GetCurrentChain, IsChainSupported } from "../../data/chain-info";
import { GasPriceAction } from "../actions/gas-price-feed-actions";

const getGasPriceFeedContract = async (chainId: string): Promise<Contract> => {
    const ethers = require('ethers');
    const provider = new ethers.providers.Web3Provider((window as any).ethereum);

    if (!IsChainSupported(chainId)) throw new Error(`Chain ${chainId} is not supported!`);
    const contractAddress = GetCurrentChain(chainId).contracts.GasPriceFeed;

    return new ethers.Contract(contractAddress, gasPriceFeedABI, provider);
};

export const fetchLatestGasPrice = (chainId?: string) => {

    return async (dispatch: Dispatch<GasPriceAction>) => {
        if (!chainId) {
            console.log('ChainId missing, retrieving latest gas price aborted');
            dispatch({
                type: ActionType.FETCH_LATEST_GAS_PRICE,
                price: undefined,
            });
            return;
        }

        console.log('Retrieving latest gas price for chain', chainId);
        const gasPriceFeed = await getGasPriceFeedContract(chainId);
        const rawPrice: BigNumber = await gasPriceFeed.lastGasPrice();
        const price = rawPrice.toNumber();

        dispatch({
            type: ActionType.FETCH_LATEST_GAS_PRICE,
            price,
        });
    };
};
