import React, { useEffect } from 'react';
import { ITransferActionForm } from './actions-interfaces';
import { Form, Field } from 'react-final-form';
import { ethers } from 'ethers';
import { Token } from '../../../../data/tokens';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../state';
import { TokensModal } from "../shared/tokens-modal";
import { AmountType } from '@daemons-fi/shared-definitions/build';
import { ToggleButtonField } from '../shared/toggle-button';


const validateForm = (values: ITransferActionForm) => {
    const errors: any = {};
    if (!values.floatAmount || (values.floatAmount as any) === '') {
        errors.floatAmount = 'required';
    }
    if (values.floatAmount && Number(values.floatAmount) <= 0) {
        errors.floatAmount = 'required > 0';
    }
    if (!values.destinationAddress || values.destinationAddress === '') {
        errors.destinationAddress = 'required';
    }
    if (values.destinationAddress && !ethers.utils.isAddress(values.destinationAddress)) {
        errors.destinationAddress = 'it does not seem a real address';
    }
    return errors;
};

const isFormValid = (values: ITransferActionForm) => {
    const errors = validateForm(values);
    const isValid = Object.keys(errors).length === 0;
    return isValid;
};

export const TransferAction = ({ form, update }: { form: ITransferActionForm; update: (next: ITransferActionForm) => void; }) => {
    const tokens: Token[] = useSelector((state: RootState) => state.tokens.currentChainTokens);

    useEffect(() => {
        if (!form.tokenAddress)
            update({ ...form, tokenAddress: tokens[0].address });
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

                            <TokensModal
                                tokens={tokens}
                                selectedToken={tokens.find(t => t.address === form.tokenAddress)}
                                setSelectedToken={(token) => update({ ...form, tokenAddress: token.address })}
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

                        {form.amountType === AmountType.Absolute
                            ? (<Field name="floatAmount"
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
                            </Field>)
                            : (<div className='slider-container'>

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
                                            className={`transfer-block__slider ${meta.error ? 'script-block__field--error' : null}`}
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

                        <Field
                            name="destinationAddress"
                            component="select"
                        >
                            {({ input, meta }) =>
                                <input
                                    {...input}
                                    placeholder="Destination Address"
                                    className={`transfer-block__token ${meta.error ? 'script-block__field--error' : null}`}
                                    onChange={(e) => {
                                        input.onChange(e);
                                        const updatedForm = { ...form, destinationAddress: e.target.value };
                                        const valid = isFormValid(updatedForm);
                                        update({ ...updatedForm, valid });
                                    }}
                                />
                            }
                        </Field>

                        {/* ENABLE WHEN DEBUGGING!  */}
                        {/* <p>{JSON.stringify(form, null, ' ')}</p> */}
                    </div >
                </form>
            )}
        />
    );
};
