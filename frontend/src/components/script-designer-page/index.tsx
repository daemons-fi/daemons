import React, { useEffect, useState } from "react";
import { RootState } from "../../state";
import { useDispatch, useSelector } from "react-redux";
import { Link, Navigate } from "react-router-dom";
import { IAction, ICondition, Token } from "../../data/chains-data/interfaces";
import { GetCurrentChain } from "../../data/chain-info";
import { ActionBlock } from "./blocks/actions/actions-block";
import { ConditionBlock } from "./blocks/conditions/conditions-block";
import { IScriptActionForm } from "../../data/chains-data/action-form-interfaces";
import { IScriptConditionForm } from "../../data/chains-data/condition-form-interfaces";
import { ICurrentScript } from "../../script-factories/i-current-script";
import "./styles.css";
import "./blocks.css";
import "../tooltip.css";
import { ethers } from "ethers";
import { ScriptDescriptionFactory } from "../../script-factories/script-description-factory";
import { addScriptToWorkbench } from "../../state/action-creators/workbench-action-creators";

export function ScriptDesignerPage(): JSX.Element {
    // redux
    const dispatch = useDispatch();
    const chainId: string | undefined = useSelector((state: RootState) => state.wallet.chainId);
    const banned: boolean = useSelector((state: RootState) => state.wallet.banned);
    const authenticated: boolean = useSelector((state: RootState) => state.wallet.authenticated);
    const supportedChain: boolean = useSelector((state: RootState) => state.wallet.supportedChain);
    const workbenchScripts = useSelector((state: RootState) => state.workbench.scripts);

    // states
    const [redirectToReview, setRedirectToReview] = useState<boolean>(false);
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
        const newCurrentScript: ICurrentScript = {
            id: ethers.utils.hexlify(ethers.utils.randomBytes(32)),
            description: "",
            action: actionCopy,
            conditions: {}
        };

        _setCurrentScript(newCurrentScript);
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

    const isCurrentScriptValid = () => {
        if (!currentScript) return false;
        if (!currentScript.action.form.valid) return false;

        const conditions = Object.values(currentScript.conditions);
        if (conditions.some((condition) => !condition.form.valid)) return false;

        return true;
    };

    const storeScriptAndGoToReview = () => {
        storeScriptToWorkbench();
        setRedirectToReview(true);
    };

    const storeScriptAndAddAnother = () => {
        storeScriptToWorkbench();
        cleanAction();
    };

    const storeScriptToWorkbench = () => {
        if (!isCurrentScriptValid()) throw new Error("Cannot store invalid script");
        const tokens = GetCurrentChain(chainId!).tokens;
        const scriptDescriptionFactory = new ScriptDescriptionFactory(tokens);
        const script = JSON.parse(JSON.stringify(currentScript));
        script.description = scriptDescriptionFactory.extractDefaultDescription(script);

        dispatch(addScriptToWorkbench(script));
    };

    if (!authenticated || !supportedChain || banned) return <Navigate to="/my-page" />;
    if (redirectToReview) return <Navigate to="/review" />;

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
                                action.info,
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
                                        condition.info,
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

                        <div className="workbench__buttons">
                            <button
                                className="workbench__deploy-button"
                                disabled={!isCurrentScriptValid()}
                                onClick={storeScriptAndAddAnother}
                            >
                                {"Chain another script"}
                            </button>

                            <button
                                className="workbench__deploy-button"
                                disabled={!isCurrentScriptValid()}
                                onClick={storeScriptAndGoToReview}
                            >
                                {"Review and sign"}
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* A link to the review page */}
            <Link
                className={`designer__review-link ${
                    workbenchScripts.length === 0 ? "designer__review-link--disabled" : ""
                }`}
                to={workbenchScripts.length > 0 ? "/review" : "#"}
            >
                Review ({workbenchScripts.length})
            </Link>

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
