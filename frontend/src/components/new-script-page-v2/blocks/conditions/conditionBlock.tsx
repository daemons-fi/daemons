import React from 'react';
interface IBlockProps {
    title: string;
    enabled: boolean;
    toggleEnabled: () => void;
    children: any;
}

export const ConditionBlock = (props: IBlockProps) => {
    return (
        <div className={`script-block ${props.enabled ? "script-block--selected" : ""} `}>
            <div className='script-block__accordion' onClick={props.toggleEnabled}>
                <label className='script-block__title'>{props.title}</label>
                <input type="checkbox"
                    name="enabled"
                    className='script-block__selection-checkbox'
                    checked={props.enabled}
                    onChange={() => {/* Do nothing. Handled on parent div*/ }}
                />
            </div>
            <div className='script-block__panel'>
                {props.enabled ? props.children : null}
            </div>
        </div >
    );
};
