import { Dispatch } from 'redux';
import { BaseScript } from '../../data/script/base-script';
import { StorageProxy } from '../../data/storage-proxy';
import { ICurrentScript } from "../../script-factories/i-current-script";
import { ActionType } from '../action-types';
import { ScriptAction } from '../actions/script-actions';
import { WorkbenchAction } from "../actions/workbench-actions";


export const addScriptToWorkbench = (script: ICurrentScript) => {

    return async (dispatch: Dispatch<WorkbenchAction>) => {
        dispatch({
            type: ActionType.ADD_TO_WORKBENCH,
            payload: script,
        });
    };
};

export const cleanWorkbench = () => {
    return async (dispatch: Dispatch<WorkbenchAction>) => {
        dispatch({
            type: ActionType.CLEAN_WORKBENCH
        });
    };
};
