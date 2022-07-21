import fetch from "cross-fetch";
import { getTreasuryStats } from "../chain-proxy/treasury-querier";

export const updateTreasuryStats = async (): Promise<void> => {
    console.log("updateTreasuryStats - Starting");

    const kovanStats = await getTreasuryStats();

    const url = `${process.env.STORAGE_ENDPOINT}/admin/treasury-stats/`;
    const requestOptions = {
        method: "POST",
        body: JSON.stringify(kovanStats),
        headers: {
            "Content-Type": "application/json",
            api_key: process.env.ADMIN_KEY
        },

        credentials: "include"
    };

    const response = await fetch(url, requestOptions as any);
    console.log(`updateTreasuryStats - Ended with status ${response.status}`);
    if (response.status === 200) return;

    const responseText = await response.text();
    console.log(responseText);
};
