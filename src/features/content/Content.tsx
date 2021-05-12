import React, {useEffect, createRef} from 'react';
import { RootState } from '../../app/store';
import { useSelector } from 'react-redux';

import {AuthController} from '../auth/Auth'
import {LoginSession, selectLoginSession} from '../auth/authSlice'

import styles from "./Content.module.css"

import { PyramidEmbedClient } from '@pyramid-embed/embed-js';

interface EmbedSettings {
    id: string,
    contentID: string
    showLoginPrompt?: boolean
}

export function PyramidEmbed(settings: EmbedSettings){
    const state: LoginSession = useSelector((state: RootState) => selectLoginSession(state));
    var loggedIn : boolean = true ? state.token !== undefined && state.token !== "": false;
    var targetRef = createRef<HTMLDivElement>();

    useEffect(() => {
        if ( !loggedIn ){return;}
        var client = new PyramidEmbedClient(state.domain);
        client.login(state.user_name, state.password);  // TODO Remove after upstream library fix
        client.setAuthToken(state.embedToken);  // this alone currently does not work. so we have to use ^^
        client.init();
        client.setAuthFailureCallback(onErr)
        if(targetRef.current){
            client.embed(
                targetRef.current as HTMLElement,
                getOptions(state)
            );
        }else{
            console.error("No target available for embed");
        }
        
    });

    function afterLoad(){
        //pass
    }

    function onErr(msg? : Object){
        if (!msg){
            console.error("Unspecified Auth Error")
        }else{
            console.error(msg)
        }
    }

    function getOptions(state: LoginSession){
        return {
            contentId: settings.contentID,
            style: { height: 2000, width: 2000 },
            onLoad: afterLoad
        }
    }

    if (!loggedIn && settings?.showLoginPrompt !== false){
        return (
            <AuthController/>
        );
    }
    return (
        <div id={settings.id} ref={targetRef} className={styles.embed_container}/>
    );
}