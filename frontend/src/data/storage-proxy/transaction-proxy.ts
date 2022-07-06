import { BaseScript } from '@daemons-fi/scripts-definitions';
import { ITransaction, TransactionOutcome } from '@daemons-fi/shared-definitions';
import { TransactionResponse, TransactionReceipt } from '@ethersproject/abstract-provider';
import { utils } from 'ethers';
import { storageAddress } from '.';
import { CacheDuration, Cacher } from '../cacher';


export class TransactionProxy {

    /**
     * Informs the storage that a transaction has been executed.
     * Some values are unknown yet, but will be verified by the tx beneficiary.
     * */
    public static async addTransaction(
        txResponse: TransactionResponse,
        script: BaseScript,
        executingUser: string
    ): Promise<void> {
        console.log(`Adding transaction ${txResponse.hash}`);
        const transaction: ITransaction = {
            hash: txResponse.hash,
            scriptId: script.getId(),
            scriptType: script.ScriptType,
            description: script.getDescription(),
            chainId: script.getMessage().chainId,
            executingUser: utils.getAddress(executingUser),
            beneficiaryUser: utils.getAddress(script.getUser()),
            date: new Date(),
            outcome: TransactionOutcome.Waiting,
        };

        const url = `${storageAddress}/transactions`;
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(transaction),
        };

        await fetch(url, requestOptions as any);
    }

    /**
     * Fills up the missing info from the transaction.
     * Can only be executed by the tx beneficiary.
     * */
    public static async confirmTransaction(
        txHash: string,
        txReceipt: TransactionReceipt,
    ): Promise<ITransaction> {
        if (!txReceipt) {
            throw new Error('Tx Receipt is empty, cannot verify');
        }

        console.log(`Confirming transaction ${txHash}`);
        const transactionAdditionalInfo = {
            outcome: this.extractOutcomeFromStatus(txReceipt.status),
        };

        const url = `${storageAddress}/transactions/${txHash}/update`;
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(transactionAdditionalInfo),
        };

        const response = await fetch(url, requestOptions as any);
        return await response.json();
    }

    private static extractOutcomeFromStatus(status?: number): TransactionOutcome {
        switch (status) {
            case undefined:
                return TransactionOutcome.NotFound;
            case 0:
                return TransactionOutcome.Failed;
            case 1:
                return TransactionOutcome.Confirmed;
            default:
                return TransactionOutcome.NotFound;
        };
    }

    public static async fetchUserTransactions(chainId?: string, user?: string, useCache: boolean = true, page?: number): Promise<ITransaction[]> {
        const f = async () => {
            if (!user || !chainId) {
                console.warn("Missing user or chain id. User transactions fetch aborted");
                return [];
            }

            console.log(`Fetching user ${user} transactions for chain ${chainId}`);
            const url = `${storageAddress}/transactions/receiver/${chainId}/${user}`;

            const requestOptions = { method: 'GET', credentials: 'include' };
            const response = await fetch(url, requestOptions as any);
            if (response.status !== 200) return [];

            const transactions: ITransaction[] = await response.json();
            return transactions;
        }

        return await Cacher.fetchData(`transactions/receiver/${chainId}/${user}`, f, CacheDuration.fifteenMinutes, !useCache);
    }

    public static async fetchExecutedTransactions(chainId?: string, user?: string, useCache: boolean = true, page?: number): Promise<ITransaction[]> {
        const f = async () => {
            if (!user || !chainId) {
                console.warn("Missing user or chain id. Executed transactions fetch aborted");
                return [];
            }

            console.log(`Fetching transactions executed by ${user} on chain ${chainId}`);
            const url = `${storageAddress}/transactions/executor/${chainId}/${user}`;

            const requestOptions = { method: 'GET', credentials: 'include' };
            const response = await fetch(url, requestOptions as any);
            if (response.status !== 200) return [];

            const transactions: ITransaction[] = await response.json();
            return transactions;
        }
        return await Cacher.fetchData(`transactions/executor/${chainId}/${user}`, f, CacheDuration.fifteenMinutes, !useCache);
    }
}
