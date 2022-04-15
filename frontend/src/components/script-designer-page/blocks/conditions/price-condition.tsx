import React, { useEffect, useState } from 'react';
import { Form, Field } from 'react-final-form';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../state';
import { TokensModal } from "../shared/tokens-modal";
import { Token } from '../../../../data/chains-data/interfaces';
import { IPriceConditionForm } from "../../../../data/chains-data/condition-form-interfaces";
import { GetCurrentChain } from '../../../../data/chain-info';


const validateForm = (form: IPriceConditionForm) => {
    const errors: any = {};
    if (!form.floatValue || (form.floatValue as any) === '') {
        errors.floatValue = 'required';
    }
    if (form.floatValue && Number(form.floatValue) <= 0) {
        errors.floatValue = 'required > 0';
    }
    return errors;
};

const isFormValid = (values: IPriceConditionForm) => {
    const errors = validateForm(values);
    const isValid = Object.keys(errors).length === 0;
    return isValid;
};

export const PriceCondition = ({ form, update }: { form: IPriceConditionForm; update: (next: IPriceConditionForm) => void; }) => {
    const chainId = useSelector((state: RootState) => state.wallet.chainId);
    const [tokens, setTokens] = useState<Token[]>([]);

    useEffect(() => {
        if (!form.tokenAddress) {
            const filteredTokens = tokens.filter(token => token.hasPriceFeed);
            update({ ...form, tokenAddress: filteredTokens[0]?.address });
        }
    }, [tokens]);

    useEffect(() => {
        if (chainId)
            setTokens(GetCurrentChain(chainId).tokens)
    }, [chainId]);

    return (
        <Form
            initialValues={form}
            validate={validateForm}
            onSubmit={() => { /** Individual forms are not submitted */ }}
            render={({ handleSubmit }) => (
                <form onSubmit={handleSubmit}>
                    <div className='script-block__panel--three-columns price-block'>

                        {tokens.some(token => token.hasPriceFeed) && <TokensModal
                            tokens={tokens.filter(token => token.hasPriceFeed)}
                            selectedToken={tokens.find(t => t.address === form.tokenAddress)}
                            setSelectedToken={(token) => update({ ...form, tokenAddress: token.address })}
                        />
                        }

                        <Field
                            name="comparison"
                            component="select"
                        >
                            {({ input }) => <select
                                {...input}
                                onChange={(e) => {
                                    input.onChange(e);
                                    update({ ...form, comparison: Number(e.target.value) });
                                }}
                                className='price-block__comparison'
                            >
                                <option value={0}>&gt;</option>
                                <option value={1}>&lt;</option>
                            </select>}
                        </Field>

                        <Field name="floatValue"
                            component="input"
                            type="number"
                            placeholder='1.00'
                        >
                            {({ input, meta }) =>
                                <input
                                    {...input}
                                    className={`price-block__value ${meta.error ? 'script-block__field--error' : null}`}
                                    onChange={(e) => {
                                        e.target.value = Number(e.target.value) < 0 ? '0' : e.target.value;
                                        input.onChange(e);
                                        const updatedForm = { ...form, floatValue: Number(e.target.value) };
                                        const valid = isFormValid(updatedForm);
                                        update({ ...updatedForm, valid });
                                    }}
                                />
                            }
                        </Field>

                    </div>
                </form>
            )}
        />
    );

};
