import React from "react";
import { ICurrentScript } from "../../script-factories/i-current-script";
import "./styles.css";


export function TemporaryScript({script}: {script: ICurrentScript}): JSX.Element {

    return (
        <div className="temporary-script">
            {script.description}
        </div>
    );
}
