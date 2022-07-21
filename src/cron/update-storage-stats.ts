import fetch from "cross-fetch";

export const updateStorageStats = async (): Promise<void> => {
    console.log("updateStorageStats - Starting");

    const url = `${process.env.STORAGE_ENDPOINT}/admin/update-stats/`;
    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            api_key: process.env.ADMIN_KEY
        },
        credentials: "include"
    };

    const response = await fetch(url, requestOptions as any);
    console.log(`updateStorageStats - Ended with status ${response.status}`);
    if (response.status === 200) return;

    const responseText = await response.text();
    console.log(responseText);
};
