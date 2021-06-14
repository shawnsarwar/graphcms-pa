import React, {useEffect, createRef, useState} from 'react';
import { useLocation } from 'react-router-dom';
import { RootState } from '../../app/store';
import { useSelector } from 'react-redux';
import { store } from '../../app/store';
import { waitSync } from 'redux-pouchdb';

import {AuthController} from '../auth/Auth'
import {LoginSession, selectLoginSession} from '../auth/authSlice'

import {EmbedControlWidget} from '../content/EditContent';
import {SimpleTree} from '../picker/Picker';

import {getEmbedViewByName, getEmbedViewByContentID, getServerEmbedContent, EmbedView} from '../content/contentSlice';


import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import { ThemeProvider } from '@material-ui/core/styles';
import {themeNormal} from '../../shared/styles';
import styles from "./Content.module.css"

import { PyramidEmbedClient } from '@pyramid-embed/embed-js';


//TODO Move
import {PyramidAPI, makeTokenGrant} from '../../utils/pyramid';


export function RunTaskTrigger(){
    const session: LoginSession = useSelector((state: RootState) => selectLoginSession(state));
    return (
        <div className={styles.embedSettings}>
        <ThemeProvider theme={themeNormal}>        
            <TableContainer>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Task Name</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Status</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TaskRunWidget {...{type: "task", name: "Update RSS Feed (Run Model [reRunTask])", runId: "729cc1db-d8b6-4833-8cef-cd71fda2ca88", session: session}}/>
                    <TaskRunWidget {...{type: "schedule", name: "Alert on New Story is Available (Force Schedule Run [runSchedule])", runId: "26ea7d78-be08-4baa-9a9d-051c9caefcb5", session: session}}/>
                    <TaskRunWidget {...{type: "schedule", name: "Alert on No New Content (Force Schedule Run [runSchedule])", runId: "7db91261-3941-4ad2-a3e3-7c6ed4d491f3", session: session}}/>
                </TableBody>
            </Table>
            </TableContainer>
        </ThemeProvider>
    </div>
    )
}

interface TaskRunWidgetOpts {
    type: string;
    name: string;
    runId: string;
    session: LoginSession;
}

function TaskRunWidget(opts: TaskRunWidgetOpts){
    const [state, setState] = useState({
        running: false,
        error: false
    })
    var API: PyramidAPI;
    if (opts.session?.token){
        API = new PyramidAPI(makeTokenGrant(opts.session.domain, opts.session.token))
    }

    const runSchedule = (scheduleId: string) => {
        if (API){
            API.runSchedule(scheduleId).then(
                (res) => {
                    console.log(res);
                    handleResult(res);
                });
        }else{
            console.log('no session.');
        }
    }

    const runTask = (taskid: string) => {
        if (API){
            API.reRunTask(taskid).then(
                (res) => {
                    console.log(res);
                    handleResult(res);
                });
        }else{
            console.log('no session.');
        }
    }

    const handleResult = (res: any) => {
        if(res?.data !== undefined){
            setState({...state, ...{running: false, error: false}});
        }else{
            setState({...state, ...{running: false, error: true}});
            console.error(res);
        }
    }

    const icon = () : string => {
        if(state.running){
            return styles.open_icon;
        };
        if(state.error){
            return styles.edit_icon
        }
        return styles.reload_icon
    }

    const doRun = () => {
        if(!state.running){
            setState({...state, ...{running: true}});
            if(opts.type === 'task'){
                runTask(opts.runId);
            }else{
                runSchedule(opts.runId);
            }
        }
    }

    return (
        <TableRow key={opts.name}>
            <TableCell component="th" scope="row">
                {opts.name}
            </TableCell>
            <TableCell component="th" scope="row">
                {opts.type}
            </TableCell>
            <TableCell component="th" scope="row" onClick={doRun} >
                <div className={icon()}/>    
            </TableCell>
        </TableRow>
    )

}


