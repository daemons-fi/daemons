import React, { useState } from 'react';
import { Field } from 'react-final-form';


interface IToggleButtonFieldProps {
    name: string;
    updateFunction: (newValue: any) => void;
    valuesEnum: any;
    initial: any;
}

export function ToggleButtonField(props: IToggleButtonFieldProps): JSX.Element {
    const allKeys = Object.keys(props.valuesEnum);  // e.g.: ["0","1","Deposit","Withdraw"]
    const choices = allKeys.slice(0, allKeys.length / 2); // e.g.: ["0","1"]
    const [currentIndex, setCurrentIndex] = useState<any>(choices.indexOf(props.initial.toString())); // e.g.: 0;

    return (
        <Field
            name={props.name}>
            {({ input, meta }) => (
                <button
                    type="button"
                    className='script-block__toggle-button'
                    onClick={(e) => {
                        input.onChange(e);
                        const newValue = (currentIndex + 1) % choices.length;
                        setCurrentIndex((currentIndex + 1) % choices.length);
                        props.updateFunction(newValue);
                    }
                    }>
                    {props.valuesEnum[choices[currentIndex]]}
                </button>
            )}
        </Field>
    );
}
