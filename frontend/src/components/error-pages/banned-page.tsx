import React, { Component, ReactNode } from "react";
import "./styles.css";

export class BannedPage extends Component {
    public render(): ReactNode {
        return (
            <div className="banned">
                You've been banned, oh naughty you 👹.
                <br /><br />
                To know why and to ask for forgiveness,
                <a href="mailto:info@daemons.fi">Send us an email</a>
            </div>
        );
    }
}
