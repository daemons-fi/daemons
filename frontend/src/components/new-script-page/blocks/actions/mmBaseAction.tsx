import React, { useEffect } from 'react';
import { IBaseMMActionForm } from './actions-interfaces';
import { Form, Field } from 'react-final-form';
import { TokensModal } from "../shared/tokens-modal";
import { ToggleButtonField } from '../shared/toggle-button';
import { BaseMoneyMarketActionType } from '@daemons-fi/shared-definitions';
import { AmountType } from '@daemons-fi/shared-definitions/build';


const validateForm = (values: IBaseMMActionForm) => {
    const errors: any = {};
    if (!values.floatAmount || (values.floatAmount as any) === '') {
        errors.floatAmount = 'required';
    }
    if (values.floatAmount && Number(values.floatAmount) <= 0) {
        errors.floatAmount = 'required > 0';
    }
    return errors;
};

const isFormValid = (values: IBaseMMActionForm) => {
    const errors = validateForm(values);
    const isValid = Object.keys(errors).length === 0;
    return isValid;
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
            validate={validateForm}
            onSubmit={() => { /** Individual forms are not submitted */ }}
            render={({ handleSubmit }) => (
                <form onSubmit={handleSubmit}>

                    <div className='transfer-block'>
                        <div className="script-block__panel--two-columns">
                            <ToggleButtonField
                                name='actionType'
                                valuesEnum={BaseMoneyMarketActionType}
                                updateFunction={(newValue) => { update({ ...form, actionType: newValue }); }}
                                initial={form.actionType}
                            />
                            <ToggleButtonField
                                name='amountType'
                                valuesEnum={AmountType}
                                updateFunction={(newValue: AmountType) => {
                                    const updatedForm = { ...form, amountType: newValue, floatAmount: (newValue === AmountType.Percentage ? 50 : 0) };
                                    const valid = isFormValid(updatedForm);
                                    update({ ...updatedForm, valid });
                                }}
                                initial={form.amountType}
                            />
                        </div>

                        {form.amountType === AmountType.Absolute ?
                            <Field name="floatAmount"
                                component="input"
                                type="number"
                                placeholder='1.00'
                            >
                                {({ input, meta }) =>
                                    <input
                                        {...input}
                                        className={`balance-block__amount ${meta.error ? 'script-block__field--error' : null}`}
                                        onChange={(e) => {
                                            e.target.value = Number(e.target.value) < 0 ? '0' : e.target.value;
                                            input.onChange(e);
                                            const updatedForm = { ...form, floatAmount: Number(e.target.value) };
                                            const valid = isFormValid(updatedForm);
                                            update({ ...updatedForm, valid });
                                        }}
                                        placeholder="Amount"
                                    />
                                }
                            </Field> :
                            (<div className='slider-container'>
                                <Field name="floatAmount"
                                    component="input"
                                    type="range"
                                >
                                    {({ input, meta }) =>
                                        <input
                                            min="50"
                                            max="10000"
                                            step="50"
                                            {...input}
                                            className={`${meta.error ? 'script-block__field--error' : null}`}
                                            onChange={(e) => {
                                                input.onChange(e);
                                                const updatedForm = { ...form, floatAmount: Number(e.target.value) };
                                                const valid = isFormValid(updatedForm);
                                                update({ ...updatedForm, valid });
                                            }}
                                        />
                                    }
                                </Field>

                                <div className='slider-container__slider-value'>
                                    {`${form.floatAmount / 100}%`}
                                </div>
                            </div>)
                        }

                        <div className="script-block__panel--two-columns">
                            <TokensModal
                                tokens={tokens}
                                selectedToken={tokens.find(t => t.address === form.tokenAddress)}
                                setSelectedToken={(token) => update({ ...form, tokenAddress: token.address })}
                            />
                        </div>
                    </div >
                </form>
            )}
        />
    );
};
