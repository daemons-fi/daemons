import { ActionType } from "../action-types/index";

export interface ITipJarBalanceAction {
    type: ActionType.TIP_JAR_BALANCE;
    balance?: number;
}


export type TipJarAction = ITipJarBalanceAction;
