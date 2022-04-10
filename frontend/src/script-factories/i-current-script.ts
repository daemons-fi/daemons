import { IAction, ICondition } from "../data/chains-data/interfaces";

/**
 * Wrapper containing actions and conditions.
 * --> Used as state <--
 */
 export interface ICurrentScript {
    action: IAction;
    conditions: { [title: string]: ICondition };
}
