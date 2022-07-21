import { connectToTestDb, closeTestDb, clearTestDb } from '../../test/test-db-handler';
import supertest from 'supertest';
import { app } from '../../app';
import { transferScriptDocumentFactory } from '../../test-factories/script-factories';
import { expect } from 'chai';
import { TransferScript } from '../../models/scripts/transfer-script';
import jwt from 'jsonwebtoken';

describe('POST api/scripts/revoke', () => {
    before(async () => await connectToTestDb());
    afterEach(async () => await clearTestDb());
    after(async () => await closeTestDb());

    const userAddress = '0xb79f76ef2c5f0286176833e7b2eee103b1cc3244';
    const jwToken = jwt.sign({ userAddress }, process.env.JWT_SECRET as string);

    it('successfully removes a script from the db if it exists', async () => {
        const script = await transferScriptDocumentFactory({ user: userAddress });
        const payload = { scriptId: script.scriptId };

        await supertest(app)
            .post("/api/scripts/revoke")
            .set('Cookie', `token=${jwToken}`)
            .send(payload)
            .expect(200);

        const fetchedScript = await TransferScript.findOne({ scriptId: payload.scriptId });
        expect(fetchedScript).to.be.null;
    });

    it('handles the request gracefully if the script does not exist', async () => {
        const payload = { scriptId: "nonexistent" };

        await supertest(app)
            .post("/api/scripts/revoke")
            .set('Cookie', `token=${jwToken}`)
            .send(payload)
            .expect(200);
    });


    it('returns a 401 error if an unauthenticated user tries to update a description', async () => {
        const script = await transferScriptDocumentFactory({ user: userAddress });
        const payload = { scriptId: script.scriptId };

        await supertest(app)
            .post("/api/scripts/revoke")
            .send(payload)
            .expect(401);

        // script is untouched
        const fetchedScript = await TransferScript.findOne({ scriptId: payload.scriptId });
        expect(fetchedScript).to.not.be.null;
    });

    it('only revokes owned scripts', async () => {
        const script = await transferScriptDocumentFactory({}); // will belong to a random user
        const payload = { scriptId: script.scriptId };

        await supertest(app)
            .post("/api/scripts/revoke")
            .set('Cookie', `token=${jwToken}`)
            .send(payload)
            .expect(200);  // handled gracefully

        // script is untouched
        const fetchedScript = await TransferScript.findOne({ scriptId: payload.scriptId });
        expect(fetchedScript).to.not.be.null;
    });
});
