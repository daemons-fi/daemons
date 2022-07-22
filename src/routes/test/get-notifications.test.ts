import { connectToTestDb, closeTestDb, clearTestDb } from '../../test/test-db-handler';
import supertest from 'supertest';
import { app } from '../../app';
import { expect } from 'chai';
import jwt from 'jsonwebtoken';
import { notificationDocumentFactory } from '@daemons-fi/db-schema';


describe('GET api/notifications', () => {

    before(async () => await connectToTestDb());
    afterEach(async () => await clearTestDb());
    after(async () => await closeTestDb());

    const userAddress = '0xb79f76ef2c5f0286176833e7b2eee103b1cc3244';
    const jwToken = jwt.sign({ userAddress }, process.env.JWT_SECRET as string);

    it('returns an empty array if there are no notifications of the given user on the db', async () => {
        // add to the db one notification from a random generated user
        await notificationDocumentFactory({});

        const response = await supertest(app)
            .get(`/api/notifications`)
            .set('Cookie', `token=${jwToken}`);

        const fetchedNotifications = response.body;

        expect(fetchedNotifications.length).to.equal(0);
    });

    it('only fetches notification belonging to the specified user', async () => {
        // add to the db one notification from the known user address
       const notification = await notificationDocumentFactory({ user: userAddress });
        await notificationDocumentFactory({ });

        const response = await supertest(app)
            .get(`/api/notifications`)
            .set('Cookie', `token=${jwToken}`);

        const fetchedNotifications = response.body;

        expect(fetchedNotifications.length).to.equal(1);
        expect(fetchedNotifications[0].user).to.equal(notification.user);
    });


    it('returns a 401 error if trying to fetch notifications  while not authenticated', async () => {
        await supertest(app)
            .get(`/api/notifications`)
            .expect(401);
    });
});
