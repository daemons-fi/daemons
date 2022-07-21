import { gasTankABI } from "@daemons-fi/abis/build";
import { ethers } from "ethers";
import { Transaction } from "../models/transactions/transaction";
import { getProvider, IChainWithContracts, supportedChains } from "../utils/providers-builder";

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
        gasTank.on("ScriptExecuted", Transaction.buildFromEvent);

        console.log(`[🤖🔌 Tx-Adder Bot] setup complete for ${chain.name}`);
    }
}
