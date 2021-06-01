import React from 'react';
import { RootState } from '../../app/store';
import { useSelector, useDispatch } from 'react-redux';
import {LoginCredentials, LoginSession, setLoginSession, selectLoginSession} from './authSlice';
import {makeSession} from './Helpers'

import styles from './Auth.module.css';

export enum AuthControllerType {
    StandAlone,
    Settings,
    Icon
}

interface AuthControllerProps {
    display?: AuthControllerType
}

export function AuthLogoutWidget(props?: AuthControllerProps){
    const state: LoginSession = useSelector((state: RootState) => selectLoginSession(state));
    var loggedIn : boolean = true ? state.token !== undefined && state.token !== "": false;
    const dispatch = useDispatch();

    function doLogout(){
        dispatch(setLoginSession({
            ...state,
            token: ""
        } as LoginSession));
    }

    if (!loggedIn){
        return (<div/>);
    }
    return (
        <div onClick={doLogout}>
            <button className={styles.logout_button}>
                <div className={styles.logout_icon}/>
                <span>Logout</span>
            </button>
        </div>
    );
}

export function AuthController(props? : AuthControllerProps){
    const state: LoginSession = useSelector((state: RootState) => selectLoginSession(state));
    var loggedIn : boolean = true ? state.token !== undefined && state.token !== "": false;
    const dispatch = useDispatch();
    

    function doLogin(creds: LoginCredentials){
        console.log(creds);
        makeSession(creds).then((sess? :LoginSession) => {
            if (sess === undefined){
                console.error('Bad credentials');
                return;
            }
            console.log('Success');
            dispatch(setLoginSession(sess as LoginSession));
        });
    }

    function initialCreds(session: LoginSession){
        return {
            user_name: session.user_name,
            domain: session.domain,
            password: ""
        } as CredInterface
    }

    if (loggedIn && props?.display !== AuthControllerType.Settings){
        return (<div/>);
    }
    if (loggedIn && props?.display === AuthControllerType.Settings){
        return (
            <div>
                <hr/>
                <br></br>
                <AuthLogoutWidget/>
            </div>
        );
    }

    if (props?.display === AuthControllerType.Settings){
        return(
            <div className={styles.auth_pannel}>
                <hr/>
                <div className={styles.label}>
                    <div>
                        Credentials
                    </div>
                </div>
                <AuthContent onChange={doLogin} initialValues={initialCreds(state)}/>
            </div>
        );
    }
    return (
        <div className={styles.login_wrapper}>
            <div className={styles.login_image}></div>
                <AuthContent onChange={doLogin} initialValues={initialCreds(state)}/>
        </div>
    );
}

interface CredInterface {
    [key: string]: string,
    user_name: string,
    password: string,
    domain: string
}

interface AuthContentWidgetProps {
    onChange: Function,
    initialValues: CredInterface
}

export function AuthContent(props: AuthContentWidgetProps){
    
    var state: CredInterface = {...props.initialValues}

    function doLogin(e: React.SyntheticEvent){
        e.preventDefault();
        props.onChange(state as LoginCredentials);
    }

    function setField(name: string): Function{
        return (e: React.FormEvent<HTMLInputElement>) => {
            state[name] = e.currentTarget.value;
        }
    }

    return (
        <form id="login-form" onSubmit={doLogin}>
            <div className={styles.login_row}>
                <input
                    type="text" id="presented-url" name="presented-url" className={[styles.login_textbox, styles.login_url].join(' ')} placeholder="server url"
                    defaultValue={state.domain}
                    onChange={e => setField("domain")(e)}/>
                <input type="hidden" id="url" name="url" className={[styles.login_textbox, styles.login_url].join(' ')}/>
            </div>
            <div className={styles.login_row}>
                <input
                    type="text" id="presented-username" name="presented-username" className={[styles.login_textbox, styles.login_username].join(' ')}
                    defaultValue={state.user_name}
                    onChange={e => setField("user_name")(e)}/>
                <input type="hidden" id="username" name="username" className={[styles.login_textbox, styles.login_username].join(' ')}/>
            </div>
            <div className={styles.login_row}>
                <input
                    type="password" id="password" name="password" className={[styles.login_textbox, styles.login_password].join(' ')}
                    onChange={e => setField("password")(e)}
                    defaultValue={state.password}
                />
            </div>
            <input id="btnSubmit" type="submit" className={styles.login_button} value="Authenticate"></input>
        </form>
    )
}