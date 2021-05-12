export type UserToken = string;

export type UserInfo = {
    id: string
}

export type NotificationIndicatorsResult = {
    models?: number;
    subscriptions?: number;
    alerts?: number;
    publications?: number;
    conversations?: number;
};