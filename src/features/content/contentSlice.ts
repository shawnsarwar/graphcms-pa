import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';


export interface EmbedView{
    id: string;
    server: string;
    name: string;
    url: string;
    styles?: Object;
}

export const initEmbedView = (id: string, server: string, name?: string) => {
    return {
        id: id,
        server: server,
        name: name ? name : '',
        url: '',
        styles: {
            "width": "100vw",
            "height": "100vh",
            "min-width": "500px",
            "min-height": "500px",
            "max-width": "100%",
            "max-height": "100%",
        }
    } as EmbedView
}

export interface ServerContent {
    id: string;
    content: {
        [key: string]: EmbedView
    };
    aliases: {
        [key: string]: string
    };
}

export interface Servers {
    server: {
        [key: string]: ServerContent
    };
}

const initialState: Servers = {
    server: {}
}


export const contentSlice = createSlice({
    name: 'content',
    initialState,
    reducers: {
        addEmbedView: (state, action: PayloadAction<EmbedView>) => {
            console.log('saving:');
            console.log(action.payload);
            var serverID = action.payload.server;
            var alias = action.payload.url;
            var contentID = action.payload.id;
            if(state?.server[serverID]?.content[contentID])
            {
                state.server[serverID].content[contentID]= action.payload;
                state.server[serverID].aliases[alias] = contentID;
            }
            else if(state?.server[serverID]){
                state.server[serverID].content[contentID] = action.payload;
                state.server[serverID].aliases[alias] = contentID;
            }else{
                state.server[serverID] = {
                    id: serverID,
                    aliases: {
                        [alias]: contentID
                    },
                    content: {
                        [contentID]: action.payload
                    
                }
            } as ServerContent
        }
    }}});

export const {
    addEmbedView,
} = contentSlice.actions;

export const aliasAvailable = (state: RootState, serverID: string, url: string) => {
    if (state.content.server[serverID].aliases[url]){
        return false;
    }
    return true;
}

export const getServerEmbedContent = (state: RootState, serverID: string) => {
    return state?.content?.server[serverID];
}

export const hasSavedEmbedView = (state: RootState, serverID: string, contentID: string) => {
    if (state?.content?.server[serverID].content[contentID] !== undefined){
        return true;
    }
    return false;
}

export const getEmbedViewByContentID = (state: RootState, serverID: string, contentID: string, name?: string) => {
    let content: EmbedView = state?.content.server[serverID]?.content[contentID];
    if (content !== undefined){
        return content
    }
    return initEmbedView(contentID, serverID, name);
}

export const getEmbedViewByName = (state: RootState, serverID: string, alias: string) => {
    let contentID: string = state?.content.server[serverID]?.aliases[alias];
    if (contentID !== undefined){
        return state?.content.server[serverID]?.content[contentID]
    }
    return undefined;
}

export default contentSlice.reducer;