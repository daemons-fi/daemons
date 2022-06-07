import { ActionType } from "../action-types/index";
import { PriceAction } from "../actions/price-actions";

export type PricesState = {
    DAEMPriceInEth?: number;
};

const initialState: PricesState = {};

export const pricesReducer = (
    state: PricesState = initialState,
    action: PriceAction
): PricesState => {
    switch (action.type) {
        case ActionType.FETCH_DAEM_ETH_PRICE:
            return {
                ...state,
                DAEMPriceInEth: action.price
            };
        default:
            return state;
    }
};
