import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { BaseScript } from "../../data/script/base-script";
import { RootState } from "../../state";
import { MyPageScript } from "./user-script";
import "./styles.css";
import { Link } from "react-router-dom";
import { cleanWorkbench } from "../../state/action-creators/workbench-action-creators";

export function UserScriptsContainer(): JSX.Element {
    const dispatch = useDispatch();
    const userScripts = useSelector((state: RootState) => state.script.userScripts);

    const scripts = userScripts.map((script: BaseScript) => (
        <MyPageScript key={script.getId()} script={script} />
    ));
    return (
        <div className="card">
            <div className="card__header">
                <div className="card__title">Scripts</div>
                <Link
                    onClick={() => dispatch(cleanWorkbench())}
                    className="add-new-script-button"
                    to={"/new-script"}
                >
                    New Script
                </Link>
            </div>

            <div className="scripts-container">
                {scripts.length > 0 ? scripts : <div>You don't have any script</div>}
            </div>
        </div>
    );
}
