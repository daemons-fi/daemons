import { combineReducers } from "redux";
import { gasTankReducer } from './gas-tank-reducer';
import { historyReducer } from './history-reducer';
import { scriptReducer } from './script-reducer';
import { stakingReducer } from './staking-reducer';
import { walletReducer } from './wallet-reducer';
import { workbenchReducer } from "./workbench-reducer";


const reducers = combineReducers({
    script: scriptReducer,
    wallet: walletReducer,
    gasTank: gasTankReducer,
    staking: stakingReducer,
    history: historyReducer,
    workbench: workbenchReducer,
});

export default reducers;
