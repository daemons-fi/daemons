import React, { useEffect, useState } from 'react';
import { ISwapActionForm } from './actions-interfaces';
import { Form, Field } from 'react-final-form';
import { IToken, Token } from '../../../../data/tokens';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../state';
import { TokensModal } from "../shared/tokens-modal";
import { AmountType } from '@daemons-fi/shared-definitions/build';
import { ToggleButtonField } from '../shared/toggle-button';

const validateForm = (values: ISwapActionForm) => {
    const errors: any = {};
    if (!values.floatAmount || (values.floatAmount as any) === '') {
        errors.floatAmount = 'required';
    }
    if (values.floatAmount && Number(values.floatAmount) <= 0) {
        errors.floatAmount = 'required > 0';
    }
    return errors;
};

const isFormValid = (values: ISwapActionForm) => {
    const errors = validateForm(values);
    const isValid = Object.keys(errors).length === 0;
    return isValid;
};

export const SwapAction = ({ form, update }: { form: ISwapActionForm; update: (next: ISwapActionForm) => void; }) => {
    const tokens: Token[] = useSelector((state: RootState) => state.tokens.currentChainTokens);
    const [selectedTokenFrom, setSelectedTokenFrom] = useState<IToken | undefined>();
    const [selectedTokenTo, setSelectedTokenTo] = useState<IToken | undefined>();

    useEffect(() => {
        if (tokens?.length > 2) {
            const initialTokenFrom = tokens[0];
            const initialTokenTo = tokens[1];
            setSelectedTokenFrom(initialTokenFrom);
            setSelectedTokenTo(initialTokenTo);
            update({
                ...form,
                tokenFromAddress: initialTokenFrom.address,
                tokenToAddress: initialTokenTo.address
            });
        }
    }, [tokens]);

    const onSetSelectedTokenFrom = (tokenFrom: IToken) => {
        if (tokenFrom.address !== selectedTokenTo?.address) {
            update({ ...form, tokenFromAddress: tokenFrom.address });
            setSelectedTokenFrom(tokenFrom);
        }
    };
    const onSetSelectedTokenTo = (tokenTo: IToken) => {
        if (tokenTo.address !== selectedTokenFrom?.address) {
            update({ ...form, tokenToAddress: tokenTo.address });
            setSelectedTokenTo(tokenTo);
        }
    };

    return (
        <Form
            initialValues={form}
            validate={validateForm}
            onSubmit={() => { /** Individual forms are not submitted */ }}
            render={({ handleSubmit, valid }) => (
                <form onSubmit={handleSubmit}>

                    <div className='swap-block'>
                        <div className='script-block__panel--two-columns'>
                            <TokensModal
                                tokens={tokens.filter(t => t.address !== selectedTokenTo?.address)}
                                selectedToken={selectedTokenFrom}
                                setSelectedToken={onSetSelectedTokenFrom}
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
                                    />
                                }
                            </Field> : (<div className='slider-container'>
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
                                            className={`${meta.error ? 'script-block__field--error' : ''}`}
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

                        <div className='script-block__panel--two-columns'>
                            <TokensModal
                                tokens={tokens.filter(t => t.address !== selectedTokenFrom?.address)}
                                selectedToken={selectedTokenTo}
                                setSelectedToken={onSetSelectedTokenTo}
                            />
                        </div >
                    </div >
                </form>
            )}
        />
    );
};
