import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';

export interface LoginCredentials{
    user_name: string,
    password: string,
    domain: string
}

export interface LoginSession{
    token: string,
    embedToken: string,
    domain: string,
    user_id: string
    user_name: string
    password: string // Remove after embed library fix merged
}

const initialState: LoginSession = {
    token: '',
    embedToken: '',
    domain: '',
    user_id: '',
    user_name: '',
    password: '' // Remove after embed library fix merged
};


export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setLoginSession: (state, action: PayloadAction<LoginSession>) => {
            state.domain = action.payload.domain;
            state.token = action.payload.token;
            state.embedToken = action.payload.embedToken;
            state.user_id = action.payload.user_id;
            state.user_name = action.payload.user_name;
            state.password = action.payload.password; // Remove after embed library fix merged
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
