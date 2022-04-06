import React from 'react';
import { IFollowConditionForm } from './conditions-interfaces';
import { Form, Field } from 'react-final-form';
import { BaseScript } from '../../../../data/script/base-script';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../state';

const validateForm = (form: IFollowConditionForm) => {
    return form.parentScriptId ? {} : { 'parentScriptId': 'required' };
};

const isFormValid = (values: IFollowConditionForm) => {
    const errors = validateForm(values);
    const isValid = Object.keys(errors).length === 0;
    return isValid;
};

export const FollowCondition = ({ form, update }: { form: IFollowConditionForm; update: (next: IFollowConditionForm) => void; }) => {
    const userScripts: BaseScript[] = useSelector((state: RootState) => state.script.userScripts);

    return (
        <Form
            initialValues={form}
            validate={validateForm}
            onSubmit={() => { /** Individual forms are not submitted */ }}
            render={({ handleSubmit, valid }) => (
                <form onSubmit={handleSubmit}>
                    <div className='follow-block'>

                        <Field
                            name="parentScriptId"
                            component="select"
                        >
                            {({ input, meta }) => <select
                                {...input}
                                className={`follow-block__parent ${meta.error ? 'script-block__field--error' : null}`}
                                onChange={(e) => {
                                    input.onChange(e);
                                    const script: BaseScript | undefined = userScripts.find(script => script.getId() === e.target.value);
                                    if (!script) return;
                                    const updatedForm = { ...form, parentScriptId: script.getId(), parentScriptExecutor: script.getExecutorAddress() };
                                    const valid = isFormValid(updatedForm);
                                    update({ ...updatedForm, valid });
                                }}
                            >
                                <option key={0} value="" disabled ></option>
                                {
                                    userScripts.map(script => (
                                        <option
                                            key={script.getId()}
                                            value={script.getId()}>
                                            {script.getId().substring(0, 16) + '...'}
                                        </option>
                                    ))
                                }
                            </select>}
                        </Field>
                    </div >
                </form>
            )}
        />
    );
};
