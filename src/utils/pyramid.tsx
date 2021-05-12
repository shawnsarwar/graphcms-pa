import {
    NotificationIndicatorsResult,
    UserInfo,
    UserToken
} from './api_types';

import { HttpClient } from './http';

export class PyramidAPI extends HttpClient{
    
    url: string;
    username?: string;
    password?: string;
    token?: UserToken = '';

    public constructor(url: string, token: UserToken)
    public constructor(url: string, username: string, password: string)
    public constructor(url: string, username?: string, password?: string, token?: UserToken){
        super(url);
        this.url = url;
        if (username && password){
            this.username = username;
            this.password = password;
        }
        if(token) {
            this.token = token;
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

    public getNotificationCount = (user_id: string) => this.instance.post
        <NotificationIndicatorsResult>(
            '/API2/notification/getNotificationIndicators',
            {
                auth: this.token,
                userId: user_id                
            }
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
}