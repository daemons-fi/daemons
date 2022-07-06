import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../state";
import { DisconnectedPage } from "../error-pages/disconnected-page";
import { UnsupportedChainPage } from "../error-pages/unsupported-chain-page";
import { BannedPage } from "../error-pages/banned-page";
import { NotWhitelistedPage } from "../error-pages/not-whitelisted-page";
import { Card } from "../card-component/card";
import { TransactionsPanel } from "./transactions-panel";
import "./styles.css";
import "../shared.css";
import { TransactionProxy } from "../../data/storage-proxy/transaction-proxy";
import { ITransaction } from "@daemons-fi/shared-definitions";

export function TransactionsPage(): JSX.Element {
    const authenticated: boolean = useSelector((state: RootState) => state.wallet.authenticated);
    const banned: boolean = useSelector((state: RootState) => state.wallet.banned);
    const whitelisted: boolean = useSelector((state: RootState) => state.wallet.whitelisted);
    const supportedChain: boolean = useSelector((state: RootState) => state.wallet.supportedChain);
    const userWallet = useSelector((state: RootState) => state.wallet.address);
    const chainId = useSelector((state: RootState) => state.wallet.chainId);

    const [userTransactions, setUserTransactions] = useState<ITransaction[]>([]);
    const [userTransactionsLoading, setUserTransactionsLoading] = useState<boolean>(false);
    const [userTransactionsLocked, setUserTransactionsLocked] = useState<boolean>(false);

    const [executedTransactions, setExecutedTransactions] = useState<ITransaction[]>([]);
    const [executedTransactionsLoading, setExecutedTransactionsLoading] = useState<boolean>(false);
    const [executedTransactionsLocked, setExecutedTransactionsLocked] = useState<boolean>(false);

    const fetchUserTransactions = async (useCache: boolean = true): Promise<void> => {
        setUserTransactionsLoading(true);
        const txs = await TransactionProxy.fetchUserTransactions(chainId, userWallet, useCache);
        setUserTransactions(txs);
        setUserTransactionsLoading(false);
    };

    const fetchExecutedTransactions = async (useCache: boolean = true): Promise<void> => {
        setExecutedTransactionsLoading(true);
        const txs = await TransactionProxy.fetchExecutedTransactions(chainId, userWallet, useCache);
        setExecutedTransactions(txs);
        setExecutedTransactionsLoading(false);
    };

    const reloadUserTransactions = async () => {
        if (userTransactionsLocked) return;
        await fetchUserTransactions(false);
        setUserTransactionsLocked(true);
        setTimeout(() => setUserTransactionsLocked(false), 5000);
    };

    const reloadExecutedTransactions = async () => {
        if (executedTransactionsLocked) return;
        await fetchExecutedTransactions(false);
        setExecutedTransactionsLocked(true);
        setTimeout(() => setExecutedTransactionsLocked(false), 5000);
    };

    useEffect(() => {
        if (chainId && userWallet) {
            fetchUserTransactions();
            fetchExecutedTransactions();
        }
    }, [chainId, userWallet]);

    if (banned) return <BannedPage />;
    if (!whitelisted) return <NotWhitelistedPage />;
    if (!authenticated) return <DisconnectedPage />;
    if (!supportedChain) return <UnsupportedChainPage />;

    const actionComponent = (reloadTransactions: () => {}, loading: boolean): JSX.Element => (
        <div className="card__action-button" onClick={reloadTransactions}>
            Reload list
            <div
                className={
                    "queue-container__reload-bt " +
                    (loading ? "queue-container__reload-bt--loading" : "")
                }
            />
        </div>
    );

    return (
        <div className="transactions-page">
            <div className="page-title">Transactions</div>

            <div className="transaction-page__layout">
                <div className="transaction-page__left-panel">
                    <Card
                        title="Transactions as beneficiary"
                        iconClass="card__title-icon--transactions"
                        actionComponent={actionComponent(
                            reloadUserTransactions,
                            userTransactionsLoading
                        )}
                    >
                        <TransactionsPanel transactions={userTransactions} chainId={chainId} />
                    </Card>
                </div>
                <div className="transaction-page__right-panel">
                    <Card
                        title="Transactions as executor"
                        iconClass="card__title-icon--transactions"
                        actionComponent={actionComponent(
                            reloadExecutedTransactions,
                            executedTransactionsLoading
                        )}
                    >
                        <TransactionsPanel transactions={executedTransactions} chainId={chainId} />
                    </Card>
                </div>
            </div>
        </div>
    );
}
