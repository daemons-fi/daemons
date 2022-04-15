import { combineReducers } from "redux";
import { gasTankReducer } from './gas-tank-reducer';
import { historyReducer } from './history-reducer';
import { scriptReducer } from './script-reducer';
import { stakingReducer } from './staking-reducer';
import { walletReducer } from './wallet-reducer';


const reducers = combineReducers({
    script: scriptReducer,
    wallet: walletReducer,
    gasTank: gasTankReducer,
    staking: stakingReducer,
    history: historyReducer,
});

export default reducers;
