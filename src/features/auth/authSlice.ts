import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';

export interface LoginCredentials{
    user_name: string,
    password: string,
    domain: string,
    embedDomain: string
}

export interface TokenCredentials{
    token: string,
    domain: string
}

export interface LoginSession{
    token: string,
    embedToken: string,
    embedDomain: string,
    domain: string,
    user_id: string
    user_name: string
}

const initialState: LoginSession = {
    token: '',
    embedToken: '',
    embedDomain: '',
    domain: '',
    user_id: '',
    user_name: ''
};


export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setLoginSession: (state, action: PayloadAction<LoginSession>) => {
            state.domain = action.payload.domain;
            state.token = action.payload.token;
            state.embedToken = action.payload.embedToken;
            state.embedDomain = action.payload.embedDomain;
            state.user_id = action.payload.user_id;
            state.user_name = action.payload.user_name;
        },
    }
});

export const {
    setLoginSession,
} = authSlice.actions;

export const selectLoginSession = (state: RootState) => {
    return {...state.auth};
}

export default authSlice.reducer;