export function SavedEmbeds(){
    const session: LoginSession = useSelector((state: RootState) => selectLoginSession(state));
    const content = useSelector((state: RootState) => getServerEmbedContent(state, session.domain));

    let thisUrl = window.location.href;

    const launch = (name: string, url: string) => {
        let fullTarget = thisUrl.replace('/view', '') + url;
        try{
            let me = fin.me as fin.View;
            me.navigate(fullTarget);
        }catch(err){
            console.log('Could not open proper OF window, sorry!');
            window.open(fullTarget);
        }
    }
    
    interface RowContent {
        name: string;
        link: string;
        contentId: string;
    };

    function getRows(): Array<RowContent>{
        var rows: Array<RowContent> = [];
        if (!content?.aliases){
            rows.push(
                {name: 'No Saved Content', link: '', contentId: ''}
            );
            return rows;
        }
        Object.entries(content.content).forEach((pair) => {
            let [contentId, data] = pair;
            rows.push(
                {name: data.name, link: data.url, contentId: contentId}
            )
        });
        return rows;
    };

    return(
        <div className={styles.embedSettings}>
            <ThemeProvider theme={themeNormal}>        
                <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Visualization Name</TableCell>
                            <TableCell>Url</TableCell>
                            <TableCell>Link</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {(getRows().map((row) => (
                            <TableRow key={row.name}>
                                <TableCell component="th" scope="row">
                                    {row.name}
                                </TableCell>
                                <TableCell component="th" scope="row">
                                    {row.link}
                                </TableCell>
                                <TableCell>
                                    <div id={row.contentId} className={styles.open_icon} onClick={()=> {launch(row.name, `/n/${row.link}`)}}/>
                                </TableCell>
                            </TableRow>
                        )))}
                    </TableBody>
                </Table>
                </TableContainer>
            </ThemeProvider>
        </div>
    )
}

export function SelectAndEdit(){
    const [state, setState]  = useState({contentId: "", name: ""});
    const session: LoginSession = useSelector((root: RootState) => selectLoginSession(root));
    const view: EmbedView = useSelector((root: RootState) => getEmbedViewByContentID(root, session.domain, state.contentId));

    const onPickContent = (id: string) => {
        setState({contentId: id, name: ""});
    }

    return (
        <ThemeProvider theme={themeNormal}>
            <Grid container spacing={5}
                justify="flex-start"
                alignItems="flex-start"
            >
                <Grid item xs={3}>
                    <SimpleTree onContentSelect={onPickContent}/>
                </Grid>
                <Grid container item xs={8}>
                    <EmbedControlWidget id={state.contentId} name=""/>
                    {state.contentId !== "" && <PyramidEmbed id={state.contentId} contentID={state.contentId} displayOptions={view.styles}/>}
                </Grid>
            </Grid>
        </ThemeProvider>
    )
}

export type EmbedWidgetOptions = {
    showLoginPrompt?: boolean;
    overlayControls?: boolean;
    editable?: boolean;
    onWidgetSave?: () => void;
}

export const DefaultEmbedWidgetOptions: EmbedWidgetOptions = {
    showLoginPrompt: false,
    overlayControls: false,
    editable: false
}

interface EmbedSettings {
    id: string,
    contentID: string
    name?: string
    showLoginPrompt?: boolean
    widgetOptions?: EmbedWidgetOptions
    displayOptions?: any
}

declare global {
    interface Window {
        pyramid:any;
    }
}

