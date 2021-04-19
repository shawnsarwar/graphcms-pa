import {NotificationIndicatorsResult} from "../../utils/api_types";
import {PyramidAPI} from "../../utils/pyramid";
import {Store} from "../../app/store";
import {
    setNotificationType,
    NotificationState,
    NotificationItem
  } from './notificationSlice';

export async function serverNotificationValues(
    API: PyramidAPI,
    USERINFO: any
){
    return await API.getNotificationCount(USERINFO.id).then(
        response => response.data) as NotificationIndicatorsResult;
}

export function formatCounts(updates: NotificationIndicatorsResult){
    const lines: Array<string> = []
    for (const [k, v] of Object.entries(updates)){
         lines.push(k.toUpperCase() + ": (" + v?.toString() + ")");
    }
    return lines.join('\n');
}

export async function newUpdates(
    API: PyramidAPI,
    USERINFO: any,
    store: Store)
{
    var counts: NotificationState = store.getState().notification;
    var currentUnread = await API.getNotificationCount(USERINFO.id).then(response => response.data);  
    return await processUpdates(store, counts, currentUnread) as NotificationIndicatorsResult;
}

export async function processUpdates(store: Store, counts: NotificationState, currentUnread: NotificationIndicatorsResult){
    var newUnread : NotificationIndicatorsResult = {};
    Object.values(counts.notifications).forEach(
        (item: NotificationItem) => {
            var k = item.name as keyof NotificationIndicatorsResult;
            if(item.enabled){
                // reading object properties dynamically is stupid hard if you want to make TS happy...
                var unreadOfType = currentUnread[k];
                var unread: number = unreadOfType !== undefined ? unreadOfType - item.count : 0;
                if( unread > 0 ){
                    console.debug('New unread of type: '
                        + k + " @"
                        + counts.notifications[k].count);
                    newUnread[k] = unread
                }
                else{
                    console.debug('Still: '
                        + k + " @"
                        + counts.notifications[k].count);
                }
            }
            // set updated value in store
            store.dispatch(setNotificationType({
                ...item,
                count: currentUnread[k] as number
            }));
    });
    if (Object.keys(newUnread).length === 0){
        return undefined;
    }
    return newUnread as NotificationIndicatorsResult;
}
