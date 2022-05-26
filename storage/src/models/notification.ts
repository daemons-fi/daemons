import mongoose from "mongoose";
import { utils } from "ethers";
import { stringifyBigNumber } from "./utils";

const notificationSchema = new mongoose.Schema({
    date: { type: String, required: false, set: () => new Date() },
    title: { type: String, required: true },
    description: { type: String, required: true },
    chainId: { type: String, required: true, index: true, set: stringifyBigNumber },
    user: { type: String, required: true, index: true, set: utils.getAddress },
});

export interface INotification {
    date?: string;
    title: string;
    description: string;
    chainId: string;
    user: string;
}

export interface INotificationDocument extends INotification, mongoose.Document { }

interface INotificationModelSchema extends mongoose.Model<INotificationDocument> {
    build(notification: INotification): INotificationDocument;
}

notificationSchema.statics.build = (notification: INotification) => new Notification(notification);
export const Notification = mongoose.model<INotificationDocument, INotificationModelSchema>('Notification', notificationSchema);

