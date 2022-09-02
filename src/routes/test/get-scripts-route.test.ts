import { connectToTestDb, closeTestDb, clearTestDb } from '../../test/test-db-handler';
import supertest from 'supertest';
import { app } from '../../app';
import { mmBaseScriptDocumentFactory, swapScriptDocumentFactory, transferScriptDocumentFactory } from '@daemons-fi/db-schema';
import { expect } from 'chai';
import { ISignedSwapAction } from '@daemons-fi/shared-definitions';
import { BigNumber } from 'ethers';
import jwt from 'jsonwebtoken';


describe('GET api/scripts', () => {

    before(async () => await connectToTestDb());
    afterEach(async () => await clearTestDb());
    after(async () => await closeTestDb());

    const userAddress = '0xb79f76ef2c5f0286176833e7b2eee103b1cc3244';
    const jwToken = jwt.sign({ userAddress }, process.env.JWT_SECRET as string);

    it('returns an empty array if there are no scripts on the db', async () => {
        const chainId = "42";
        const response = await supertest(app)
            .get(`/api/scripts/${chainId}`)
            .set('Cookie', `token=${jwToken}`)
            .expect(200);

        const fetchedScripts = response.body as ISignedSwapAction[];

        expect(fetchedScripts.length).to.equal(0);
    });

    it('fetches all scripts', async () => {
        // add to the db some randomly generated scripts
        const swapScript1 = await swapScriptDocumentFactory({});
        const swapScript2 = await swapScriptDocumentFactory({});
        const transferScript1 = await transferScriptDocumentFactory({});
        const mmBaseScript1 = await mmBaseScriptDocumentFactory({});
        const ids = [swapScript1.scriptId, swapScript2.scriptId, transferScript1.scriptId, mmBaseScript1.scriptId];

        const chainId = "42";
        const response = await supertest(app)
            .get(`/api/scripts/${chainId}`)
            .set('Cookie', `token=${jwToken}`)
            .expect(200);

        const fetchedScripts = response.body as ISignedSwapAction[];

        expect(fetchedScripts.length).to.equal(4);
        expect(ids).to.include(fetchedScripts[0].scriptId);
        expect(ids).to.include(fetchedScripts[1].scriptId);
        expect(ids).to.include(fetchedScripts[2].scriptId);
        expect(ids).to.include(fetchedScripts[3].scriptId);
    });

    it('only fetches scripts with the given chain', async () => {
        // add to the db some scripts on the desired chain
        const swapScript = await swapScriptDocumentFactory({ chainId: BigNumber.from("42") });
        const transferScript = await transferScriptDocumentFactory({ chainId: BigNumber.from("42") });
        const mmBaseScript = await mmBaseScriptDocumentFactory({ chainId: BigNumber.from("42") });
        const ids = [swapScript.scriptId, transferScript.scriptId, mmBaseScript.scriptId];

        // and some on other chains
        await transferScriptDocumentFactory({ chainId: BigNumber.from("1") });
        await swapScriptDocumentFactory({ chainId: BigNumber.from("2") });
        await swapScriptDocumentFactory({ chainId: BigNumber.from("16665") });

        const chainId = "42";
        const response = await supertest(app)
            .get(`/api/scripts/${chainId}`)
            .set('Cookie', `token=${jwToken}`)
            .expect(200);

        const fetchedScripts = response.body as ISignedSwapAction[];

        expect(fetchedScripts.length).to.equal(3);
        expect(ids).to.include(fetchedScripts[0].scriptId);
        expect(ids).to.include(fetchedScripts[1].scriptId);
        expect(ids).to.include(fetchedScripts[2].scriptId);
    });

    it('returns a 200 if trying to fetch scripts while not authenticated', async () => {
        const chainId = "42";
        await supertest(app)
            .get(`/api/scripts/${chainId}`)
            .expect(200);
    });
});
