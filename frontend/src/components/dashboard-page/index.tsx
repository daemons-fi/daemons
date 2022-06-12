import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../state";
import { UnsupportedChainPage } from "../error-pages/unsupported-chain-page";
import "./styles.css";
import { UsersChart } from "./users-chart";
import {Chart, registerables } from 'chart.js';
import { ScriptsChart } from "./scripts-chart";
import { TransactionsChart } from "./transactions-chart";
import { TreasuryData } from "./treasury-data";
import { BannedPage } from "../error-pages/banned-page";
Chart.register(...registerables);


export function DashboardPage() {
    const banned: boolean = useSelector((state: RootState) => state.wallet.banned);
    const supportedChain: boolean = useSelector((state: RootState) => state.wallet.supportedChain);

    if (banned) return <BannedPage />;
    if (!supportedChain) return <UnsupportedChainPage />;

    return (
        <div className="dashboard-page">
            <div className="title">Dashboard</div>

            <div className="dashboard-page__layout">
                <div className="card">
                    <div className="card__title">Treasury</div>
                    <TreasuryData/>
                </div>

                <div className="card">
                    <div className="card__title">Scripts</div>
                    <ScriptsChart/>
                </div>

                <div className="card">
                    <div className="card__title">Users</div>
                    <UsersChart/>
                </div>

                <div className="card">
                    <div className="card__title">Transactions</div>
                    <TransactionsChart/>
                </div>
            </div>
        </div>
    );
}
