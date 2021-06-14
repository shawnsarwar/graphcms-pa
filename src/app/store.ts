import {
  configureStore,
  ThunkAction,
  Action,
  StateFromReducersMapObject,
  combineReducers
} from '@reduxjs/toolkit';

import PouchDB from 'pouchdb';
import { persistStore, persistentReducer } from 'redux-pouchdb'

import authReducer from '../features/auth/authSlice';
import contentReducer from '../features/content/contentSlice';
import counterReducer from '../features/counter/counterSlice';
import notificationReducer from '../features/notification/notificationSlice';

export const pouchdb = new PouchDB('pyramid-local-application');

const reducerStub = {
  auth: authReducer,
  content: contentReducer,
  counter: counterReducer,
  notification: notificationReducer
}

const reducer = combineReducers(reducerStub);

const persistedReducer = persistentReducer(pouchdb, 'root')(reducer);

export type RootState = StateFromReducersMapObject<typeof reducerStub>

export function initStore(preloadedState: RootState) {
  return configureStore({
    reducer: reducer,
    preloadedState,
  });
}

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

export type Store = ReturnType<typeof initStore>
export type AppDispatch = Store['dispatch']

export const store: Store = configureStore({
  reducer: persistedReducer
})

persistStore(store);
