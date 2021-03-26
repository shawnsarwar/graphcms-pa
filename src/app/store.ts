import { configureStore, ThunkAction, Action, DeepPartial, StateFromReducersMapObject, PayloadAction} from '@reduxjs/toolkit';
import counterReducer from '../features/counter/counterSlice';
import notificationReducer from '../features/notification/notificationSlice';
import {setNotificationState, NotificationState} from '../features/notification/notificationSlice';
import {saveState, load} from './localStore';

const savedState: DeepPartial<RootState> = load() as DeepPartial<RootState>;

const reducer = {
  counter: counterReducer,
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

type Store = ReturnType<typeof initStore>
export type AppDispatch = Store['dispatch']
export const store: Store = initStore(savedState as any);

store.subscribe(() => {
  saveState({
    notification: store.getState().notification,
    counter: store.getState().counter
  });
});



export async function forceUpdateState(){
  const newState: DeepPartial<RootState> = load() as DeepPartial<RootState>;
  store.dispatch(setNotificationState(newState.notification as any));
}
