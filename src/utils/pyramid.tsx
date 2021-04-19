import { AxiosRequestConfig } from 'axios';

import {
    NotificationIndicatorsResult,
    UserToken
} from './api_types';

import { HttpClient } from './http';

export class PyramidAPI extends HttpClient{
    
    username: string;
    password: string;
    token: UserToken = '';

    public constructor(url: string, username: string, password: string){
        super(url)
        this.username = username;
        this.password = password;
    }

    public async signIn(){
        this.token = await this.authenticateUser(this.username, this.password);
        console.log(this.token);
    }

    public authenticateUser = (username: string, password: string) => this.instance.post<
        UserToken
        >(
            '/API2/auth/authenticateUser',
            {data: {
                userName: username,
                password: password
            }}
        )

    public getNotificationCount = (user_id: string) => this.instance.post<
        NotificationIndicatorsResult
        >(
            '/API2/notification/getNotificationIndicators',
            {
                auth: this.token,
                userId: user_id                
            }
        )
    
    public getMe = () => this.instance.post<
        string
        >(
            '/API2/access/getMe',
            {auth: this.token}
        )
}