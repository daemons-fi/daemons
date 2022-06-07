import { ActionType } from "../action-types/index";

export interface IFetchLatestGasPriceAction {
    type: ActionType.FETCH_LATEST_GAS_PRICE;
    price?: number;
}

export type GasPriceAction = IFetchLatestGasPriceAction;
