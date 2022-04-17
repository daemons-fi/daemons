import React, { useEffect, useState } from "react";
import { ICurrentScript } from "../../script-factories/i-current-script";
import { ScriptFactory } from "../../script-factories";
import "./styles.css";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../state";
import { Token } from "../../data/chains-data/interfaces";
import { GetCurrentChain } from "../../data/chain-info";
import { Navigate } from "react-router-dom";

export function TemporaryScript({script}: {script: ICurrentScript}): JSX.Element {

    return (
        <div className="temporary-script">
            {script.description}
        </div>
    );
}
