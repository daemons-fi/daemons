import React, { useEffect, useState } from "react";
import { RootState } from "../../state";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { IAction, ICondition, IToken } from "../../data/chains-data/interfaces";
import { GetCurrentChain } from "../../data/chain-info";
import { ActionBlock } from "./blocks/actions/actions-block";
import "./styles.css";
import "./blocks.css";
import "./killme-styles.css";
import "../tooltip.css";
import { ConditionBlock } from "./blocks/conditions/conditions-block";
import { IScriptActionForm } from "../../data/chains-data/action-form-interfaces";
import { IScriptConditionForm } from "../../data/chains-data/condition-form-interfaces";
import { StorageProxy } from "../../data/storage-proxy";
import { addNewScript } from "../../state/action-creators/script-action-creators";
import { ICurrentScript } from "../../script-factories/i-current-script";
import { ScriptFactory } from "../../script-factories";

export function ScriptDesignerPage(): JSX.Element {
    // redux
    const dispatch = useDispatch();
    const chainId: string | undefined = useSelector((state: RootState) => state.wallet.chainId);
    const authenticated: boolean = useSelector((state: RootState) => state.wallet.authenticated);
    const supportedChain: boolean = useSelector((state: RootState) => state.wallet.supportedChain);
    const tokens: IToken[] = useSelector((state: RootState) => state.tokens.currentChainTokens);

    // states
    const [redirect, setRedirect] = useState<boolean>(false);
    const [actions, setActions] = useState<IAction[]>([]);
    const [conditions, setConditions] = useState<ICondition[]>([]);
    const [currentScript, _setCurrentScript] = useState<ICurrentScript | undefined>();

    useEffect(() => {
        setActions(GetCurrentChain(chainId!).actions);
    }, [chainId]);

    useEffect(() => {
        const currentAction: IAction | undefined = actions.find(
            (action) => action.title === currentScript?.action.title
        );
        setConditions(currentAction?.conditions ?? []);
    }, [currentScript]);

    const setCurrentScript = (action: IAction) => {
        if (currentScript && currentScript.action.title === action.title) return;
        const actionCopy = { ...action };
        _setCurrentScript({ action: actionCopy, conditions: {} });
    };

    // Actions handlers
    const cleanAction = () => _setCurrentScript(undefined);
    const updateActionForm = (newForm: IScriptActionForm) => {
        if (!currentScript) return;
        if (currentScript.action.form.type !== newForm.type) throw new Error("Incompatible forms");
        _setCurrentScript({ ...currentScript, action: { ...currentScript.action, form: newForm } });
    };

    // Conditions handlers
    const addCondition = (condition: ICondition) => {
        if (!currentScript) return;
        if (!!currentScript.conditions[condition.title]) return;
        const copiedConditions = { ...currentScript.conditions };
        copiedConditions[condition.title] = { ...condition };
        _setCurrentScript({ ...currentScript, conditions: copiedConditions });
    };
    const removeCondition = (conditionTitle: string) => {
        if (!currentScript) return;
        if (!currentScript.conditions[conditionTitle]) return;
        const copiedConditions = { ...currentScript.conditions };
        delete copiedConditions[conditionTitle];
        _setCurrentScript({ ...currentScript, conditions: copiedConditions });
    };
    const updateConditionForm = (conditionTitle: string, newForm: IScriptConditionForm) => {
        if (!currentScript) return;
        if (!currentScript.conditions[conditionTitle]) return;
        const conditionToUpdate = currentScript.conditions[conditionTitle];
        if (conditionToUpdate.form.type !== newForm.type) throw new Error("Incompatible forms");
        conditionToUpdate.form = newForm;
        const copiedConditions = { ...currentScript.conditions };
        copiedConditions[conditionTitle] = conditionToUpdate;
        _setCurrentScript({ ...currentScript, conditions: copiedConditions });
    };

    const createAndSignScript = async () => {
        if (!chainId) throw new Error("Cannot create the script! The chain is unknown");
        if (!currentScript) throw new Error("Cannot create the script! Current script is empty");

        const scriptFactory = new ScriptFactory(chainId, tokens);
        const script = await scriptFactory.SubmitScriptsForSignature(currentScript);
        if (!await script.hasAllowance()) {
            await script.requestAllowance();
        }
        await StorageProxy.script.saveScript(script);
        dispatch(addNewScript(script));
        setRedirect(true);
    };

    const buttonDisabled = () => {
        if (!currentScript) return true;
        if (!currentScript.action.form.valid) return true;
        return Object.values(currentScript.conditions).some((condition) => !condition.form.valid);
    };

    const shouldRedirect = redirect || !authenticated || !supportedChain;
    if (shouldRedirect) return <Navigate to="/my-page" />;

    return (
        <div className="designer">
            {/* List of actions and conditions */}
            <div className="designer__choices">
                <div className="designer__choices-section">
                    <div className="designer__choices-title">Actions</div>
                    <div className="designer__choices-list">
                        {actions.map((action) =>
                            createChoice(
                                action.title,
                                action.description,
                                currentScript?.action?.title === action.title,
                                () => {
                                    setCurrentScript(action);
                                }
                            )
                        )}
                    </div>

                    {currentScript && (
                        <>
                            <div className="designer__choices-title">
                                {currentScript.action.title} Conditions
                            </div>
                            <div className="designer__choices-list">
                                {conditions.map((condition) => {
                                    const selected = !!currentScript.conditions[condition.title];
                                    return createChoice(
                                        condition.title,
                                        condition.description,
                                        selected,
                                        () => {
                                            selected
                                                ? removeCondition(condition.title)
                                                : addCondition(condition);
                                        }
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* The area where the user can create scripts */}
            <div className="designer__workbench">
                {currentScript && (
                    <>
                        <div className="workbench__section">
                            <ActionBlock
                                action={currentScript.action}
                                onUpdate={updateActionForm}
                                onRemove={cleanAction}
                            />
                        </div>
                        <div className="workbench__section">
                            {Object.values(currentScript.conditions).map((condition) => (
                                <ConditionBlock
                                    key={condition.title}
                                    condition={condition}
                                    onUpdate={updateConditionForm}
                                    onRemove={removeCondition}
                                />
                            ))}
                        </div>

                        <button
                            className="workbench__deploy-button"
                            disabled={buttonDisabled()}
                            onClick={createAndSignScript}
                        >
                            {"Sign & Deploy"}
                        </button>
                    </>
                )}
            </div>
            {/* ENABLE WHEN DEBUGGING */}
            {/* <p> {JSON.stringify(currentScript, null, " ")}</p> */}
        </div>
    );
}

const createChoice = (
    title: string,
    description: string,
    selected: boolean,
    onClick: () => void
): JSX.Element => (
    <div key={title} className={`choice ${selected ? "choice--selected" : ""}`} onClick={onClick}>
        <div className="choice-name">{title}</div>
        <div className="tooltip">
            <div className="tooltip__text">?</div>
            <div className="tooltip__content">{description}</div>
        </div>
    </div>
);
