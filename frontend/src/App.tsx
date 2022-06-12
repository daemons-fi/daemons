import React, { useEffect } from "react";
import { ConnectWalletButton } from "./components/wallet-connector";
import { MetaMaskProvider } from "metamask-react";
import { Link } from "react-router-dom";
import logo from "./assets/logo.svg";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "./state";
import { GasIndicator } from "./components/gas-indicator";
import { fetchUserScripts } from "./state/action-creators/script-action-creators";
import { fetchGasTankBalance } from "./state/action-creators/gas-tank-action-creators";
import { fetchGasTankClaimable } from "./state/action-creators/gas-tank-action-creators";
import { fetchUserHistory } from "./state/action-creators/transactions-action-creators";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./constants.css";
import "./app.css";
import { fetchTipJarBalance } from "./state/action-creators/tip-jar-action-creators";
import { TipIndicator } from "./components/tip-indicator";
import { fetchLatestGasPrice } from "./state/action-creators/gas-price-feed-action-creators";
import { fetchDAEMPriceInEth } from "./state/action-creators/prices-action-creators";
import { fetchDaemBalance, fetchEthBalance } from "./state/action-creators/wallet-action-creators";

export const App = ({ children }: { children: any }) => {
    // redux
    const dispatch = useDispatch();
    const chainId: string | undefined = useSelector((state: RootState) => state.wallet.chainId);
    const walletAddress: string | undefined = useSelector(
        (state: RootState) => state.wallet.address
    );
    const authenticated: boolean = useSelector((state: RootState) => state.wallet.authenticated);
    const supportedChain: boolean = useSelector((state: RootState) => state.wallet.supportedChain);

    // menu selection classes
    const dashboardLinkClassName = `menu__entry ${
        document.location.href.endsWith("/") ? "menu__entry--selected" : ""
    }`;
    const myPageLinkClassName = `menu__entry ${
        document.location.href.endsWith("/my-page") ? "menu__entry--selected" : ""
    }`;
    const executeLinkClassName = `menu__entry ${
        document.location.href.endsWith("/execute") ? "menu__entry--selected" : ""
    }`;

    useEffect(() => {
        if (authenticated && walletAddress && supportedChain) {
            dispatch(fetchUserScripts(chainId, walletAddress));
            dispatch(fetchGasTankBalance(walletAddress, chainId));
            dispatch(fetchGasTankClaimable(walletAddress, chainId));
            dispatch(fetchTipJarBalance(walletAddress, chainId));
            dispatch(fetchUserHistory(chainId, walletAddress));
            dispatch(fetchDaemBalance(walletAddress, chainId));
            dispatch(fetchEthBalance(walletAddress, chainId));
        }

        // these values do not depend on the user and can be fetched anyway
        if (supportedChain) {
            dispatch(fetchDAEMPriceInEth(chainId));
            dispatch(fetchLatestGasPrice(chainId));
        }
    }, [chainId, walletAddress, authenticated]);

    return (
        <div>
            <ToastContainer />
            <div className="header">
                <img src={logo} alt="Daemons logo" className="page-logo" />
                {authenticated && (
                    <div className="menu">
                        <Link className={dashboardLinkClassName} to="/">
                            Dashboard
                        </Link>
                        <Link className={myPageLinkClassName} to="/my-page">
                            My Page
                        </Link>
                        <Link className={executeLinkClassName} to="/execute">
                            Execute
                        </Link>
                    </div>
                )}

                <div className="menu__entry menu__entry--tip">
                    <TipIndicator />
                </div>
                <div className="menu__entry menu__entry--gas">
                    <GasIndicator />
                </div>
                <div className="wallet-control">
                    <MetaMaskProvider>
                        {" "}
                        <ConnectWalletButton />{" "}
                    </MetaMaskProvider>
                </div>
            </div>

            <div className="page">{children}</div>
        </div>
    );
};
