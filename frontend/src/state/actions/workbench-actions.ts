import { ICurrentScript } from "../../script-factories/i-current-script";
import { ActionType } from "../action-types/index";

export interface ICleanWorkbench {
    type: ActionType.CLEAN_WORKBENCH;
}

export interface IAddToWorkbench {
    type: ActionType.ADD_TO_WORKBENCH;
    payload: ICurrentScript;
}


export type WorkbenchAction = ICleanWorkbench | IAddToWorkbench;
