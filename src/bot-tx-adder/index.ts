import { gasTankABI } from "@daemons-fi/contracts";
import { ethers } from "ethers";
import { rootLogger } from "../logger";
import { getProvider, IChainWithContracts, supportedChains } from "../utils/providers-builder";
import { buildTxFromEvent } from "./build-tx-from-event";

const logger = rootLogger.child({ source: "Tx-Adder Bot" });

/**
 * ## Tx-Adder Bot 🤖🔌
 *
 * The Tx-Adder bot (Luca) listens to the logs from the GasTank and is triggered anytime
 * a script is executed. With that info, it adds new transactions in the db.
 */
export class TxAdderBot {
    private static readonly instance = new TxAdderBot();
    private gasTanks: ethers.Contract[] = [];

    public static execute = (): void => {
        logger.debug({ message: "Starting" });

        // remove current listeners
        this.instance.removeListeners();

        // and restart
        for (const chain of Object.values(supportedChains)) {
            this.instance.setupConnectionOnChain(chain);
        }
    };

    private setupConnectionOnChain(chain: IChainWithContracts): void {
        const provider = getProvider(chain.id);

        const gasTank = new ethers.Contract(chain.contracts.GasTank, gasTankABI, provider);
        gasTank.on("ScriptExecuted", buildTxFromEvent);
        this.gasTanks.push(gasTank);

        logger.debug({ message: `setup complete`, chain: chain.name });
    }

    private removeListeners(): void {
        this.gasTanks.forEach(gasTank => {gasTank.removeAllListeners()});
        logger.debug({ message: `removed ${this.gasTanks.length} listeners` });
        this.gasTanks = [];
    }
}