export function PyramidEmbed(settings: EmbedSettings){
    const passedWidgetOptions = settings.widgetOptions ? settings.widgetOptions : {};
    const widgetOptions: EmbedWidgetOptions = {...DefaultEmbedWidgetOptions, ...passedWidgetOptions};
    const state: LoginSession = useSelector((state: RootState) => selectLoginSession(state));
    var loggedIn : boolean = true ? state.token !== undefined && state.token !== "": false;
    var targetRef = createRef<HTMLDivElement>();

    const [lastContent, setLastContent] = useState({id: ""});
    const [hasErr, setErr] = useState(false);
    const [running, setRunning] = useState(false);

    var client = new PyramidEmbedClient(state.domain);

    const initClient = () => {
        setErr(false);
        setRunning(true);
        console.log(`init client ${settings.contentID}`)
        client.login(state.user_name, state.password);  // TODO Remove after upstream library fix
        client.setAuthToken(state.embedToken);  // this alone currently does not work. so we have to use ^^
        client.init();
        client.setAuthFailureCallback(onErr)
        if(targetRef.current){
            try{
                client.embed(
                    targetRef.current as HTMLElement,
                    getOptions(state)
                );
            }catch(err){
                console.log(err);
                setErr(true);
            }
        }else{
            console.error("No target available for embed");
        }
    }

    const refreshClient = () => {
        setErr(false);
        setRunning(true);
        console.log(`refresh client ${settings.contentID}`)
        if (window.pyramid && window.pyramid.stop){
            console.log(`stopping old target ${targetRef.current}`);
            window.pyramid.stop(targetRef.current);
        }else{
            console.log(`No pyramid to stop?? |  ${targetRef.current}`);
        }
        if(targetRef.current){
            try{
                client.embed(
                    targetRef.current as HTMLElement,
                    getOptions(state)
                );
            }catch(err){
                console.log(err);
                setErr(true);
            } 
        }
        console.log(`refresh client ${settings.contentID} finished`);
    }

    useEffect(() => {
        if ( !loggedIn || running ){return;}
        if(lastContent.id !== "" && lastContent.id === settings.contentID){
            console.debug('This content is already loaded');
            if (settings?.name !== undefined){
                document.title = settings.name;
            }
            return;
        }
        if ((lastContent.id !== "" && lastContent.id !== settings.contentID) || hasErr){
            // embed already exists
            refreshClient();
        } else {
            initClient();
        }
    });

    function afterLoad(){
        setLastContent({id: settings.contentID});
        setRunning(false);
    }

    function onErr(msg? : Object){
        setErr(true);
        setRunning(false);
        if (!msg){
            console.error("Unspecified Auth Error")
        }else{
            console.error(msg)
        }
    }

    function getOptions(state: LoginSession){
        return {
            contentId: settings.contentID,
            onLoad: afterLoad
        }
    }

    function getStyle(){
        try{
            return makeStyles({custom: {...settings.displayOptions}})().custom;
        }catch(err){
            console.error(`Could not use passed style: ${err}`);
            return styles.embed_container;
        }
    }

    if (!loggedIn && widgetOptions.showLoginPrompt !== false){
        return (
            <AuthController/>
        );
    }
    return (
        <div>
            {
                settings.widgetOptions?.overlayControls === true &&
                !running &&
                    <div className={styles.float_container}  onClick={() => {refreshClient()}}>
                        <div className={styles.reload_icon}/>
                    </div>
            }
            <div id={settings.id} ref={targetRef} className={getStyle()}/>
        </div>
    );
}

export function DynamicEmbedID(){
    const location = useLocation();
    const contentID = location.pathname.replace('/id/', '');
    console.error(location.pathname, contentID);

    return (
        <PyramidEmbed id={contentID} contentID={contentID}/>
    )
}

export function DynamicEmbedName(){
    const location = useLocation();
    const name = location.pathname.replace('/n/', '');
    console.error(location.pathname, name);
    const session: LoginSession = useSelector((state: RootState) => selectLoginSession(state));
    const view = useSelector((state: RootState) => getEmbedViewByName(state, session.domain, name));
    if (view){
        return (
            <PyramidEmbed
                id={view.id}
                contentID={view.id}
                name={view.name}
                displayOptions={view.styles}
                widgetOptions={
                    {"overlayControls": true}
                }/>)
    }else{
        return (
            <ThemeProvider theme={themeNormal}>
                <div className={styles.label + " " + styles.white}>Not Found</div>
            </ThemeProvider>
            )
    }
}

export function JustJSON(){
    const location = useLocation();
    const name = location.pathname.replace('/metadata/', '').replace('.json', '');
    const [loaded, setLoaded] = useState(false);
    const [content, setContent] = useState({});

    async function assetFromURL(){
        await waitSync('root');
        const state = store.getState();
        if ( !state.auth.token){
            return;
        }
        switch(name){
            case 'all':
                setContent({
                    'notification': state.notification,
                    'content': state.content
                });
                break;
            case 'notification':
                setContent(state.notification);
                break;
            case 'content':
                setContent(state.content);
                break;
            default:
                setContent({});
        }
        setLoaded(true);
    }
    useEffect(() => {
        if (loaded){
            return;
        }
        document.title = 'MetaData';
        assetFromURL();
        var res = JSON.stringify(content);
        window.document.write(res);
    });

    return (<div/>);
}