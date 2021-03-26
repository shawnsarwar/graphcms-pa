import React from 'react';
import { NotificationController } from './features/notification/Notification';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <NotificationController/>
      </header>
    </div>
  );
}


export { App };
