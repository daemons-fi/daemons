import React from "react";
import "./notifications.css";
import { INotification, NotificationProxy } from "../../data/storage-proxy/notification-proxy";
import { GetCurrentChain } from "../../data/chain-info";

export function notificationsPanel(
    hideDialog: () => void,
    notifications: INotification[],
    getNotifications: () => void
): JSX.Element {
    const notificationsComponent = (notification: INotification): JSX.Element => {
        const chainIconPath = GetCurrentChain(notification.chainId).iconPath;
        const formattedDate = new Date(notification.date).toLocaleString();
        return (
            <div
                key={notification._id}
                className="notification"
                onClick={() => {
                    hideDialog();
                }}
            >
                <div className="notification__separator"></div>
                <div className="notification__header">
                    <img className="notification__chain-icon" src={chainIconPath} />
                    <div className="notification__title">{notification.title}</div>
                    <div className="notification__divider">-</div>
                    <div className="notification__date">{formattedDate}</div>
                </div>
                <div className="notification__description">{notification.description}</div>
            </div>
        );
    };

    return (
        <div className="notifications-dialog">
            <div className="notifications-dialog__header">
                <div className="notifications-dialog__title">Notifications</div>
                <div className="notifications-dialog__ack-button">
                    <div
                        className="notifications-dialog__clear"
                        onClick={async () => {
                            await NotificationProxy.acknowledgeNotifications(
                                notifications.map((notification) => notification._id)
                            );
                            getNotifications();
                            hideDialog();
                        }}
                    >
                        Acknowledge all
                    </div>
                </div>
            </div>
            <div className="notifications-dialog__body">
                {notifications.map(notificationsComponent)}
            </div>
        </div>
    );
}
