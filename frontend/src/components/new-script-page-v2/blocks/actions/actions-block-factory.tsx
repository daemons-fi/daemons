
import React from 'react';
import { IBaseMMActionForm, IScriptActionForm, ISwapActionForm, ITransferActionForm, ScriptAction } from '../../../../data/chains-data/action-form-interfaces';
import { IAction } from '../../../../data/chains-data/interfaces';
import { ActionBlockContainer } from './action-block';
import { MmBaseAction } from './mm-base-action';
import { SwapAction } from './swap-action';
import { TransferAction } from './transfer-action';


export const ActionBlock = ({ action }: { action: IAction; }) => {
    const actionForm = action.toActionForm();

    const getContent = (actionForm: IScriptActionForm) => {
        switch (actionForm.type) {
            case ScriptAction.TRANSFER:
                return <TransferAction
                    form={actionForm as ITransferActionForm}
                    update={(form) => { }}
                />;

            case ScriptAction.SWAP:
                return <SwapAction
                    form={actionForm as ISwapActionForm}
                    update={(form) => { }}
                />;

            case ScriptAction.MMBASE:
                return <MmBaseAction
                    form={actionForm as IBaseMMActionForm}
                    update={(form) => { }}
                />;
        }
    };

    return (
        <ActionBlockContainer
            title={action.title}
            enabled={true}
            toggleEnabled={() => { }}
        >
            {getContent(actionForm)}
        </ActionBlockContainer>
    );
};
