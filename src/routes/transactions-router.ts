import { ITransaction } from "@daemons-fi/shared-definitions/build";
import express, { Request, Response } from "express";
import { authenticate } from "../middlewares/authentication";
import { Transaction } from "@daemons-fi/db-schema";
import { rootLogger } from "../logger";

const routerLogger = rootLogger.child({ source: "transactionsRouter" });

export const transactionsRouter = express.Router();
export const TRANSACTIONS_PAGE_SIZE = 20;

export interface IFetchedTxs {
    transactions: ITransaction[];
    totalCount: number;
    itemsPerPage: number;
}

/** Get the transactions for this user */
transactionsRouter.get("/receiver/:chainId", authenticate, async (req: Request, res: Response) => {
    try {
        const chainId = String(req.params.chainId);
        const currentPage = (Number(req.query.page) ?? 1) - 1;

        const query = { chainId, beneficiaryUser: req.userAddress };
        const totalCount = await Transaction.countDocuments(query);

        const transactions = await Transaction.find(query)
            .lean()
            .skip(currentPage * TRANSACTIONS_PAGE_SIZE)
            .limit(TRANSACTIONS_PAGE_SIZE)
            .sort({ date: "desc" });
        return res.send({
            transactions,
            totalCount,
            itemsPerPage: TRANSACTIONS_PAGE_SIZE
        } as IFetchedTxs);
    } catch (error) {
        routerLogger.error({ message: "endpoint error", endpoint: "/receiver/:chainId", error });
        return res.status(500).send(error);
    }
});

/** Get the transactions for this executor */
transactionsRouter.get("/executor/:chainId/", authenticate, async (req: Request, res: Response) => {
    try {
        const chainId = String(req.params.chainId);
        const currentPage = (Number(req.query.page) ?? 1) - 1;

        const query = { chainId, executingUser: req.userAddress };
        const totalCount = await Transaction.countDocuments(query);

        const transactions = await Transaction.find(query)
            .lean()
            .skip(currentPage * TRANSACTIONS_PAGE_SIZE)
            .limit(TRANSACTIONS_PAGE_SIZE)
            .sort({ date: "desc" });
        return res.send({
            transactions,
            totalCount,
            itemsPerPage: TRANSACTIONS_PAGE_SIZE
        } as IFetchedTxs);
    } catch (error) {
        routerLogger.error({ message: "endpoint error", endpoint: "/executor/:chainId", error });
        return res.status(500).send(error);
    }
});
