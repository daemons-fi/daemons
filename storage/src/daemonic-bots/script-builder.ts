import { BaseScript, ZapInScript, ZapOutScript } from "@daemons-fi/scripts-definitions";
import { SwapScript } from "@daemons-fi/scripts-definitions";
import { TransferScript } from "@daemons-fi/scripts-definitions";
import { MmBaseScript } from "@daemons-fi/scripts-definitions";
import { MmAdvancedScript } from "@daemons-fi/scripts-definitions";

export async function parseScript(script: any): Promise<BaseScript> {
    switch (script.__type) {
        case "SwapScript":
            return await SwapScript.fromStorageJson(script);
        case "TransferScript":
            return await TransferScript.fromStorageJson(script);
        case "MmBaseScript":
            return await MmBaseScript.fromStorageJson(script);
        case "MmAdvancedScript":
            return await MmAdvancedScript.fromStorageJson(script);
        case "ZapInScript":
            return await ZapInScript.fromStorageJson(script);
        case "ZapOutScript":
            return await ZapOutScript.fromStorageJson(script);
        default:
            throw new Error("Unsupported script type: " + script.__type);
    }
}
