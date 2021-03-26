import { store, forceUpdateState} from "./app/store"
import {PyramidAPI} from "./utils/pyramid";

import {NotificationIndicatorsResult} from "./utils/api_types";

import {
  sendNotification,
  setNotificationType,
  NotificationState,
  NotificationItem
} from './features/notification/notificationSlice';
import {addEventListener, NotificationActionEvent} from 'openfin-notifications';

var pyramidConfig = {};
var API;
var USERINFO;
var RUNNING = false;
var STOP = false;
var timer;
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
        'https://' + pyramidConfig.hostname,
        pyramidConfig.username,
        pyramidConfig.password
    );
    await API.signIn();
    USERINFO = await API.getMe().then(response => response.data);
    console.info('starting daemon');
    startNotificationDaemon();
}

async function doTask(){
    var res: NotificationIndicatorsResult = await mockNewUpdates();
    if (res !== undefined){
        store.dispatch(
            sendNotification(
                formatCounts(res)));

    }else{
        console.debug('No new updates found');
    }
    
}

function formatCounts(updates: NotificationIndicatorsResult){
    const lines: Array<string> = []
    for (const [k, v] of Object.entries(updates)){
         lines.push(k.toUpperCase() + ": (" + v.toString() + ")");
    }
    return lines.join('\n');
}

async function newUpdates(){
    var counts: NotificationState = store.getState().notification;
    var currentUnread: NotificationIndicatorsResult = await ( await API.getNotificationCount(USERINFO.id).data);
    return await processUpdates(counts, currentUnread) as NotificationIndicatorsResult;
}

async function processUpdates(counts: NotificationState, currentUnread: NotificationIndicatorsResult){
    var newUnread = {};
    Object.values(counts.notifications).forEach(
        (item: NotificationItem) => {
            if(item.enabled){
                var unread = currentUnread[item.name] - item.count;
                if( unread > 0 ){
                    console.debug('New unread of type: '
                        + item.name + " @"
                        + counts.notifications[item.name].count);
                    newUnread[item.name] = unread
                }
                else{
                    console.debug('Still: '
                        + item.name+ " @"
                        + counts.notifications[item.name].count);
                }
            }
            // set updated value in store
            store.dispatch(setNotificationType({
                ...item,
                count: currentUnread[item.name]
            }))
    });
    if (Object.keys(newUnread).length === 0){
        return undefined;
    }
    return newUnread as NotificationIndicatorsResult;
}

async function mockNewUpdates(){
    var counts: NotificationState = store.getState().notification;
    var currentUnread: NotificationIndicatorsResult = mockCurrentUnread(counts);
    return await processUpdates(counts, currentUnread) as NotificationIndicatorsResult;
}

function mockCurrentUnread(state: NotificationState){
    var fakeState = {};
    Object.values(state.notifications).forEach((item: NotificationItem) => {
        // add 0 -> 2 new items
        fakeState[item.name] = item.count + Math.floor(Math.random() * Math.floor(3));
    });
    // make sure alerts is always incremented so we get the pop-up
    fakeState["alerts"] += 1;
    return fakeState as NotificationIndicatorsResult;
}

async function registerListener(){
    // make sure we have an OF app
    await fin.Application.getCurrent();
    addEventListener('notification-action', async (event: NotificationActionEvent) => {
        const {
            result,
            notification
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
                url: "http://localhost:5555/pyramid-client.html",
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
