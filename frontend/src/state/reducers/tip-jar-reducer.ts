import { ActionType } from "../action-types/index";
import { TipJarAction } from "../actions/tip-jar-actions";

export type TipJarState = {
    balance?: number;
};

const initialState: TipJarState = {};

export const tipJarReducer = (state: TipJarState = initialState, action: TipJarAction): TipJarState => {
    switch (action.type) {
        case ActionType.TIP_JAR_BALANCE:
            return {
                ...state,
                balance: action.balance,
            };
        default:
            return state;
    }
};
