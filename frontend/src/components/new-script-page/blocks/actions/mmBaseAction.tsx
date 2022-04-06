import React, { useEffect } from 'react';
import { IBaseMMActionForm } from './actions-interfaces';
import { Form, Field } from 'react-final-form';
import { TokensModal } from "../shared/tokens-modal";
import { ToggleButtonField } from '../shared/toggle-button';
import { BaseMoneyMarketActionType } from '@daemons-fi/shared-definitions';


const amountValidation = (value: string) => {
    if (!value || value === '') return 'required';
    if (Number(value) <= 0) return 'required > 0';
    return undefined;
};

export const MmBaseAction = ({ form, update }: { form: IBaseMMActionForm; update: (next: IBaseMMActionForm) => void; }) => {
    const tokens = form.moneyMarket.supportedTokens;

    useEffect(() => {
        if (!form.tokenAddress)
            update({ ...form, tokenAddress: tokens[0]?.address });
    }, []);

    return (
        <Form
            initialValues={form}
            onSubmit={() => { /** Individual forms are not submitted */ }}
            render={({ handleSubmit, valid }) => (
                <form onSubmit={handleSubmit}>

                    <div className='transfer-block'>
                        <div className="script-block__panel--row">
                            <ToggleButtonField
                                name='actionType'
                                valuesEnum={BaseMoneyMarketActionType}
                                updateFunction={(newValue) => { update({ ...form, actionType: newValue }); }}
                                initial={form.actionType}
                            />
                        </div>

                        <div className="script-block__panel--two-columns">

                            <TokensModal
                                tokens={tokens}
                                selectedToken={tokens.find(t => t.address === form.tokenAddress)}
                                setSelectedToken={(token) => update({ ...form, tokenAddress: token.address })}
                            />

                            <Field name="floatAmount"
                                component="input"
                                type="number"
                                placeholder='1.00'
                                validate={amountValidation}
                            >
                                {({ input, meta }) =>
                                    <input
                                        {...input}
                                        className={`balance-block__amount ${meta.error ? 'script-block__field--error' : null}`}
                                        onChange={(e) => {
                                            e.target.value = Number(e.target.value) < 0 ? '0' : e.target.value;
                                            input.onChange(e);
                                            update({ ...form, floatAmount: Number(e.target.value) });
                                        }}
                                        onBlur={(e) => {
                                            input.onBlur(e);
                                            update({ ...form, valid });
                                        }}
                                        placeholder="Amount"
                                    />
                                }
                            </Field>

                        </div>
                        <div>
                            TODO
                            <ul>
                                <li>Add amount type toggle (absolute/percentage)</li>
                            </ul>
                        </div >
                    </div >
                </form>
            )}
        />
    );
};
