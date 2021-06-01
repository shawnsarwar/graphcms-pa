import React, { useEffect } from 'react';
import {Route, Switch, useLocation } from 'react-router-dom';
import {DynamicEmbedID, DynamicEmbedName, SelectAndEdit, JustJSON, RunTaskTrigger, SavedEmbeds} from '../content/Content';
import {NotificationController} from '../notification/Notification';
import {startNotificationDaemon} from '../../Daemon'

export function BaseRouter(){
    let location = useLocation();

    useEffect(()=>{
        console.debug(`Found location ${location.pathname}`)
    });

    return (
        <Switch>
            <Route path="/settings">
                <NotificationController/>
            </Route>
            <Route path="/metadata/*">
                <JustJSON/>
            </Route>
            <Route path="/id/*">
                <DynamicEmbedID/>
            </Route>
            <Route path="/n/*">
                <DynamicEmbedName/>
            </Route>
            <Route path="/edit">
                <SelectAndEdit/>
            </Route>
            <Route path="/view">
                <SavedEmbeds/>
            </Route>
            <Route path="/task">
                <RunTaskTrigger/>
            </Route>
        </Switch>
    );
}

//TODO move to start as background service
startNotificationDaemon();