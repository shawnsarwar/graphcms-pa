import {
    ContentFolder,
    ContentItem,
    NotificationIndicatorsResult,
    UserInfo,
    UserToken,
    TaskRunConfirmation
} from './api_types';

import { HttpClient } from './http';

export interface TokenGrant {
    discriminator: 'TokenGrant',
    url: string,
    token: UserToken
}

export function makeTokenGrant(url: string, token: string): TokenGrant{
    return {
        discriminator: 'TokenGrant',
        url: url,
        token: token
    } as TokenGrant
}

export interface PasswordGrant {
    discriminator: 'PasswordGrant',
    url: string,
    username: string,
    password: string
}

export function makePasswordGrant(url: string, username: string, password: string): PasswordGrant{
    return {
        discriminator: 'PasswordGrant',
        url: url,
        username: username,
        password: password
        
    } as PasswordGrant
}

export class PyramidAPI extends HttpClient{
    
    url: string;
    username?: string;
    password?: string;
    token?: UserToken = '';

    public constructor(auth: TokenGrant)
    public constructor(auth: PasswordGrant)
    public constructor(auth: any){
        super(auth.url);
        this.url = auth.url;
        if (auth?.discriminator === "TokenGrant"){
            this.token = auth.token;
        }else if(auth?.discriminator === "PasswordGrant"){
            this.username = auth.username;
            this.password = auth.password;
        }else{
            console.error(auth);
            throw Error(`Invalid Grant Type! ${auth.discriminator}`);
        }
    }

    public async signIn(){
        if (this.username && this.password){
            this.token = await this.authenticateUser(this.username, this.password);
        }
    }

    public authenticateUser = (username: string, password: string) => this.instance.post
        <UserToken>(
            '/API2/auth/authenticateUser',
            {data: {
                userName: username,
                password: password
            }}
        )

    public getMe = () => this.instance.post
        <UserInfo>(
            '/API2/access/getMe',
            {auth: this.token}
        )

    public adminGetEmbedToken = (user_name: string) => this.instance.post
        <string>(
            '/API2/auth/authenticateUserEmbedByToken',
            {
                userIdentity: user_name,
                token: this.token
            }
        )
    
    public userGetEmbedToken = (username: string, password: string, domain: string) => this.instance.post
        <string>(
            '/API2/auth/authenticateUserEmbed',
            {data: {
                userName: username,
                password: password,
                domain: domain
            }}
        )
    
    // Notifications
    
    public getNotificationCount = (user_id: string) => this.instance.post
    <NotificationIndicatorsResult>(
        '/API2/notification/getNotificationIndicators',
        {
            auth: this.token,
            userId: user_id                
        }
    )

    // Content

    public getUserPublicRootFolder = (userid: string) =>  this.instance.post
    <ContentFolder>(
        '/API2/content/getUserPublicRootFolder',
            {
                userId: userid,
                auth: this.token
            }
        )
    
    public getPrivateRootFolder = (userid: string) =>  this.instance.post
    <ContentFolder>(
        '/API2/content/getPrivateRootFolder',
            {
                userId: userid,
                auth: this.token
            }
        )
    
    public getPrivateFolderForUser = (userid: string) =>  this.instance.post
    <ContentFolder>(
        '/API2/content/getPrivateFolderForUser',
            {
                userId: userid,
                auth: this.token
            }
        )

    public getUserGroupRootFolder = (userid: string) =>  this.instance.post
    <ContentFolder>(
        '/API2/content/getUserGroupRootFolder',
            {
                userId: userid,
                auth: this.token
            }
        )
    
    public getFolderItems = (userid: string, folderid: string) =>  this.instance.post
    <Array<ContentItem>>(
        '/API2/content/getFolderItems',
            {
                folderId: folderid,
                userId: userid,
                auth: this.token
            }
        )

    // Tasks

    public reRunTask = (taskid: string) =>  this.instance.post
    <TaskRunConfirmation>(
        '/API2/tasks/reRunTask',
            {
                taskId: taskid,
                auth: this.token
            }
        )
    
    public runSchedule = (scheuldeid: string) => this.instance.post
    <string>(
        '/API2/tasks/runSchedule',
            {
                data: {
                    "scheduleId" : scheuldeid,
                    "checkTriggers": true
                },
                auth: this.token
            }
        )
}
