import { connectToTestDb, closeTestDb, clearTestDb } from '../../test/test-db-handler';
import supertest from 'supertest';
import { app } from '../../app';
import { expect } from 'chai';
import jwt from 'jsonwebtoken';
import { notificationDocumentFactory } from '../../test-factories/notification-factories';
import { Notification } from "../../models/notification";


describe('POST api/notifications', () => {
    before(async () => await connectToTestDb());
    afterEach(async () => await clearTestDb());
    after(async () => await closeTestDb());

    const userAddress = '0xb79f76ef2c5f0286176833e7b2eee103b1cc3244';
    const jwToken = jwt.sign({ userAddress }, process.env.JWT_SECRET as string);

    it('successfully removes a notification from the db if it exists', async () => {
        await notificationDocumentFactory({ user: userAddress });

        const response = await supertest(app)
            .get(`/api/notifications`)
            .set('Cookie', `token=${jwToken}`);

        const fetchedNotifications = response.body;
        // ensure there is notification to be deleted
        expect(fetchedNotifications.length).to.equal(1);

        await supertest(app)
            .post("/api/notifications")
            .set('Cookie', `token=${jwToken}`)
            .send([fetchedNotifications[0]._id])
            .expect(200);

        const fetchedNotification = await Notification.find({});
        expect(fetchedNotification).to.have.length(0);
    });

    it('handles the request gracefully if the notification does not exist', async () => {
        const payload = ["nonexistentid"];

        await supertest(app)
            .post("/api/notifications")
            .set('Cookie', `token=${jwToken}`)
            .send(payload)
            .expect(200);
    });

    it('returns a 401 error if an unauthenticated user tries to delete a notification', async () => {
        await notificationDocumentFactory({ user: userAddress });
        const response = await supertest(app)
            .get(`/api/notifications`)
            .set('Cookie', `token=${jwToken}`);

        const fetchedNotifications = response.body;
        // ensure there is notification to be deleted
        expect(fetchedNotifications.length).to.equal(1);

        await supertest(app)
            .post("/api/notifications")
            .send([fetchedNotifications[0]._id])
            .expect(401);

        // notification is untouched
        const fetchedNotification = await Notification.find({});
        expect(fetchedNotification).to.not.be.null;
    });

    it('only revokes owned notifications', async () => {
        await notificationDocumentFactory({}); // will belong to a random user

        const fetchedNotification = await Notification.find({});
        expect(fetchedNotification.length).to.equal(1);

        await supertest(app)
            .post("/api/notifications")
            .set('Cookie', `token=${jwToken}`)
            .send(fetchedNotification[0]._id)
            .expect(200);  // handled gracefully

        // notification is untouched
        const fetchedNotificationAfter = await Notification.find({});
        expect(fetchedNotificationAfter.length).to.equal(1);
    });
});
