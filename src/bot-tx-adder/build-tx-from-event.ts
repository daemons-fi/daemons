import { Event, utils } from "ethers";
import { ITransaction } from "@daemons-fi/shared-definitions";
import { getTxCostsAndProfits } from "./get-tx-cost-and-profits";
import { Script, Transaction } from "@daemons-fi/db-schema";

export async function buildTxFromEvent(
        scriptId: string,
        scriptOwner: string,
        executor: string,
        event: Event
    ): Promise<ITransaction | undefined> {
        console.log({
        message: `[Transaction] Building from blockchain event`,
        scriptOwner,
        executor,
        scriptId
    });

    // self-executing does not generate transactions
    if (scriptOwner === executor) return;

    // if tx already exists, abort
    const txHash = event.transactionHash;
    if (await Transaction.exists({ hash: txHash })) return;

    // otherwise create the transaction!
    const script = await Script.findOne({ scriptId: scriptId });
    if (!script) {
        console.error({ message: `could not find script`, scriptId });
        return;
    }

    try {
        const scriptType = (script as any).__type;
        const costsAndProfits = await getTxCostsAndProfits(script);
        const block = await event.getBlock();
        const timestamp = block ? block.timestamp * 1000 : Date.now();

        const tx = {
            hash: txHash,
            scriptId: scriptId,
            chainId: script.chainId,
            description: script.description,
            beneficiaryUser: utils.getAddress(scriptOwner),
            executingUser: utils.getAddress(executor),
            date: new Date(timestamp),
            scriptType: scriptType,
            costDAEM: costsAndProfits.costDAEM,
            costEth: costsAndProfits.costETH,
            profitDAEM: costsAndProfits.profitDAEM
        } as ITransaction;

        console.log({
            message: `[Transaction] transaction added. Saving.`,
            tx
        });
        return await Transaction.build(tx).save();
    } catch (error) {
        console.error({ message: `[Transaction] Tx insertion aborted`, error });
    }
}
