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
  const [selectedAction, setSelectedAction] = useState<IAction | undefined>();
  const [conditions, setConditions] = useState<ICondition[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<Set<ICondition>>(new Set());

  useEffect(() => {
    setActions(GetCurrentChain(chainId!).actions);
  }, [chainId]);

  useEffect(() => {
    setConditions(selectedAction?.conditions ?? []);
    setSelectedConditions(new Set());
  }, [selectedAction]);

  const cleanAction = () => setSelectedAction(undefined);
  const removeCondition = (condition: ICondition) => {
    setSelectedConditions(
      new Set([...selectedConditions].filter((c) => c.title !== condition.title))
    );
  };
  const addCondition = (condition: ICondition) => {
    setSelectedConditions(new Set([...selectedConditions, condition]));
  };

  // // action forms
  // const noActionForm: INoActionForm = { action: ScriptAction.None, valid: false };
  // const transferActionForm: ITransferActionForm = { action: ScriptAction.Transfer, valid: false, tokenAddress: '', destinationAddress: '', amountType: AmountType.Absolute, floatAmount: 0 };
  // const swapActionForm: ISwapActionForm = { action: ScriptAction.Swap, valid: false, tokenFromAddress: '', tokenToAddress: '', amountType: AmountType.Absolute, floatAmount: 0 };
  // const aaveBaseActionForm: IBaseMMActionForm = { action: ScriptAction.MmBase, valid: false, tokenAddress: '', amountType: AmountType.Absolute, floatAmount: 0, actionType: BaseMoneyMarketActionType.Deposit, moneyMarket: GetCurrentChain(chainId!).moneyMarket };

  // const [actionForm, setActionForm] = useState<IScriptActionForm>(noActionForm);
  // const [frequencyCondition, setFrequencyCondition] = useState<IFrequencyConditionForm>({ valid: true, enabled: false, ticks: 1, unit: FrequencyUnits.Hours, startNow: true });
  // const [balanceCondition, setBalanceCondition] = useState<IBalanceConditionForm>({ valid: false, enabled: false, comparison: ComparisonType.GreaterThan, floatAmount: 0 });
  // const [priceCondition, setPriceCondition] = useState<IPriceConditionForm>({ valid: false, enabled: false, comparison: ComparisonType.GreaterThan, floatValue: 0 });
  // const [repetitionsCondition, setRepetitionsCondition] = useState<IRepetitionsConditionForm>({ valid: false, enabled: false, amount: 0 });
  // const [followCondition, setFollowCondition] = useState<IFollowConditionForm>({ valid: false, enabled: false });

  // const toggleFrequencyCondition = () => setFrequencyCondition({ ...frequencyCondition, enabled: !frequencyCondition.enabled });
  // const toggleBalanceCondition = () => setBalanceCondition({ ...balanceCondition, enabled: !balanceCondition.enabled });
  // const togglePriceCondition = () => setPriceCondition({ ...priceCondition, enabled: !priceCondition.enabled });
  // const toggleRepetitionsCondition = () => setRepetitionsCondition({ ...repetitionsCondition, enabled: !repetitionsCondition.enabled });
  // const toggleFollowCondition = () => setFollowCondition({ ...followCondition, enabled: !followCondition.enabled });

  // const setTransferActionAsSelected = () => { if (actionForm.action !== ScriptAction.Transfer) setActionForm(transferActionForm); };
  // const setSwapActionAsSelected = () => { if (actionForm.action !== ScriptAction.Swap) setActionForm(swapActionForm); };
  // const setMmBaseActionAsSelected = () => { if (actionForm.action !== ScriptAction.MmBase) setActionForm(aaveBaseActionForm); };

  // const createBundle = (): INewScriptBundle => ({
  //     frequencyCondition,
  //     balanceCondition,
  //     priceCondition,
  //     repetitionsCondition,
  //     followCondition,
  //     actionForm,
  // });

  // const createAndSignScript = async () => {
  //     if (!chainId) throw new Error("Cannot create the script! The chain is unknown");

  //     const scriptFactory = new ScriptFactory(chainId, tokens);
  //     const bundle = createBundle();
  //     const script = await scriptFactory.SubmitScriptsForSignature(bundle);
  //     if (!await script.hasAllowance()) {
  //         await script.requestAllowance();
  //     }
  //     await StorageProxy.script.saveScript(script);
  //     dispatch(addNewScript(script));
  //     setRedirect(true);
  // };

  // const buttonDisabled = () => {
  //     const bundle = createBundle();
  //     const actionIsInvalid = !actionForm.valid;
  //     const invalidCondition = Object.values(bundle).some(c => c.enabled && !c.valid);
  //     return actionIsInvalid || invalidCondition;
  // };

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
                selectedAction?.title === action.title,
                () => {
                  setSelectedAction(action);
                }
              )
            )}
          </div>

          {selectedAction && (
            <>
              <div className="designer__choices-title">{selectedAction.title} Conditions</div>
              <div className="designer__choices-list">
                {conditions.map((condition) => {
                  const selected = selectedConditions.has(condition);
                  return createChoice(condition.title, condition.description, selected, () => {
                    selected ? removeCondition(condition) : addCondition(condition);
                  });
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* The area where the user can create scripts */}
      <div className="designer__workbench">
        <div className="workbench__section">
          {selectedAction && <ActionBlock action={selectedAction} onRemove={cleanAction} />}
        </div>
        <div className="workbench__section">
          {[...selectedConditions].map((condition) => (
            <ConditionBlock condition={condition} onRemove={() => removeCondition(condition)} />
          ))}
        </div>
      </div>
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
