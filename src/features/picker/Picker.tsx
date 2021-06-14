import React, {useEffect, useState} from 'react';
import { ThemeProvider } from '@material-ui/core/styles';
import TreeView from '@material-ui/lab/TreeView';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import TreeItem from '@material-ui/lab/TreeItem';

import {LoginSession, selectLoginSession} from '../auth/authSlice'
import { RootState } from '../../app/store';
import { useSelector } from 'react-redux';
import { waitSync } from 'redux-pouchdb'
import {PyramidAPI, makeTokenGrant} from '../../utils/pyramid';
import {ContentFolder, ContentItem} from '../../utils/api_types';

import {themeBold, themeNormal} from '../../shared/styles';

import styles from "./Picker.module.css";


interface NodeData {
    folders?: Array<ContentFolder>,
    items?: Array<ContentItem>,
    loaded: boolean
}

function initNode() {
    return {
        folders: [],
        items: [],
        loaded: false
    } as NodeData
}

interface FolderArgs {
    api: PyramidAPI;
    session: LoginSession;
    folder: ContentFolder;
}

function wrapFolder(folder: ContentFolder, api: PyramidAPI, session: LoginSession): FolderArgs{
    return {
        api: api,
        session: session,
        folder: folder
    } as FolderArgs
}

interface ContentItemArgs{
    api: PyramidAPI;
    session: LoginSession;
    item: ContentItem
}

function wrapContentItem(item: ContentItem, api: PyramidAPI, session: LoginSession): ContentItemArgs{
    return {
        api: api,
        session: session,
        item: item
    } as ContentItemArgs
}

interface TreeArgs{
    onGroupSelect?(folderId: string): void;
    onContentSelect?(contentId: string): void;
}

export function SimpleTree(args: TreeArgs) {
    // const classes = useStyles();
    const session: LoginSession = useSelector((state: RootState) => selectLoginSession(state));
    
    var API: PyramidAPI  = new PyramidAPI(
        makeTokenGrant(session.domain , session.token)
    );
    const [data, setData] = useState(initNode());
    const doNothing = () => {};

    const handleSelect = (event: React.ChangeEvent<{}>, nodeId: string) => {
        if(nodeId.startsWith("file:")){
            args.onContentSelect !== undefined ? args.onContentSelect(nodeId.replace("file:", "")): doNothing();
        }else if(nodeId.startsWith("folder:")){
            args.onGroupSelect !== undefined ? args.onGroupSelect(nodeId.replace("folder:", "")): doNothing();
        }
    };

    useEffect(() => {
        if (data.loaded){
            return;
        }
        const fetchData = async () => {
            await waitSync('root');
            console.log(session);
            if(!session.token){
                console.log('no auth yet...');
                return;
            }
            const [
                publicRoot,
                // privateRoot,
                groupRoot,
            ] = await Promise.all([
                API.getUserPublicRootFolder(session.user_id).then(response => response?.data),
                // this is non-op?
                // API.getPrivateRootFolder(session.user_id).then(response => response?.data),
                // API.getPrivateFolderForUser(session.user_id).then(response => response?.data),
                API.getUserGroupRootFolder(session.user_id).then(response => response?.data)
            ]);
            setData({folders: [publicRoot, groupRoot], loaded: true});
        }
        fetchData();
    });

    return (
        <ThemeProvider theme={themeBold}>
            <TreeView
                // className={classes.root}
                className={styles.treeRoot}
                defaultCollapseIcon={<ExpandMoreIcon />}
                defaultExpandIcon={<ChevronRightIcon />}
                onNodeSelect={handleSelect}
            >
                {data.folders?.map(i => (
                    <div>
                        <hr/>
                        <TreeFolder key={i.id} {...wrapFolder(i, API, session)} />
                    </div>
                ))}
            </TreeView>
        </ThemeProvider>
    );
}

export function TreeFolder(args: FolderArgs){
    const [data, setData] = useState(initNode());
    
    useEffect(() => {
        if(data.loaded){
            return;
        }
        const fetchData = async () => {
            await waitSync('root');
            const results = await args.api.getFolderItems(args.session.user_id, args.folder.id).then(response => response?.data);
            var folders: Array<ContentFolder> = [];
            var items: Array<ContentItem> = [];
            results.forEach(function (i: ContentItem) {
                if(i.itemType === 5){
                    folders.push(i as ContentFolder);
                }else{
                    items.push(i);
                }
            });
            setData({items: items, folders: folders, loaded: true});
        }
        fetchData();
    });

    return (
        <TreeItem nodeId={"folder:" + args.folder.id} label={args.folder.caption} className={styles.label}>
                {data.items?.map(i => (
                    <div className={styles.treeItem}>
                        <TreeContentItem 
                            {...wrapContentItem(i, args.api, args.session)}
                        />
                    </div>
                ))}
                {data.folders?.map(i => (
                    <div>
                        <hr/>
                        <TreeFolder key={i.id} {...wrapFolder(i, args.api, args.session)} />
                    </div>
                ))}
        </TreeItem>
    )
}

interface ContentItemArgs{
    api: PyramidAPI;
    session: LoginSession;
    item: ContentItem
}

export function TreeContentItem(args: ContentItemArgs){
    return(
        <ThemeProvider theme={themeNormal}>
            <hr className={styles.light}/>
            <TreeItem nodeId={"file:" + args.item.id} label={args.item.caption}/>
        </ThemeProvider>
    )
}