import { storageAddress } from '.';

export interface INotification {
    _id: string;
    date: string;
    title: string;
    description: string;
    chainId: string;
    user: string;
}

export class NotificationProxy {

    public static async fetchNotifications(): Promise<INotification[]> {
        const requestOptions = { method: "GET", credentials: "include" };
        const response = await fetch(`${storageAddress}/notifications`, requestOptions as any);
        if (response.status !== 200) return [];

        const notifications: INotification[] = await response.json();
        return notifications;
    }

    public static async acknowledgeNotifications(ids: string[]): Promise<boolean> {
        const requestOptions = { method: "POST", credentials: "include", body: JSON.stringify({ ids: ids }) };
        const response = await fetch(`${storageAddress}/notifications`, requestOptions as any);
        if (response.status !== 200) return false;

        return true;
    }
}