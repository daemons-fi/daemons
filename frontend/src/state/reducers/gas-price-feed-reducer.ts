import { ActionType } from "../action-types/index";
import { GasPriceAction } from "../actions/gas-price-feed-actions";

export type GasPriceFeedState = {
    price?: number;
};

const initialState: GasPriceFeedState = {};

export const gasPriceFeedReducer = (
    state: GasPriceFeedState = initialState,
    action: GasPriceAction
): GasPriceFeedState => {
    switch (action.type) {
        case ActionType.FETCH_LATEST_GAS_PRICE:
            return {
                ...state,
                price: action.price
            };
        default:
            return state;
    }
};
