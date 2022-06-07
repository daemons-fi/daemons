import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../state';


export function TipIndicator(): JSX.Element {
    const balance = useSelector((state: RootState) => state.tipJar.balance);
    const walletConnected = useSelector((state: RootState) => state.wallet.connected);
    const showBalance = balance !== undefined && walletConnected;

    return <div>Tip Jar: {showBalance ? balance : '??'} DAEM</div>;
}
