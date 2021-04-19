import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    debugCurrentState,
    setNotificationType,
    setDaemonEnabled,
    setDaemonPollSec,
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
        // dispatch(setDebugEnabled(!state.debugEnabled));
        dispatch(debugCurrentState());
        // dispatch(sendNotification("ALERTS: (4)"));
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
            <div className={styles.logo_container}>
                <div className={styles.logo_img}/>
            </div>
            <div className={styles.notification_content}>
                <div className={styles.section}>
                    <div id="enabled">
                        <DaemonSwitchWidget/>
                    </div>
                </div>
                <div className={styles.section}>
                    <label>Poll Interval
                        <span>
                        <input
                                name="poll_interval_input"
                                type="number"
                                value={state.daemonPollSec}
                                onChange={e => setInterval(e)}
                            />
                        </span>
                    </label>
                </div>
                <hr/>
                <div id="notification-items">
                    <div className={styles.label}
                    onDoubleClick={toggleDebug}
                        ><div>Notifications</div></div>
                    {notificationItems}
                </div>
                
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
    const classNames = [styles.icon, styles[state.name]].join(' ')
    return(
      <div>
        <label>
        <input type="checkbox"
            checked={state.enabled}
            onChange={toggle}
          />
          <div className={classNames} id={state.name}/>
          <span>
            {state.name}
        </span>
        </label>
      </div> 
    );
}

export function DaemonSwitchWidget(){
    const state: boolean = useSelector((state: RootState) => selectNotificationEnabled(state));
    const dispatch = useDispatch();

    function toggle(){
        dispatch(setDaemonEnabled(!state));
        console.log(state);
    };
    return(
      <div>
        <label>
        <input type="checkbox"
            checked={state}
            onChange={toggle}
          />
          <span>Enable Notifications</span>
        </label>
      </div> 
    );
}
