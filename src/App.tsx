import React from 'react';
import {BrowserRouter, Route, Switch } from 'react-router-dom';
import {BaseRouter} from './features/router/Router';
import './App.css';

interface AppProperties {
  baseUrl?: string
}

function App(props: AppProperties) {
  let baseName = props?.baseUrl !== undefined ? props.baseUrl : '/';
  console.log(`Got baseURL of ${baseName}`);

  return (
    <div className="App">
      <header className="App-header">
       <BrowserRouter basename={baseName}>
          <Switch>
              <Route path="/" component={BaseRouter}/>
          </Switch>
        </BrowserRouter>
      </header>
    </div>
  );
}


export { App };
