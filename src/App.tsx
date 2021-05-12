import React from 'react';
import { NotificationController } from './features/notification/Notification';
// import { AuthController } from './features/auth/Auth';
import {PyramidEmbed} from './features/content/Content';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        {/* <AuthController/> */}
        <PyramidEmbed id={"mycontent"} contentID={"0a28c239-6066-40f0-84a2-3e4c34b650a2"}></PyramidEmbed>
        <NotificationController/>
      </header>
    </div>
  );
}


export { App };
