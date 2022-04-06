import React from 'react';
import { IRepetitionsConditionForm } from './conditions-interfaces';
import { Form, Field } from 'react-final-form';


const validateForm = (form: IRepetitionsConditionForm) => {
    const errors: any = {};
    if (!form.amount || (form.amount as any) === '') {
        errors.amount = 'required';
    }
    if (form.amount && Number(form.amount) <= 0) {
        errors.amount = 'required > 0';
    }
    return errors;
};

const isFormValid = (values: IRepetitionsConditionForm) => {
    const errors = validateForm(values);
    const isValid = Object.keys(errors).length === 0;
    return isValid;
};


export const RepetitionsCondition = ({ form, update }: { form: IRepetitionsConditionForm; update: (next: IRepetitionsConditionForm) => void; }) => {
    return (
        <Form
            initialValues={form}
            validate={validateForm}
            onSubmit={() => { /** Individual forms are not submitted */ }}
            render={({ handleSubmit }) => (
                <form onSubmit={handleSubmit} autoComplete="off">
                    <div className='script-block__panel--row repetitions-block'>

                        <Field name="amount"
                            component="input"
                            type="number"
                            placeholder='1'
                            step="1"
                        >
                            {({ input, meta }) =>
                                <input
                                    {...input}
                                    className={`repetitions-block__ticks ${meta.error ? 'script-block__field--error' : null}`}
                                    onChange={(e) => {
                                        e.target.value = String(Number(e.target.value));
                                        e.target.value = Number(e.target.value) < 1 ? '1' : e.target.value;
                                        input.onChange(e);
                                        const updatedForm = { ...form, amount: Number(e.target.value) };
                                        const valid = isFormValid(updatedForm);
                                        update({ ...updatedForm, valid });
                                    }}
                                />
                            }
                        </Field>

                    </div >
                </form>
            )}
        />
    );
};
