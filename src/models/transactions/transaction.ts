import { Event, utils } from "ethers";
import mongoose from "mongoose";
import { ITransaction } from "@daemons-fi/shared-definitions";
import { cleanScriptType, truncateAndEscapeText } from "../utils";
import { Script } from "../scripts/script";
import { getTxCostsAndProfits } from "./tx-cost-and-profits";

const transactionSchema = new mongoose.Schema({
    hash: { type: String, required: true, index: { unique: true } },
    chainId: { type: String, required: true },
    scriptId: { type: String, required: true },
    scriptType: { type: String, required: true, set: cleanScriptType },
    description: { type: String, required: true, maxlength: 150, set: truncateAndEscapeText },
    executingUser: { type: String, required: true, set: utils.getAddress },
    beneficiaryUser: { type: String, required: true, index: true, set: utils.getAddress },
    date: { type: Date, required: true },
    costEth: { type: Number, required: true },
    costDAEM: { type: Number, required: true },
    profitDAEM: { type: Number, required: true }
});

interface ITransactionDocument extends ITransaction, mongoose.Document {}

interface ITransactionModelSchema extends mongoose.Model<ITransactionDocument> {
    build(transaction: ITransaction): ITransactionDocument;
    buildFromEvent(
        scriptId: string,
        scriptOwner: string,
        executor: string,
        event: Event
    ): Promise<ITransactionDocument | undefined>;
}

transactionSchema.statics.build = (transaction: ITransaction) => new Transaction(transaction);
transactionSchema.statics.buildFromEvent = async (
    scriptId: string,
    scriptOwner: string,
    executor: string,
    event: Event
): Promise<ITransactionDocument | undefined> => {
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
};

export const Transaction = mongoose.model<ITransactionDocument, ITransactionModelSchema>(
    "Transaction",
    transactionSchema
);
