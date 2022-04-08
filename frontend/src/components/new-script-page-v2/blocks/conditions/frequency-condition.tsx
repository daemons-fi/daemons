import React from 'react';
import { Form, Field } from 'react-final-form';
import { IFrequencyConditionForm } from "../../../../data/chains-data/condition-form-interfaces";

const validateForm = (form: IFrequencyConditionForm) => {
    const errors: any = {};
    if (!form.ticks || (form.ticks as any) === '') {
        errors.ticks = 'required';
    }
    if (form.ticks && Number(form.ticks) <= 0) {
        errors.ticks = 'required > 0';
    }
    return errors;
};

const isFormValid = (values: IFrequencyConditionForm) => {
    const errors = validateForm(values);
    const isValid = Object.keys(errors).length === 0;
    return isValid;
};

export const FrequencyCondition = ({ form, update }: { form: IFrequencyConditionForm; update: (next: IFrequencyConditionForm) => void; }) => {

    return (
        <Form
            initialValues={form}
            validate={validateForm}
            onSubmit={() => { /** Individual forms are not submitted */ }}
            render={({ handleSubmit, valid }) => (
                <form onSubmit={handleSubmit}>
                    <div className='frequency-block'>
                        <div className='script-block__panel--row'>

                            <Field name="ticks"
                                component="input"
                                type="number"
                                placeholder='0'
                                step="1"
                            >
                                {({ input, meta }) =>
                                    <input
                                        {...input}
                                        className={`frequency-block__ticks ${meta.error ? 'script-block__field--error' : null}`}
                                        onChange={(e) => {
                                            e.target.value = String(Number(e.target.value));
                                            e.target.value = Number(e.target.value) < 1 ? '1' : e.target.value;
                                            input.onChange(e);
                                            const updatedForm = { ...form, ticks: Number(e.target.value) };
                                            const valid = isFormValid(updatedForm);
                                            update({ ...updatedForm, valid });
                                        }}
                                    />
                                }
                            </Field>

                            <Field
                                name="unit"
                                component="select"
                            >
                                {({ input }) => <select
                                    {...input}
                                    onChange={(e) => {
                                        input.onChange(e);
                                        update({ ...form, unit: Number(e.target.value) });
                                    }}
                                    className='frequency-block__time-unit'
                                >
                                    <option value={1}>Seconds</option>
                                    <option value={60}>Minutes</option>
                                    <option value={3600}>Hours</option>
                                    <option value={86400}>Days</option>
                                    <option value={604800}>Weeks</option>
                                </select>}
                            </Field>
                        </div>

                        <div className='script-block__panel--row'>

                            <label htmlFor="id-start-immediately-frequency">
                                Starting immediately
                            </label>

                            <Field
                                name="startNow"
                                type="checkbox"
                            >
                                {({ input }) => <input
                                    id="id-start-immediately-frequency"
                                    {...input}
                                    onChange={(e) => {
                                        input.onChange(e);
                                        update({ ...form, startNow: e.target.checked });
                                    }}
                                    className='frequency-block__starting-point'
                                />}
                            </Field>

                        </div >
                    </div >
                </form>
            )}
        />
    );
};
