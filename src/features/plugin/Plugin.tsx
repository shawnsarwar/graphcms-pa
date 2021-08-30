import React, {useEffect, useState} from 'react';
import { useDispatch } from 'react-redux';
import { Route, Switch, BrowserRouter } from 'react-router-dom';

import {
    Wrapper,
    useUiExtension,
    useUiExtensionDialog,
    FieldExtensionType,
    FieldExtensionDeclaration,
    FieldExtensionFeature,
  } from '@graphcms/uix-react-sdk';

import  {
    LoginCredentials,
    LoginSession,
    setLoginSession
} from '../auth/authSlice';
import { makeSession } from '../auth/Helpers';

import {SimpleTree} from '../picker/Picker'
import { ContentFolder, ContentItem } from '../../utils/api_types';


export const declaration: FieldExtensionDeclaration = {
    config: {
        PA_URL: {
            type: 'string',
            displayName: 'Pyramid Instance URL',
            required: true,
        },
        USER:{
            type: 'string',
            displayName: "Embed User's Username",
            required: true,
        },
        PASSWORD:{
            type: 'string',
            displayName: "Embed User's Password",
            required: true,
        }
    },
    extensionType: 'field',
    fieldType: FieldExtensionType.JSON,
    name: 'Pyramid Analytics Object',
    description: 'Pick content from Pyramid',
    features: [
        FieldExtensionFeature.FieldRenderer,
        FieldExtensionFeature.ListRenderer,
        FieldExtensionFeature.TableRenderer
    ],
  };

type GraphCMSPyramidEmbed = {
    embed_token: string
    contentID: string
    description: string
    url: string
};

interface AppProperties {
  baseUrl?: string
}

export function App(props: AppProperties) {
  let baseName = props?.baseUrl !== undefined ? props.baseUrl : '/';
  return (
    <Wrapper declaration={declaration}>
      <BrowserRouter basename={baseName}>
        <Switch>
          <Route path="/" component={BaseRouter}/>
        </Switch>
      </BrowserRouter>
    </Wrapper>
  );
}

export function BaseRouter(){
  return (
    <Switch>
      <Route path="/" exact>
        <Extension />
      </Route>
        <Route path="/picker" exact>
      <PyramidDialogPicker />
        </Route>
      <Route path="/embed" exact>
        <div>An Embed</div>
      </Route>
    </Switch>
  );
}


type DialogReturn = GraphCMSPyramidEmbed;
// 2. Optional props you'd like to access in the dialog
type DialogProps = {};

function Extension() {
    // Pass a type parameter to useUiExtension hook for better developer experience
    const { isTableCell } = useUiExtension<typeof declaration>();
    // isTableCell can be used to detect whether the extension is currently rendered in content table
    if (isTableCell) {
      return <TableCellRenderer/>;
    }
  
    return <FormFieldRenderer />;
  }

function TableCellRenderer(){
    const {
        value,
        extension: { config },
    } = useUiExtension<typeof declaration>();

    return (
        <div>{value?.description !== undefined ? value.description : "None Selected"}</div>
    );
}

function FormFieldRenderer() {
    // this is the element that gets rendered by GCMS into the value space for this when the element is included
    // in the schema for an item. It'll let us launch the modal to pick our Pyramid Content from the server.
    const {
        value,
        onChange,
        isExpanded,
        openDialog,
        extension: { config },
    } = useUiExtension<typeof declaration>();
    
    const [visName, setVisName] = useState("");
  
    const [isTransitioning, setIsTransitioning] = useState(false);
    
    useEffect(() => {
        setIsTransitioning(false);
        if(value){
            setVisName(value.description);
        }
    }, [isExpanded, value, visName, setVisName]);

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '10px',
                opacity: isTransitioning ? 0 : 1,
            }}
        >
          {visName === "" ? null : (<div>{visName}</div>)}
          {isExpanded ? null : (
            <button
              style={{
                cursor: 'pointer',
                marginBottom: '10px',
                boxSizing: 'border-box',
                userSelect: 'none',
                color: '#6663FD',
                backgroundColor: '#F2F1FF',
                textAlign: 'center',
                lineHeight: '16px',
                display: 'inline-flex',
                border: '0px',
                borderRadius: '4px',
                fontWeight: 600,
                fontFamily:
                'Inter, -apple-system, system-ui, "Segoe UI", Helvetica, Arial, sans-serif',
                fontSize: '14px',
                verticalAlign: 'middle',
                padding: '8px',
            }}
              onClick={() => {
                openDialog<DialogReturn, DialogProps>('/picker', {
                  maxWidth: '392px',
                }).then((value) => {    
                    if (value) {
                        setVisName(value.description);
                        onChange(value);
                    }else{
                        console.log("new value missing!?");
                    }
                });
              }}
            >
            {visName !== "" ? "Change Content" : "Select Content from Pyramid"}
            </button>)}
        </div>
    );
}

function PyramidDialogPicker() {
    const {
      extension: { config },
    } = useUiExtension<typeof declaration>();
    // You can pass type parameters to useUiExtensionDialog
    // onCloseDialog function is always returned from the hook
    const { onCloseDialog } = useUiExtensionDialog<
      DialogReturn,
      DialogProps
    >();

    const [ready, setReady] = useState(false);
    //const [content, setContent] = useState<ContentFolder | ContentItem | undefined>();
    const [localSession, setLocalSession] = useState({} as LoginSession);
    const dispatch = useDispatch();

    const box_style = {
        "maxHeight": "90%",
    }

    function onSelect(content: ContentFolder | ContentItem){
        if (!content){
            onCloseDialog(null);    
            return;
        }
        console.log(`Closing dialog with selected: ${content.id}`);
        const result = {
            embed_token: localSession.embedToken,
            contentID: content.id,
            description: content.caption,
            url: config.PA_URL,
         } as GraphCMSPyramidEmbed;
        onCloseDialog(result);
        
    };

    useEffect(() => {
        if (ready){
            return;
        }
        const creds: LoginCredentials = {
            user_name: config.USER,
            password: config.PASSWORD,
            domain: config.PA_URL
        };
        makeSession(creds).then(session => {
            if (session !== undefined){
                setLocalSession(session);
                dispatch(setLoginSession(session));
                setReady(true);
            }    
        });
    }, [ready, setReady, config.USER, config.PASSWORD, config.PA_URL, dispatch]);
  
    return (
        <div>
            {ready && <SimpleTree onContentSelect={onSelect}></SimpleTree>}
        </div>
    );
  }
