import React, { useEffect, useState } from "react";
import { IZapInActionForm } from "../../../../data/chains-data/action-form-interfaces";
import { Form, Field } from "react-final-form";
import { useSelector } from "react-redux";
import { RootState } from "../../../../state";
import { TokensModal } from "../shared/tokens-modal";
import { AmountType } from "@daemons-fi/shared-definitions/build";
import { ToggleButtonField } from "../shared/toggle-button";
import { Token } from "../../../../data/chains-data/interfaces";
import { GetCurrentChain } from "../../../../data/chain-info";

const validateForm = (values: IZapInActionForm) => {
    const errors: any = {};

    const amountAZero = !values.floatAmountA || (values.floatAmountA as any) === "" || (values.floatAmountA && Number(values.floatAmountA) <= 0);
    const amountBZero = !values.floatAmountB || (values.floatAmountB as any) === "" || (values.floatAmountB && Number(values.floatAmountB) <= 0);

    if (amountAZero && amountBZero) {
        errors.floatAmountA = "required > 0";
        errors.floatAmountB = "required > 0";
    }

    return errors;
};

const isFormValid = (values: IZapInActionForm) => {
    const errors = validateForm(values);
    const isValid = Object.keys(errors).length === 0;
    return isValid;
};

export const ZapInAction = ({
    form,
    update
}: {
    form: IZapInActionForm;
    update: (next: IZapInActionForm) => void;
}) => {
    const chainId = useSelector((state: RootState) => state.wallet.chainId);
    const [tokens, setTokens] = useState<Token[]>([]);

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
                        <div className="script-block__panel--two-columns">
                            <TokensModal
                                tokens={tokens.filter((t) => t.address !== form.tokenB)}
                                selectedToken={tokens.filter((t) => t.address === form.tokenA)[0]}
                                setSelectedToken={(token) =>
                                    update({ ...form, tokenA: token.address })
                                }
                            />

                            <ToggleButtonField
                                name="amountTypeA"
                                valuesEnum={AmountType}
                                updateFunction={(newValue: AmountType) => {
                                    const updatedForm = {
                                        ...form,
                                        amountTypeA: newValue,
                                        floatAmountA: newValue === AmountType.Percentage ? 50 : 0
                                    };
                                    const valid = isFormValid(updatedForm);
                                    update({ ...updatedForm, valid });
                                }}
                                initial={form.amountTypeA}
                            />
                        </div>
                        {form.amountTypeA === AmountType.Absolute ? (
                            <Field
                                name="floatAmountA"
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
                                                floatAmountA: Number(e.target.value)
                                            };
                                            const valid = isFormValid(updatedForm);
                                            update({ ...updatedForm, valid });
                                        }}
                                    />
                                )}
                            </Field>
                        ) : (
                            <div className="slider-container">
                                <Field name="floatAmountA" component="input" type="range">
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
                                                    floatAmountA: Number(e.target.value)
                                                };
                                                const valid = isFormValid(updatedForm);
                                                update({ ...updatedForm, valid });
                                            }}
                                        />
                                    )}
                                </Field>

                                <div className="slider-container__slider-value">
                                    {`${form.floatAmountA / 100}%`}
                                </div>
                            </div>
                        )}

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

                        <div className="script-block__panel--two-columns">
                            <TokensModal
                                tokens={tokens.filter((t) => t.address !== form.tokenA)}
                                selectedToken={tokens.filter((t) => t.address === form.tokenB)[0]}
                                setSelectedToken={(token) =>
                                    update({ ...form, tokenB: token.address })
                                }
                            />

                            <ToggleButtonField
                                name="amountTypeB"
                                valuesEnum={AmountType}
                                updateFunction={(newValue: AmountType) => {
                                    const updatedForm = {
                                        ...form,
                                        amountTypeB: newValue,
                                        floatAmountB: newValue === AmountType.Percentage ? 50 : 0
                                    };
                                    const valid = isFormValid(updatedForm);
                                    update({ ...updatedForm, valid });
                                }}
                                initial={form.amountTypeB}
                            />
                        </div>
                        {form.amountTypeB === AmountType.Absolute ? (
                            <Field
                                name="floatAmountB"
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
                                                floatAmountB: Number(e.target.value)
                                            };
                                            const valid = isFormValid(updatedForm);
                                            update({ ...updatedForm, valid });
                                        }}
                                    />
                                )}
                            </Field>
                        ) : (
                            <div className="slider-container">
                                <Field name="floatAmountB" component="input" type="range">
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
                                                    floatAmountB: Number(e.target.value)
                                                };
                                                const valid = isFormValid(updatedForm);
                                                update({ ...updatedForm, valid });
                                            }}
                                        />
                                    )}
                                </Field>

                                <div className="slider-container__slider-value">
                                    {`${form.floatAmountB / 100}%`}
                                </div>
                            </div>
                        )}
                        {/* ENABLE WHEN DEBUGGING!  */}
                        {/* <p>{JSON.stringify(form, null, " ")}</p> */}
                    </div>
                </form>
            )}
        />
    );
};
