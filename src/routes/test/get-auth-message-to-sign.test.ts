import supertest from 'supertest';
import { app } from '../../app';
import { expect } from 'chai';


describe('GET api/auth/message-to-sign/:userAddress', () => {

    const userAddress = '0xb79f76ef2c5f0286176833e7b2eee103b1cc3244';

    it('retrieved message includes unique OTP', async () => {
        const getOTP = async () => {
            const response = await supertest(app)
                .get(`/api/auth/message-to-sign/${userAddress}`)
                .expect(200);
            const message = response.body.message;
            return message.split(' ').slice(-1);
        };

        expect(await getOTP())
            .is.not.equal(await getOTP())
            .is.not.equal(await getOTP());
    });
});
