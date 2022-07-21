import { expect } from 'chai';
import { notificationDocumentFactory, notificationFactory } from '../notification-factories';
import { Notification } from '../../models/notification';
import { connectToTestDb, closeTestDb, clearTestDb } from "../../test/test-db-handler";

describe('notificationFactory', () => {
    before(async () => await connectToTestDb());
    afterEach(async () => await clearTestDb());
    after(async () => await closeTestDb());

    it('factory returns a notification', async () => {
        const notification = notificationFactory({});
        expect(notification.date).is.not.null;
        expect(notification.title).is.not.null;
        expect(notification.description).is.not.null;
        expect(notification.chainId).is.not.null;
        expect(notification.user).is.not.null;
    });

    it('saves a notification in mongo', async () => {
        await notificationDocumentFactory({
            title: "New notification!",
            description: "Something happened",
            chainId: "42",
            user: "0xB79f76EF2c5F0286176833E7B2eEe103b1CC3244"
        });

        const notifications = await Notification.find({})
        expect(notifications.length).to.equal(1);
        expect(notifications[0].title).to.equal("New notification!");
        expect(notifications[0].description).to.equal("Something happened");
        expect(notifications[0].chainId).to.equal("42");
        expect(notifications[0].user).to.equal("0xB79f76EF2c5F0286176833E7B2eEe103b1CC3244");
    });

    it('adds the checksum to the user address', async () => {
        await notificationDocumentFactory({
            title: "New notification!",
            description: "Something happened",
            chainId: "42",
            user: "0xb79f76ef2c5f0286176833e7b2eee103b1cc3244"
        });

        const notifications = await Notification.find({})
        expect(notifications[0].user).to.equal("0xB79f76EF2c5F0286176833E7B2eEe103b1CC3244");
    });
});
