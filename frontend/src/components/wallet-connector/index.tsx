import React, { Dispatch, useEffect, useState } from 'react';
import { useMetaMask } from "metamask-react";
import { authenticationCheck, updateWalletAddress } from '../../state/action-creators/wallet-action-creators';
import { useDispatch, useSelector } from 'react-redux';
import { BigNumber } from 'ethers';
import Modal from "react-modal";
import { RootState } from '../../state';
import { StorageProxy } from '../../data/storage-proxy';
import { GetAvailableChains, GetCurrentChain, IsChainSupported } from '../../data/chain-info';
import './styles.css';
import { IChainInfo } from '../../data/chains-data/interfaces';
import { INotification, NotificationProxy } from '../../data/storage-proxy/notification-proxy';

const modalStyles: any = {
    content: {
        width: "400px",
        borderRadius: "32px",
        transform: "translateX(-50%)",
        left: "50%",
        height: "fit-content",
        maxHeight: "80vh",
        padding: "25px",
        boxShadow: "0 6px 4px 0 rgba(0, 0, 0, 0.19)",
        overflow: "hidden"
    },
};

export function ConnectWalletButton() {
    const dispatch = useDispatch();
    const { status, connect, account, chainId } = useMetaMask();

    const connected = status === 'connected';
    const walletAddress = connected ? account! : undefined;
    const walletChainId = connected ? BigNumber.from(chainId!).toString() : undefined; // convert from hex to decimal string
    const supportedChain = !!walletChainId && IsChainSupported(walletChainId);

    useEffect(() => {
        // update the state and check for authentication each time there is a change
        dispatch(updateWalletAddress(connected, supportedChain, walletAddress, walletChainId));
        dispatch(authenticationCheck(walletAddress));
    }, [status, connected, walletAddress, walletChainId]);

    switch (status) {
        case "initializing":
            return <div>Syncing...</div>;
        case "unavailable":
            return <div>MetaMask not available :(</div>;
        case "connecting":
            return <div>Connecting...</div>;
        case "notConnected":
            return <div className="wallet-control__connect-bt" onClick={connect}>Connect to MetaMask</div>;
        case "connected":
            return <ConnectedWalletComponent walletAddress={walletAddress} chainId={walletChainId} />;
        default:
            console.error(`Unknown state '${status}'`);
            return null;
    }
}

function ConnectedWalletComponent({ walletAddress, chainId }: any): JSX.Element | null {
    const dispatch = useDispatch();
    const address = walletAddress!.substring(0, 16) + "...";
    const authenticated: boolean = useSelector((state: RootState) => state.wallet.authenticated);
    const chainInfo = GetCurrentChain(chainId);
    const [displayChains, setDisplayChains] = useState<boolean>(false);
    const [notifications, setNotifications] = useState<INotification[]>([]);
    const [displayNotifications, setDisplayNotifications] = useState<boolean>(false);

    const getNotifications = async (): Promise<void> => {
        const fetchNotificationsRes = await NotificationProxy.fetchNotifications();
        setNotifications(fetchNotificationsRes)
    }

    useEffect(() => {
        getNotifications();
        setInterval(
            getNotifications,
            300000
        );
    }, []);

    return (
        <div className='wallet-connector'>
            <div className='wallet-connector__chain'>
                <img className='wallet-connector__chain-image'
                    src={chainInfo.iconPath}
                    onClick={() => setDisplayChains(!displayChains)}
                />
                {displayChains &&
                    <Modal
                        isOpen={displayChains}
                        onRequestClose={() => setDisplayChains(false)}
                        style={modalStyles}
                        ariaHideApp={false}
                    >
                        {availableChainsDialog(() => setDisplayChains(false), chainInfo.id)}
                    </Modal>}
            </div>

            {
                authenticated
                    ? (
                        <div className='wallet-connector__address'>
                            {address}
                            {
                                notifications.length > 0 &&
                                <div
                                    className='wallet-connector__address-notification'
                                    onClick={() => setDisplayNotifications(!displayNotifications)}>

                                </div>
                            }
                            {displayNotifications &&
                                <Modal
                                    isOpen={displayNotifications}
                                    onRequestClose={() => setDisplayNotifications(false)}
                                    style={modalStyles}
                                    ariaHideApp={false}
                                >
                                    {availableNotifications(
                                        () => setDisplayNotifications(false),
                                        notifications,
                                        getNotifications
                                    )}
                                </Modal>}
                        </div>
                    )
                    : (
                        <div className='wallet-connector__address wallet-connector__address--unauthenticated'
                            onClick={() => triggerLogin(walletAddress, dispatch)}>
                            <div>{address}</div>
                            <div>Authenticate</div>
                        </div>
                    )
            }
        </div >
    );
}


function availableChainsDialog(hideDialog: () => void, selectedChainId: string): JSX.Element | null {
    const chainComponent = (chain: IChainInfo): JSX.Element => {
        return (
            <div key={chain.hex} className={`chains-dialog__chain-entry ${selectedChainId === chain.id ? 'chains-dialog__chain-entry--selected' : ''}`}
                onClick={() => {
                    promptChainChange(chain);
                    hideDialog();
                }}
            >
                <img className='wallet-connector__chain-image' src={chain.iconPath}></img>
                <div className='chains-dialog__chain-name'>{chain.name}</div>
            </div>
        );
    };

    const chains = GetAvailableChains();
    return (
        <div className='chains-dialog'>
            <div className='chains-dialog__header'>
                <div className='chains-dialog__title'>Select a network</div>
                <div className='chains-dialog__close'
                    onClick={() => {
                        hideDialog();
                    }}></div>
            </div>
            <div className='chains-dialog__body'>
                {chains.map(chainComponent)}
            </div>
        </div>
    );
}

function availableNotifications(hideDialog: () => void, notifications: INotification[], getNotifications: () => void): JSX.Element {
    const notificationsComponent = (notification: INotification): JSX.Element => {
        return (
            <div key={notification._id} className='notification-dialog__notification-entry'
                onClick={() => {
                    hideDialog();
                }}
            >
                <div className='notification-dialog__notification-date'>{notification.date}</div>
                <div className='notification-dialog__notification-title'>{notification.title}</div>
                <div className='notification-dialog__notification-name'>{notification.description}</div>
            </div>
        );
    };

    return (
        <div className='notifications-dialog'>
            <div className='notifications-dialog__header'>
                <button className='notifications-dialog__clear'
                    onClick={async () => {
                        await NotificationProxy.deleteNotifications();
                        getNotifications()
                        hideDialog();
                    }}
                >Mark all as read"</button>
                <div className='notifications-dialog__close'
                    onClick={() => {
                        hideDialog();
                    }}></div>
            </div>
            <div className='notifications-dialog__body'>
                {notifications.map(notificationsComponent)}
            </div>
        </div>
    );
}

async function triggerLogin(walletAddress: string, dispatch: Dispatch<any>): Promise<void> {
    const message = await StorageProxy.auth.getLoginMessage(walletAddress);
    const signedMessage = await getSignature(message);
    await StorageProxy.auth.login(walletAddress, signedMessage);
    dispatch(authenticationCheck(walletAddress));
}

async function getSignature(message: string): Promise<any> {
    const ethers = require('ethers');
    const provider = new ethers.providers.Web3Provider((window as any).ethereum);
    const signer = provider.getSigner();
    const signature = await signer.signMessage(message);
    return signature;
}

async function promptChainChange(chain: IChainInfo): Promise<void> {
    const switchChain = async () => {
        await (window as any).ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: chain.hex }]
        });
    };

    const addChain = async () => {
        await (window as any).ethereum.request({
            method: "wallet_addEthereumChain",
            params: [{
                chainId: chain.hex,
                rpcUrls: [chain.defaultRPC],
                chainName: chain.name,
                nativeCurrency: {
                    name: chain.coinName,
                    symbol: chain.coinSymbol,
                    decimals: chain.coinDecimals
                },
                blockExplorerUrls: [chain.explorerUrl]
            }]
        });
    };

    try {
        await switchChain();
    } catch (switchError: any) {
        if (switchError.code === 4902) {
            await addChain();
        } else {
            throw switchError;
        }
    }
}
