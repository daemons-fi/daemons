import { connectToTestDb, closeTestDb, clearTestDb } from "../../test/test-db-handler";
import supertest from "supertest";
import { app } from "../../app";
import { expect } from "chai";
import jwt from "jsonwebtoken";
import { transactionDocumentFactory } from "@daemons-fi/db-schema";
import { IFetchedTxs, TRANSACTIONS_PAGE_SIZE } from "../transactions-router";

describe("GET api/transactions/executor/:chainId/:userAddress", () => {
    before(async () => await connectToTestDb());
    afterEach(async () => await clearTestDb());
    after(async () => await closeTestDb());

    const userAddress = "0xb79f76ef2c5f0286176833e7b2eee103b1cc3244";
    const jwToken = jwt.sign({ userAddress }, process.env.JWT_SECRET as string);

    it("only fetches transactions executed by the specified user", async () => {
        // add to the db a couple of transactions from the known user address
        const tx1 = await transactionDocumentFactory({ executingUser: userAddress });
        const tx2 = await transactionDocumentFactory({ executingUser: userAddress });
        const hashes = [tx1.hash, tx2.hash];

        // and another couple from random addresses
        await transactionDocumentFactory({});
        await transactionDocumentFactory({});

        const chainId = "42";
        const response = await supertest(app)
            .get(`/api/transactions/executor/${chainId}`)
            .set("Cookie", `token=${jwToken}`);

        const fetchedTransactions = response.body as IFetchedTxs;

        expect(fetchedTransactions.totalCount).to.equal(2);
        expect(hashes).to.include(fetchedTransactions.transactions[0].hash);
        expect(hashes).to.include(fetchedTransactions.transactions[1].hash);
    });

    it("only fetches transactions targeting the specified chain", async () => {
        // add to the db a couple of transactions on chain 42
        const tx1 = await transactionDocumentFactory({ executingUser: userAddress, chainId: "42" });
        const tx2 = await transactionDocumentFactory({ executingUser: userAddress, chainId: "42" });
        const hashes = [tx1.hash, tx2.hash];

        // and another couple from random addresses
        await transactionDocumentFactory({ chainId: "1" });
        await transactionDocumentFactory({ chainId: "15" });

        const chainId = "42";
        const response = await supertest(app)
            .get(`/api/transactions/executor/${chainId}`)
            .set("Cookie", `token=${jwToken}`);

        const fetchedTransactions = response.body as IFetchedTxs;

        expect(fetchedTransactions.totalCount).to.equal(2);
        expect(hashes).to.include(fetchedTransactions.transactions[0].hash);
        expect(hashes).to.include(fetchedTransactions.transactions[1].hash);
    });

    it("returns a 401 error if trying to fetch transactions while not authenticated", async () => {
        const chainId = "42";
        await supertest(app).get(`/api/transactions/executor/${chainId}`).expect(401);
    });

    it("returns paginated results", async () => {
        // create TRANSACTIONS_PAGE_SIZE + 2 transactions
        for (let i = 0; i < TRANSACTIONS_PAGE_SIZE + 2; i++)
            await transactionDocumentFactory({ executingUser: userAddress });

        const chainId = "42";
        const response = await supertest(app)
            .get(`/api/transactions/executor/${chainId}`)
            .set("Cookie", `token=${jwToken}`);

        // The first page should contain TRANSACTIONS_PAGE_SIZE elements
        const fetchedTransactionPage1 = response.body as IFetchedTxs;
        expect(fetchedTransactionPage1.totalCount).to.equal(22);
        expect(fetchedTransactionPage1.transactions.length).to.equal(TRANSACTIONS_PAGE_SIZE);

        const response2 = await supertest(app)
            .get(`/api/transactions/executor/${chainId}?page=2`)
            .set("Cookie", `token=${jwToken}`);

        // The second page should contain 2 elements
        const fetchedTransactionPage2 = response2.body as IFetchedTxs;
        expect(fetchedTransactionPage2.totalCount).to.equal(22);
        expect(fetchedTransactionPage2.transactions.length).to.equal(2);
    });
});
