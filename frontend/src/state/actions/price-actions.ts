import { ActionType } from "../action-types/index";

export interface IDaemPriceInEth {
    type: ActionType.FETCH_DAEM_ETH_PRICE;
    price?: number;
}

export type PriceAction = IDaemPriceInEth;
