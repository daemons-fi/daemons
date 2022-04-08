import React from "react";
import {
    IBaseMMActionForm,
    IScriptActionForm,
    ISwapActionForm,
    ITransferActionForm,
    ScriptAction
} from "../../../../data/chains-data/action-form-interfaces";
import { IAction } from "../../../../data/chains-data/interfaces";
import { MmBaseAction } from "./mm-base-action";
import { SwapAction } from "./swap-action";
import { TransferAction } from "./transfer-action";

interface IActionBlockProps {
    action: IAction;
    onUpdate: (newForm: IScriptActionForm) => void;
    onRemove: () => void;
}

export const ActionBlock = ({ action, onUpdate, onRemove }: IActionBlockProps) => {
    const getContent = (actionForm: IScriptActionForm) => {
        switch (actionForm.type) {
            case ScriptAction.TRANSFER:
                return (
                    <TransferAction
                        form={actionForm as ITransferActionForm}
                        update={onUpdate}
                    />
                );

            case ScriptAction.SWAP:
                return (
                    <SwapAction
                        form={actionForm as ISwapActionForm}
                        update={onUpdate}
                    />
                );

            case ScriptAction.MMBASE:
                return (
                    <MmBaseAction
                        form={actionForm as IBaseMMActionForm}
                        update={onUpdate}
                    />
                );
        }
    };

    return (
        <div key={action.title} className="script-block">
            <div className="script-block__button-remove" onClick={onRemove}>
                x
            </div>
            <label className="script-block__title">{action.title}</label>
            {getContent(action.form)}
        </div>
    );
};
