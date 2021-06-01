import React, {useState, useEffect} from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../app/store';

import {LoginSession, selectLoginSession} from '../auth/authSlice';
import {
    addEmbedView,
    EmbedView,
    getEmbedViewByContentID,
} from './contentSlice';

import { ThemeProvider } from '@material-ui/core/styles';
import {themeNormal} from '../../shared/styles';
import styles from "./Content.module.css"


export interface EmbedControlWidgetArgs{
    id: string;
    name: string;
}

export function EmbedControlWidget(args: EmbedControlWidgetArgs){
    const session: LoginSession = useSelector((state: RootState) => selectLoginSession(state));
    const state: EmbedView = useSelector((state: RootState) => getEmbedViewByContentID(state, session.domain, args.id, args.name));
    const [shown, setShow] = useState(false);
    const dispatch = useDispatch();

    const saveChanges = (view: EmbedView) => {
        dispatch(addEmbedView({...view}));
        setShow(false);
    }

    return (
        <div className={styles.float_container}>
        {
            state.id !== '' && shown &&
            <EmbedEditor id={state.id} server={session.domain} givenName={args.name} record={state} onSave={saveChanges} onCancel={() => {setShow(false)}}/>
        }
        {
            state.id !== '' && !shown &&
            <div className={styles.edit_icon} onClick={ () => {setShow(true)}}/>
        }
        </div>
        
    )
}

export interface EmbedEditorArgs{
    id: string;
    server: string;
    givenName?: string;
    record?: EmbedView;
    onSave(settings: EmbedView): void;
    onCancel?(): void;
    onDelete?(): void;
}

export function EmbedEditor(args: EmbedEditorArgs){
    const [state, setState] = useState({
        id: '',
        name: '',
        url: '',
        styles: ''
    });

    const [valState, setValState] = useState({
        name: state.name ? '': 'required',
        url: state.url ? '' : 'required',
        styles: ''
    });

    const reset = () => {
        if (state.id !== args.id){
            setState({
                id: args.id,
                name: args.record ? args.record.name: "",
                url: args.record? args.record.url: "",
                styles: args.record ? JSON.stringify(args.record.styles, null, 2) : `{
                    "width": "100vw",
                    "height": "100vh",
                    "min-width": "500px",
                    "min-height": "500px",
                    "max-width": "100%",
                    "max-height": "100%",
                }`
            })
            setValState({
                name: state.name ? '': 'required',
                url: state.url ? '' : 'required',
                styles: ''
            })
        }
    }

    const validate = (k: string, v: any): boolean => {
        var err: any = {};
        switch(k){
            case "name": {
                if (v === ""){
                    err[k] = 'A name is required.';
                }
                break;
            }
            case "url": {
                var valid = encodeURIComponent(v);
                if (v !== valid){
                    err[k] = `Invalid url: try ${valid}`;
                }else if (v === ""){
                    err[k] = 'A url is required.';
                }
                break;
            }
            case "styles": {
                if(v === ""){break;}
                try{
                    var res = JSON.parse(v);
                    if (!res || res.constructor !== Object){
                        throw Error('Invalid JSON')
                    }
                }catch(ex){
                    err[k] = `Bad Style: ${ex}`;
                }
                break;
            }
            default: {}
        }
        if(Object.keys(err).length > 0){
            setValState({...valState, ...err})    
            return false;
        }else{
            setValState({...valState, ...{[k]: ""}})
            return true;
        }
    }

    const allValid = (): boolean => {
        try{
            var c = 0;
            Object.entries(valState).forEach((pair) => {
                let [k, v] = pair;
                if (v !== ""){
                    throw Error(`${k} is non compliant`);
                }
            })
            Object.entries(state).forEach((pair) => {
                let [_, v] = pair;
                if ( v !== "" && v !== undefined) {c += 1};
            });
            if (c < 1){
                throw Error("no input");
            }
            
        }catch(err){return false;}
        return true;
    };
    
    const prepareState = () => {
        var styleJSON = {styles: ""};
        if(state.styles !== ""){
            styleJSON.styles = JSON.parse(state.styles);
        }
        args?.onSave({
            server: args.server,
            ...state,
            ...styleJSON
            
        } as EmbedView);
    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const key = event.target.id;
        var changes: any = {};
        changes[key] = event.target.value;
        validate(key, event.target.value)
        setState({...state, ...changes});        
    }
    useEffect(() => {
        reset();
    });

    return (
        <ThemeProvider theme={themeNormal}>
            <form autoComplete="off" className={styles.embedSettings}>
                <div className={styles.label}>Embed Options</div>
                <hr/>
                <TextField id="name"
                    label="Name"
                    variant="outlined"
                    fullWidth
                    onChange={handleChange}
                    required
                    helperText={valState["name"]}
                    value={state.name}
                />
                <hr/>
                <TextField
                    id="url"
                    label="URL"
                    variant="outlined"
                    fullWidth
                    onChange={handleChange}
                    required
                    helperText={valState["url"]}
                    value={state.url}
                />
                <hr/>
                <TextField
                    id="styles"
                    label="Styles (json)"
                    variant="outlined"
                    fullWidth
                    onChange={handleChange}
                    multiline
                    helperText={valState["styles"]}
                    value={state.styles}
                />
                
                <div>
                    <Button id="cancel" variant="contained" onClick={args?.onCancel}>Close</Button>
                    {
                        args?.onDelete && 
                        <Button id="delete" variant="contained" color="secondary" onClick={args.onDelete}>Delete</Button>
                    }
                    <Button id="save" variant="contained" color="primary" disabled={!allValid()} onClick={prepareState}>Save</Button>
                    
                </div>
            </form>
        </ThemeProvider>
    )
}
