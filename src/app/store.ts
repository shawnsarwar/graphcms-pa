import {
  configureStore,
  ThunkAction,
  Action,
  DeepPartial,
  StateFromReducersMapObject
} from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import contentReducer from '../features/content/contentSlice';
import counterReducer from '../features/counter/counterSlice';
import notificationReducer from '../features/notification/notificationSlice';
import {setNotificationState} from '../features/notification/notificationSlice';
import {saveState, load} from './localStore';

const savedState: DeepPartial<RootState> = load() as DeepPartial<RootState>;

const reducer = {
  auth: authReducer,
  counter: counterReducer,
  content: contentReducer,
  notification: notificationReducer
}

export type RootState = StateFromReducersMapObject<typeof reducer>

export function initStore(preloadedState: RootState) {
  return configureStore({
    reducer,
    preloadedState,
  });
}

// export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

export type Store = ReturnType<typeof initStore>
export type AppDispatch = Store['dispatch']
export const store: Store = initStore(savedState as any);

store.subscribe(() => {
  saveState({
    auth: store.getState().auth,
    notification: store.getState().notification,
    content: store.getState().content,
    counter: store.getState().counter
  });
});

export async function forceUpdateState(){
  const newState: DeepPartial<RootState> = load() as DeepPartial<RootState>;
  try{
    store.dispatch(setNotificationState(newState.notification as any));
  }catch(err){
    console.warn('Could not force update of state, there may be no existing state to update');
  }
}
