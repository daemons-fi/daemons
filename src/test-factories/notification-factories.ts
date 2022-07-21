import { INotification, Notification } from "../models/notification";
import { BigNumber } from "ethers";
import faker from "@faker-js/faker";

/** Returns a randomized notification */
export function notificationFactory(args: any): INotification {
    return {
        date: args.date ?? new Date(),
        title: args.title ?? faker.random.words(2),
        description: args.description ?? faker.random.words(4),
        chainId: args.chainId ?? BigNumber.from("42"),
        user: args.user ?? faker.finance.ethereumAddress(),
    }
}

/** Adds a notification to mongo and returns it */
export async function notificationDocumentFactory(args: any): Promise<INotification> {
    const notification = notificationFactory(args);

    // this step simulates the transformation the object goes through when it is passed into
    // the body of a POST (i.e. BigNumber fields are serialized and not deserialized to the original object)
    const jsonTransformedNotification = JSON.parse(JSON.stringify(notification));

    return await Notification.build(jsonTransformedNotification).save();
}