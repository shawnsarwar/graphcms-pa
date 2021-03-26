import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunk, RootState } from '../../app/store';
import {create as createOFN} from 'openfin-notifications';

export interface NotificationMessage{
    body: string;
}

export interface NotificationItem {
    name: string;
    enabled: boolean;
    count: number
    lastChecked: Date | null
}

export interface NotificationState {
  daemonEnabled: boolean;
  daemonPollSec: number;
  debugEnabled: boolean;
  notifications: {
      [key : string]: NotificationItem
  }
}

var notificationTypes: {[key: string]: NotificationItem} = {};
[
    "models",
    "subscriptions",
    "alerts",
    "publications",
    "conversations"
].forEach(i => {
    notificationTypes[i] = {
        name: i,
        enabled: false,
        count: 0,
        lastChecked: null
    }
});

const initialState: NotificationState = {
  daemonEnabled: false,
  daemonPollSec: 60,
  debugEnabled: false,
  notifications : notificationTypes
};

const msg = {
    "title": "Updates:",
    "category": "Analytics",
    "body": "",
    "indicator": {
        "type": "warning",
        "text": "Pyramid Alert"
    },
    "sticky": "sticky",
    "buttons": [
        {
            "title": "View",
            "iconUrl": "https://openfin.co/favicon.ico",
            "type": "button",
            "cta": true,
             "onClick": {
                task: 'open-pyramid'
           }
        }
    ]
};

export const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    setNotificationState: (state, action: PayloadAction<NotificationState>) => {
        state.daemonEnabled = action.payload.debugEnabled;
        state.daemonPollSec = action.payload.daemonPollSec;
        state.daemonEnabled = action.payload.daemonEnabled;
        state.notifications = action.payload.notifications;
    },
    setDebugEnabled: (state, action: PayloadAction<boolean>) => {
        state.debugEnabled = action.payload;
    },
    setNotificationType: (state, action: PayloadAction<NotificationItem>) =>{
        state.notifications[action.payload.name].enabled = action.payload.enabled;
    },
    setDaemonEnabled: (state, action: PayloadAction<boolean>) => {
        state.daemonEnabled = action.payload;
    },
    setDaemonPollSec: (state, action: PayloadAction<number>) => {
        state.daemonPollSec = action.payload;
    },
  }
});

export const {
    setNotificationState,
    setDebugEnabled,
    setNotificationType,
    setDaemonEnabled,
    setDaemonPollSec 
} = notificationSlice.actions;

export const sendNotification = (message: string): AppThunk => dispatch => {
    createOFN({
        ...msg,
        body: message
    } as any);
};

// The function below is called a thunk and allows us to perform async logic. It
// can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
// will call the thunk with the `dispatch` function as the first argument. Async
// code can then be executed and other actions can be dispatched
// export const incrementAsync = (amount: number): AppThunk => dispatch => {
//   setTimeout(() => {
//     dispatch(incrementByAmount(amount));
//   }, 1000);
// };

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`

export const selectNotificationState = (state: RootState) => {
    return state.notification;
}

export const selectNotificationInterval = (state: RootState) => {
    return state.notification.daemonPollSec;
}

export const selectNotificationEnabled = (state: RootState) => {
    return state.notification.daemonEnabled;
}

export const selectNotificationType = (state: RootState, name: string) => {
    return state.notification.notifications[name];
}

export default notificationSlice.reducer;
