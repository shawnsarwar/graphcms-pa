import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter} from 'react-router-dom';
import './index.css';
// import {App} from './App';
import {App} from './features/plugin/Plugin';
import { store } from './app/store';
import { Provider } from 'react-redux';
import * as serviceWorker from './serviceWorker';

let target = document.getElementById('root');
// let baseUrl: string | null | undefined = target?.getAttribute("baseUrl");
ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        {/* <App baseUrl={baseUrl === null || baseUrl === undefined ? "/" : baseUrl}/> */}
        <App/>
      </Provider>
    </BrowserRouter>
  </React.StrictMode>,
  target
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

export { App };
export default App;
