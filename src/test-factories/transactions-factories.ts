import { utils } from "ethers";
import { ITransaction } from "@daemons-fi/shared-definitions";
import { Transaction } from "../models/transactions/transaction";
import faker from "@faker-js/faker";

const randomScriptType = () =>
    faker.helpers.arrayElement(["Swap", "Transaction", "MmBase", "MmAdvanced", "Bridge"]);

/** Returns a randomized transaction */
export function transactionFactory(args: any): ITransaction {
    return {
        hash: args.hash ?? utils.hexlify(utils.randomBytes(32)),
        scriptId: args.scriptId ?? utils.hexlify(utils.randomBytes(32)),
        scriptType: args.scriptType ?? randomScriptType(),
        description: args.description ?? faker.random.words(4),
        chainId: args.chainId ?? "42",
        executingUser: args.executingUser ?? faker.finance.ethereumAddress(),
        beneficiaryUser: args.beneficiaryUser ?? faker.finance.ethereumAddress(),
        date: args.date ?? new Date,
        costEth: args.costEth ?? faker.datatype.number({ min: 0.01, max: 0.1, precision: 0.005 }),
        costDAEM: args.costDAEM ?? faker.datatype.number({ min: 0.01, max: 0.1, precision: 0.005 }),
        profitDAEM:
            args.profitDAEM ?? faker.datatype.number({ min: 0.01, max: 0.1, precision: 0.005 })
    };
}

/** Adds a Transaction to mongo and returns it */
export async function transactionDocumentFactory(args: any): Promise<ITransaction> {
    const transaction = transactionFactory(args);

    // this step simulates the transformation the object goes through when it is passed into
    // the body of a POST (i.e. BigNumber fields are serialized and not deserialized to the original object)
    const jsonTransformedTransaction = JSON.parse(JSON.stringify(transaction));

    return await Transaction.build(jsonTransformedTransaction).save();
}
