import { ICurrentScript } from "../../script-factories/i-current-script";
import { ActionType } from "../action-types/index";
import { WorkbenchAction } from "../actions/workbench-actions";

export type WorkbenchState = {
    scripts: ICurrentScript[];
};

const initialState: WorkbenchState = {
    scripts: []
};

export const workbenchReducer = (
    state: WorkbenchState = initialState,
    action: WorkbenchAction
): WorkbenchState => {
    switch (action.type) {
        case ActionType.CLEAN_WORKBENCH:
            return {
                ...state,
                scripts: []
            };
        case ActionType.ADD_TO_WORKBENCH:
            const currentScripts = [...state.scripts];
            const newScript = JSON.parse(JSON.stringify(action.payload));
            currentScripts.push(newScript);
            return {
                ...state,
                scripts: currentScripts
            };
        default:
            return state;
    }
};
