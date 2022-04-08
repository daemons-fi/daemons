import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { store } from './state';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { App } from './App';
import { NewScriptPage } from './components/new-script-page';
import { DashboardPage } from './components/dashboard-page';
import { MyPage } from './components/my-page';
import { ExecutePage } from './components/execute-page';
import { ScriptDesignerPage } from "./components/new-script-page-v2";

ReactDOM.render(
    <Provider store={store}>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<App><DashboardPage /></App>} />
                <Route path="my-page" element={<App><MyPage /></App>} />
                <Route path="new-script" element={<App><ScriptDesignerPage /></App>} />
                <Route path="execute" element={<App><ExecutePage /></App>} />
            </Routes>
        </BrowserRouter>
    </Provider>,
    document.getElementById('app-root'));
