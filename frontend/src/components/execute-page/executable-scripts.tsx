import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BaseScript } from '@daemons-fi/scripts-definitions';
import { RootState } from '../../state';
import { fetchExecutableScripts, toggleScriptsLoading } from '../../state/action-creators/script-action-creators';
import { QueueScriptComponent } from './executable-script';
import './styles.css';


export function ExecutableScriptsContainer() {
    const dispatch = useDispatch();
    const chainId = useSelector((state: RootState) => state.wallet.chainId);
    const fetchedScripts = useSelector((state: RootState) => state.script.allScripts);
    const loading = useSelector((state: RootState) => state.script.loading);
    const [scriptsChain, setScriptsChain] = useState<string>('');

    const reloadScripts = async () => {
        dispatch(toggleScriptsLoading());
        dispatch(fetchExecutableScripts(chainId));
    };

    useEffect(() => {
        if (fetchedScripts.length === 0 || scriptsChain !== chainId) {
            reloadScripts();
            setScriptsChain(chainId!);
        }
    }, [chainId]);


    const scripts = fetchedScripts.map((script: BaseScript) => (
        <QueueScriptComponent key={script.getId()} script={script} />
    ));
    return (
        <>
            <div className='card__header'>
                <div className='card__title-icon'></div>
                <div className='card__title'>Executable Scripts</div>
                <div className='card__reload' onClick={reloadScripts}>
                    Reload list
                    <div className={'queue-container__reload-bt ' + (loading ? 'queue-container__reload-bt--loading' : '')} />
                </div>
            </div>
            <div className='card'>
                <div className='card__subtitle'>Execute scripts and get rewarded in DAEM tokens</div>

                <div className="queue-container">
                    {scripts}
                </div>
            </div>
        </>
    );
}
