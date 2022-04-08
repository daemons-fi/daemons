import React, { useEffect, useState } from "react";
import { RootState } from "../../state";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { IAction, ICondition, IToken } from "../../data/chains-data/interfaces";
import "./styles.css";
import "./killme-styles.css";
import { GetCurrentChain } from "../../data/chain-info";
import { ActionBlock } from "./blocks/actions/actions-block-factory";

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
  const [selectedConditions, setSelectedConditions] = useState<ICondition[]>([]);

  useEffect(() => {
    setActions(GetCurrentChain(chainId!).actions);
  }, [chainId]);

  useEffect(() => {
    setConditions(selectedAction?.conditions ?? []);
    setSelectedConditions([]);
  }, [selectedAction]);

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
              createChoice(action.title, action.description, () => {
                setSelectedAction(action);
              })
            )}
          </div>

          <div className="designer__choices-title">Conditions</div>
          <div className="designer__choices-list">
            {conditions.map((condition) =>
              createChoice(condition.title, condition.description, () => {
                const newSelectedConditions = [...selectedConditions, condition];
                setSelectedConditions(newSelectedConditions);
                const newConditions = conditions.filter(c => c.title !== condition.title);
                setConditions(newConditions);
              })
            )}
          </div>
        </div>
      </div>

      {/* The script the user is currently creating */}
      <div className="designer__workspace">
        <div className="workspace__action">
              {selectedAction && <ActionBlock action={selectedAction}/>}
        </div>


      </div>
    </div>
  );
}

const createChoice = (title: string, description: string, onClick: () => void): JSX.Element => (
  <div key={title} className="choice" onClick={onClick}>
    <div className="choice-name">{title}</div>
  </div>
);
