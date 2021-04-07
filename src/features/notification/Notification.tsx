import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    setNotificationType,
    setDaemonEnabled,
    setDebugEnabled,
    setDaemonPollSec,
    sendNotification,
    selectNotificationState,
    selectNotificationEnabled,
    selectNotificationType,
    NotificationItem,
    NotificationState
} from './notificationSlice';
import styles from './Notification.module.css';
import { RootState } from '../../app/store';

export function NotificationController(){
    const state: NotificationState = useSelector((state: RootState) => selectNotificationState(state));
    const dispatch = useDispatch();
    //TODO got lazy with the abstraction, make a single toggle class

    function toggleDebug(){
        dispatch(setDebugEnabled(!state.debugEnabled));
        dispatch(sendNotification("ALERTS: (4)"));
    };
    
    const notificationItems = []
    for (let key of Object.keys(state.notifications)){
        notificationItems.push(<div id={key}><NotificationItemWidget name={key}/></div>);
    };

    function setInterval(e: React.FormEvent<HTMLInputElement>){
        dispatch(setDaemonPollSec(parseFloat(e.currentTarget.value)));
    }
    return(
        <div id="notification-controller" className={styles.pannel}>
            <div className={styles.logo}/>
            <div id="enabled">
                <DaemonSwitchWidget/>
            </div>
            <div id="interval">
                <div className={styles.label}><div>POLL INTERVAL</div></div>
                <input
                    name="poll_interval_input"
                    className={styles.input_center}
                    type="number"
                    value={state.daemonPollSec}
                    onChange={e => setInterval(e)}
                />
            </div>
            <div id="notification-items">
                <div className={styles.label}
                onDoubleClick={toggleDebug}
                    ><div>NOTIFICATIONS</div></div>
                {notificationItems}
            </div>
        </div>
    );
}

interface NotificationWidgetProperty {
    name: string
}

export function NotificationItemWidget(props: NotificationWidgetProperty){
    const state: NotificationItem = useSelector((state: RootState) => selectNotificationType(state, props.name));
    const dispatch = useDispatch();

    function toggle(){
        dispatch(setNotificationType({
            ...state,
            enabled: !state.enabled
        }));
        console.log(state);
    };
    const classNames = (state.enabled ? [styles.button, styles.buttonEnable] : [styles.button, styles.buttonDisable]).join(" ");
    return(
        <button 
            className={classNames}
            onClick={toggle}
        >{state.name.toUpperCase()}</button>
    );
}

export function DaemonSwitchWidget(){
    const state: boolean = useSelector((state: RootState) => selectNotificationEnabled(state));
    const dispatch = useDispatch();

    function toggle(){
        dispatch(setDaemonEnabled(!state));
        console.log(state);
    };
    const classNames = (state ? [styles.button, styles.buttonEnable] : [styles.button, styles.buttonDisable]).join(" ");
    return(
        <button 
            className={classNames}
            onClick={toggle}
        >{"Enable Notifications".toUpperCase()}</button>
    );
}
