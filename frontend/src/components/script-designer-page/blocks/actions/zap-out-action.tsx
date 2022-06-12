import React, { useEffect, useState } from "react";
import { IZapOutActionForm } from "../../../../data/chains-data/action-form-interfaces";
import { Form, Field } from "react-final-form";
import { useSelector } from "react-redux";
import { RootState } from "../../../../state";
import { TokensModal } from "../shared/tokens-modal";
import { AmountType, ZapOutputChoice } from "@daemons-fi/shared-definitions/build";
import { ToggleButtonField } from "../shared/toggle-button";
import { Token } from "../../../../data/chains-data/interfaces";
import { GetCurrentChain } from "../../../../data/chain-info";

const validateForm = (values: IZapOutActionForm) => {
    const errors: any = {};
    if (!values.floatAmount || (values.floatAmount as any) === "") {
        errors.floatAmountA = "required";
    }
    if (!values.floatAmount || (values.floatAmount as any) === "") {
        errors.floatAmountB = "required";
    }
    return errors;
};

const isFormValid = (values: IZapOutActionForm) => {
    const errors = validateForm(values);
    const isValid = Object.keys(errors).length === 0;
    return isValid;
};

export const ZapOutAction = ({
    form,
    update
}: {
    form: IZapOutActionForm;
    update: (next: IZapOutActionForm) => void;
}) => {
    const chainId = useSelector((state: RootState) => state.wallet.chainId);
    const [tokens, setTokens] = useState<Token[]>([]);

    const getTokenName = (address: string) =>
        tokens.find((t) => t.address === address)?.symbol ?? address;

    useEffect(() => {
        if (!form.tokenA || !form.tokenB)
            update({
                ...form,
                tokenA: tokens[0]?.address,
                tokenB: tokens[1]?.address
            });
    }, [tokens]);

    useEffect(() => {
        if (chainId) setTokens(GetCurrentChain(chainId).tokens);
    }, [chainId]);

    return (
        <Form
            initialValues={form}
            validate={validateForm}
            onSubmit={() => {
                /** Individual forms are not submitted */
            }}
            render={({ handleSubmit }) => (
                <form onSubmit={handleSubmit}>
                    <div className="zap-in-block">
                        <div className="script-block__panel--three-columns">
                            <TokensModal
                                tokens={tokens.filter((t) => t.address !== form.tokenB)}
                                selectedToken={tokens.filter((t) => t.address === form.tokenA)[0]}
                                setSelectedToken={(token) =>
                                    update({ ...form, tokenA: token.address })
                                }
                            />

                            <div
                                style={{
                                    width: "100%",
                                    textAlign: "center",
                                    marginTop: "10px",
                                    marginBottom: "10px",
                                    fontSize: "1.4rem"
                                }}
                            >
                                <span>+</span>
                            </div>

                            <TokensModal
                                tokens={tokens.filter((t) => t.address !== form.tokenA)}
                                selectedToken={tokens.filter((t) => t.address === form.tokenB)[0]}
                                setSelectedToken={(token) =>
                                    update({ ...form, tokenB: token.address })
                                }
                            />
                        </div>

                        <div className="script-block__panel--three-columns">
                            <ToggleButtonField
                                name="amountType"
                                valuesEnum={AmountType}
                                updateFunction={(newValue: AmountType) => {
                                    const updatedForm = {
                                        ...form,
                                        amountType: newValue,
                                        floatAmount: newValue === AmountType.Percentage ? 50 : 0
                                    };
                                    const valid = isFormValid(updatedForm);
                                    update({ ...updatedForm, valid });
                                }}
                                initial={form.amountType}
                            />
                        </div>
                        {form.amountType === AmountType.Absolute ? (
                            <Field
                                name="floatAmount"
                                component="input"
                                type="number"
                                placeholder="1.00"
                            >
                                {({ input, meta }) => (
                                    <input
                                        {...input}
                                        className={`balance-block__amount ${
                                            meta.error ? "script-block__field--error" : null
                                        }`}
                                        onChange={(e) => {
                                            e.target.value =
                                                Number(e.target.value) < 0 ? "0" : e.target.value;
                                            input.onChange(e);
                                            const updatedForm = {
                                                ...form,
                                                floatAmount: Number(e.target.value)
                                            };
                                            const valid = isFormValid(updatedForm);
                                            update({ ...updatedForm, valid });
                                        }}
                                    />
                                )}
                            </Field>
                        ) : (
                            <div className="slider-container">
                                <Field name="floatAmount" component="input" type="range">
                                    {({ input, meta }) => (
                                        <input
                                            min="50"
                                            max="10000"
                                            step="50"
                                            {...input}
                                            className={`${
                                                meta.error ? "script-block__field--error" : ""
                                            }`}
                                            onChange={(e) => {
                                                input.onChange(e);
                                                const updatedForm = {
                                                    ...form,
                                                    floatAmount: Number(e.target.value)
                                                };
                                                const valid = isFormValid(updatedForm);
                                                update({ ...updatedForm, valid });
                                            }}
                                        />
                                    )}
                                </Field>

                                <div className="slider-container__slider-value">
                                    {`${form.floatAmount / 100}%`}
                                </div>
                            </div>
                        )}

                        <p>Select the zap outcome</p>
                        <div className="zap-out-block__outcome-radio">
                            <Field
                                name="outputChoice"
                                component="input"
                                type="radio"
                                value={ZapOutputChoice.bothTokens}
                            >
                                {({ input }) => (
                                    <input
                                        id="id-radio-outcome-both"
                                        {...input}
                                        onChange={(e) => {
                                            input.onChange(e);
                                            const updatedForm = {
                                                ...form,
                                                outputChoice: Number(e.target.value)
                                            };
                                            update({ ...updatedForm });
                                        }}
                                    />
                                )}
                            </Field>
                            <label htmlFor="id-radio-outcome-both">
                                {getTokenName(form.tokenA)} + {getTokenName(form.tokenB)}
                            </label>
                            <Field
                                name="outputChoice"
                                component="input"
                                type="radio"
                                value={ZapOutputChoice.tokenA}
                            >
                                {({ input }) => (
                                    <input
                                        id="id-radio-outcome-token-1"
                                        {...input}
                                        onChange={(e) => {
                                            input.onChange(e);
                                            const updatedForm = {
                                                ...form,
                                                outputChoice: Number(e.target.value)
                                            };
                                            update({ ...updatedForm });
                                        }}
                                    />
                                )}
                            </Field>
                            <label htmlFor="id-radio-outcome-token-1">
                                {getTokenName(form.tokenA)}
                            </label>
                            <Field
                                name="outputChoice"
                                component="input"
                                type="radio"
                                value={ZapOutputChoice.tokenB}
                            >
                                {({ input }) => (
                                    <input
                                        id="id-radio-outcome-token-2"
                                        {...input}
                                        onChange={(e) => {
                                            input.onChange(e);
                                            const updatedForm = {
                                                ...form,
                                                outputChoice: Number(e.target.value)
                                            };
                                            update({ ...updatedForm });
                                        }}
                                    />
                                )}
                            </Field>
                            <label htmlFor="id-radio-outcome-token-2">
                                {getTokenName(form.tokenB)}
                            </label>
                        </div>

                        {/* ENABLE WHEN DEBUGGING!  */}
                        {/* <p>{JSON.stringify(form, null, " ")}</p> */}
                    </div>
                </form>
            )}
        />
    );
};
