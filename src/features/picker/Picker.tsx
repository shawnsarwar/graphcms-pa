import React, {useEffect, useState, useMemo, useRef} from 'react';
import { ThemeProvider } from '@material-ui/core/styles';
import TreeView from '@material-ui/lab/TreeView';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import TreeItem from '@material-ui/lab/TreeItem';

import {LoginSession, selectLoginSession} from '../auth/authSlice'
import { RootState } from '../../app/store';
import { connectAdvanced, useSelector } from 'react-redux';
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
    registerNode?(node: ContentFolder | ContentItem): void;
}

function wrapFolder(folder: ContentFolder, api: PyramidAPI, session: LoginSession, callback?: Function): FolderArgs{
    return {
        api: api,
        session: session,
        folder: folder,
        registerNode: callback
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

export interface TreeArgs{
    onGroupSelect?(item: ContentFolder): void;
    onContentSelect?(item: ContentItem): void;
}

interface NodeSet {
    [key: string]: ContentFolder | ContentItem
}

// const useRefState = (initialValue: NodeSet) => {
//     const [state, setState] = useState(initialValue);
//     const stateRef = useRef(state);
//     useEffect(
//         () => {
//             stateRef.current = state;
//         },[state],
//     );
//     return [stateRef, setState];
// };

export function SimpleTree(args: TreeArgs) {
    const session: LoginSession = useSelector((state: RootState) => selectLoginSession(state));
    
    var API: PyramidAPI  = useMemo(() => {
        return new PyramidAPI(
            makeTokenGrant(session.domain , session.token))
        ;}, [session]);

    const [data, setData] = useState(initNode());
    
    const [loading, setLoading] = useState(false);

    const [nodes, setNodes] = useState<NodeSet>({});

    const [count, setCount] = useState(0);
    
    const doNothing = () => {};

    const handleSelect = (event: React.ChangeEvent<{}>, nodeId: string) => {
        if (nodeId in nodes){
            var node: ContentFolder| ContentItem = nodes[nodeId];
            if (node.contentType === 5){
                args.onGroupSelect !== undefined ? args.onGroupSelect(node as ContentFolder): doNothing();
            }else{
                args.onContentSelect !== undefined ? args.onContentSelect(node): doNothing();    
            }
        }else{
            console.log(`${nodeId} not found in registrar`);
        }
    };

    const addNode = (node: ContentItem | ContentFolder) => {
        setNodes(oldNodes => {
            if (node.id in oldNodes){
                return {...oldNodes};
            }
            return {...oldNodes, ...{[node.id] : node}};
        });
    }

    useEffect(() => {
        if (data.loaded || loading){
            return;
        }
        setLoading(true);
        const fetchData = async () => {
            await waitSync('root');
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
            setLoading(false);
        }
        fetchData();
    }, [loading, setLoading, data, setData, API, session, count, setCount]);

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
                        <TreeFolder key={i.id} {...wrapFolder(i, API, session, addNode)} />
                    </div>
                ))}
            </TreeView>
        </ThemeProvider>
    );
}

export function TreeFolder(args: FolderArgs){
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(initNode());
    
    useEffect(() => {
        if(data.loaded || loading){
            return;
        }
        setLoading(true);
        const fetchData = async () => {
            await waitSync('root');
            const results = await args.api.getFolderItems(args.session.user_id, args.folder.id).then(response => response?.data);
            var folders: Array<ContentFolder> = [];
            var items: Array<ContentItem> = [];
            results.forEach(function (i: ContentItem) {
                if (args.registerNode !== undefined){
                    args.registerNode(i);
                }
                if(i.itemType === 5){
                    folders.push(i as ContentFolder);
                }else{
                    items.push(i);
                }
            });
            setData({items: items, folders: folders, loaded: true});
            setLoading(false);
        }
        fetchData();
    }); //}, [args, data, loading]);

    return (
        <TreeItem nodeId={args.folder.id} label={args.folder.caption} className={styles.label}>
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
                        <TreeFolder key={i.id} {...wrapFolder(i, args.api, args.session, args.registerNode)} />
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
            <TreeItem nodeId={args.item.id} label={args.item.caption}/>
        </ThemeProvider>
    )
}