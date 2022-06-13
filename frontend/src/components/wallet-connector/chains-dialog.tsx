import React from 'react';
import { GetAvailableChains } from '../../data/chain-info';
import './chains-dialog.css';
import { IChainInfo } from '../../data/chains-data/interfaces';

export function availableChainsDialog(hideDialog: () => void, selectedChainId: string): JSX.Element | null {
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
