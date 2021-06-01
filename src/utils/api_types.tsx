export type UserToken = string;

export type UserInfo = {
    id: string
}

export type GenericId = {
    id: string
}

export type NotificationIndicatorsResult = {
    models?: number;
    subscriptions?: number;
    alerts?: number;
    publications?: number;
    conversations?: number;
};

export type ContentFolder = {
    id: string;
    parentId: string;
    caption: string;
    itemType: number;
    createdBy: string;
    createdDate: number;
    version: string;
    contentType: number;
}

export type ContentItem = {
    caption: string;
    contentType: number;
    id: string;
    itemType: number;
    parentId: string;
}

export type TaskRunConfirmation = {
    success: boolean,
    errorMessage: string,
    modifiedList: Array<GenericId>
}