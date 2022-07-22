import { gasTankABI } from "@daemons-fi/abis/build";
import { ethers } from "ethers";
import { getProvider, IChainWithContracts, supportedChains } from "../utils/providers-builder";
import { buildTxFromEvent } from "./build-tx-from-event";

/**
 * ## Tx-Adder Bot 🤖🔌
 *
 * The Tx-Adder bot (Luca) listens to the logs from the GasTank and is triggered anytime
 * a script is executed. With that info, it adds new transactions in the db.
 */
export class TxAdderBot {
    public static execute = (): void => {
        console.log(`[🤖🔌 Tx-Adder Bot] Starting`);

        for (const chain of Object.values(supportedChains)) {
            TxAdderBot.setupConnectionOnChain(chain);
        }
    };

    private static setupConnectionOnChain(chain: IChainWithContracts): void {
        const provider = getProvider(chain.id);

        const gasTank = new ethers.Contract(chain.contracts.GasTank, gasTankABI, provider);
        gasTank.on("ScriptExecuted", buildTxFromEvent);

        console.log(`[🤖🔌 Tx-Adder Bot] setup complete for ${chain.name}`);
    }
}
