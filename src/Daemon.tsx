import { store, forceUpdateState} from "./app/store"

import {PyramidAPI} from "./utils/pyramid";
import {NotificationIndicatorsResult} from "./utils/api_types";

import {formatCounts, newUpdates} from "./features/notification/Helpers"
import {sendNotification} from './features/notification/notificationSlice';
import {addEventListener, NotificationActionEvent} from 'openfin-notifications';

var pyramidConfig: any = {};
var API: PyramidAPI;
var USERINFO: any;
var RUNNING = false;
var STOP = false;
var timer: any;
var INTERVAL = 5;

function getNotificationState(){
    forceUpdateState();
    return store.getState().notification;
}

async function startNotificationDaemon(){
    if (RUNNING){
        console.warn("daemon already running... skipping new run");
        return;
    }
    (
        function looper(){
            timer = setTimeout( function() {
                RUNNING = true;
                var ns = getNotificationState();
                INTERVAL = ns.daemonPollSec * 1000;
                if (ns.daemonEnabled){
                    doTask();
                }
                if(!STOP){
                    looper();
                }
            }, INTERVAL);
        }
    )();
}

async function initializeDaemon(){
    pyramidConfig = await( await fetch('../pyramid.config.json')).json();
    console.log(pyramidConfig);
    
    API = new PyramidAPI(
        'https://' + pyramidConfig['hostname'],
        pyramidConfig.username,
        pyramidConfig.password
    );
    await API.signIn();
    USERINFO = await API.getMe().then(response => response.data);
    console.info('starting daemon');
    startNotificationDaemon();
}

async function doTask(){
    var res: NotificationIndicatorsResult = await newUpdates(API, USERINFO, store);
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
    await fin.Application.getCurrent();
    addEventListener('notification-action', async (event: NotificationActionEvent) => {
        const {
            result,
            notification,
        } = event;
        console.log("Caught callback on notification action")
        if (result['task'] === 'open-pyramid') {
            console.log("Caught callback from open-pyramid");
            const child_window =  'pyramid_notification_callback';
            // we use this app info to target the previously spawned callback window
            // if it exists
            const app_info = await (await fin.Application.getCurrent()).getInfo();
            // I hate the double await ^^ (less than a promise?)
            const app_uuid = app_info.initialOptions.uuid;
            
            var options = {
                name: child_window,
                url: 'https://' + pyramidConfig['hostname'] + '/?bulletin',
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
}

initializeDaemon();
registerListener();


export default startNotificationDaemon;
