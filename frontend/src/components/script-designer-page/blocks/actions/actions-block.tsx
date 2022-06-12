import React from "react";
import {
    IAdvancedMMActionForm,
    IBaseMMActionForm,
    IScriptActionForm,
    ISwapActionForm,
    ITransferActionForm,
    IZapInActionForm,
    IZapOutActionForm,
    ScriptAction
} from "../../../../data/chains-data/action-form-interfaces";
import { IAction } from "../../../../data/chains-data/interfaces";
import { MmAdvAction } from "./mm-adv-action";
import { MmBaseAction } from "./mm-base-action";
import { SwapAction } from "./swap-action";
import { TransferAction } from "./transfer-action";
import { ZapInAction } from "./zap-in-action";
import { ZapOutAction } from "./zap-out-action";

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
                    <TransferAction form={actionForm as ITransferActionForm} update={onUpdate} />
                );

            case ScriptAction.SWAP:
                return <SwapAction form={actionForm as ISwapActionForm} update={onUpdate} />;

            case ScriptAction.MM_BASE:
                return <MmBaseAction form={actionForm as IBaseMMActionForm} update={onUpdate} />;

            case ScriptAction.MM_ADV:
                return <MmAdvAction form={actionForm as IAdvancedMMActionForm} update={onUpdate} />;

            case ScriptAction.ZAP_IN:
                return <ZapInAction form={actionForm as IZapInActionForm} update={onUpdate} />;

            case ScriptAction.ZAP_OUT:
                return <ZapOutAction form={actionForm as IZapOutActionForm} update={onUpdate} />;

            default:
                throw new Error(`Unrecognized action ${actionForm.type}`);
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
