import supertest from 'supertest';
import { app } from '../../app';
import { expect } from 'chai';
import { Wallet } from 'ethers';


describe('POST api/auth/login', () => {

    const wallet = new Wallet('aad3d5dc85a9e12c2942221434c8a394a6d20d3bfdfb06697cd7634b091c2344');

    async function fetchAndSignMessage(): Promise<string> {
        const messageResponse = await supertest(app)
            .get(`/api/auth/message-to-sign/${wallet.address}`)
            .expect(200);
        const message = messageResponse.body.message;

        return await wallet.signMessage(message);
    }

    it('correctly authenticates the user', async () => {
        const payload = {
            userAddress: wallet.address,
            signedMessage: await fetchAndSignMessage(),
        };

        const loginResponse = await supertest(app)
            .post(`/api/auth/login`)
            .send(payload)
            .expect(200);

        expect(loginResponse.headers['set-cookie']).is.not.undefined;
        expect(loginResponse.headers['set-cookie'][0]).includes('Secure');
        expect(loginResponse.headers['set-cookie'][0]).includes('HttpOnly');
    });

    it('is safe against replay attacks', async () => {
        const payload = {
            userAddress: wallet.address,
            signedMessage: await fetchAndSignMessage(),
        };

        // first time goes through
        await supertest(app)
            .post(`/api/auth/login`)
            .send(payload)
            .expect(200);

        // second time it does not
        await supertest(app)
            .post(`/api/auth/login`)
            .send(payload)
            .expect(403);
    });
});
