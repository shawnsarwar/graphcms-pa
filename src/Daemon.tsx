import { store, forceUpdateState} from "./app/store"

import {PyramidAPI, makeTokenGrant} from "./utils/pyramid";
import {NotificationIndicatorsResult} from "./utils/api_types";

import {formatCounts, newUpdates} from "./features/notification/Helpers"
import {sendNotification} from './features/notification/notificationSlice';
import {addEventListener, NotificationActionEvent} from 'openfin-notifications';

var API: PyramidAPI | undefined;
var user_id: string;

var REGISTERED = false;
var RUNNING = false;
var STOP = false;
var timer: any;
var INTERVAL = 5;

function getNotificationState(){
    forceUpdateState();
    return store.getState().notification;
}

function getClient() : PyramidAPI | undefined{
    if (API){
        return API;
    }
    var auth = store.getState().auth;
    if (!auth || !auth.token){
        console.warn('Pyramid Client not logged in.');
        return;
    }
    API = new PyramidAPI(makeTokenGrant(auth.domain, auth.token));
    user_id = auth.user_id;
    return API;
}

export async function startNotificationDaemon(){
    if (RUNNING){
        console.warn("daemon already running... skipping new run");
        return;
    }
    console.info('starting daemon');
    (
        function looper(){
            timer = setTimeout( function() {
                RUNNING = true;
                var client = undefined;
                try{
                    client = getClient();
                }catch(err){
                    console.log(err);
                }
                if (client !== undefined && !REGISTERED){
                    console.log(`registering client to callback notification => ${client.url}`);
                    registerListener();
                }
                try{
                    let ns = getNotificationState();
                    INTERVAL = ns.daemonPollSec * 1000;
                    if (ns.daemonEnabled && client !== undefined){
                        doTask();
                    }else if (ns.daemonEnabled){
                        console.warn('Pyramid Client not signed in');
                    }
                }catch(err){
                    console.warn('No current notification State');
                }
                if(!STOP){
                    looper();
                }
            }, INTERVAL);
        }
    )();
}

async function doTask(){
    try{
        if (!API){
            return;
        }
        var res: NotificationIndicatorsResult = await newUpdates(API, user_id, store);
    } catch(err){
        console.error(err);
        API = undefined;
        return;
    }
    if (res !== undefined){
        store.dispatch(
            sendNotification(
                formatCounts(res)));
    }else{
        console.debug('No new updates found');
    }
}

async function registerListener(){
    // make sure we have an OF app
    try{
        await fin.Application.getCurrent();
    }catch(err){
        console.warn('OpenFin not accessible');
        return;
    }
    addEventListener('notification-action', async (event: NotificationActionEvent) => {
        const {
            result,
            notification,
        } = event;
        if (result['task'] === 'open-pyramid') {
            console.log("Caught callback from open-pyramid");
            const child_window =  'pyramid_notification_callback';
            // we use this app info to target the previously spawned callback window
            // if it exists
            const app_info = await (await fin.Application.getCurrent()).getInfo();
            // I hate the double await ^^ (less than a promise?)
            const app_uuid = app_info.initialOptions.uuid;
            const client = getClient();
            var url;
            if (!client?.url){
                console.log('Could not launch window. No valid pyramid target in client');
                url = '/settings'
                return
            }else{
                url = `${client.url}/?bulletin`;
            }
            var options = {
                name: child_window,
                url: url,
                defaultWidth: 900,
                defaultHeight: 640,
                autoShow: true
            }
            fin.Window.create(options).then(
                () => {/* new window! */}
            ).catch((err) => {
                // window may exist, try to show it
                console.log(err);
                fin.Window.wrap({uuid: app_uuid, name: child_window}).then((window) => {
                    // there might be a better action than focus, but it'll do for now.
                    window.focus();
                }).catch( e2 => console.log(e2));
            });
        }
    });
    REGISTERED = true;
}
