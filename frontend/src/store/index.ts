import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { AppState, Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { api } from './api';

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefault) => getDefault().concat(api.middleware),
});

/**
 * Bật refetchOnFocus/refetchOnReconnect. Trên web RTK Query tự nghe sự kiện window;
 * trên mobile dùng AppState (app quay lại foreground = focus).
 */
setupListeners(
  store.dispatch,
  Platform.OS === 'web'
    ? undefined
    : (dispatch, { onFocus, onFocusLost }) => {
        const sub = AppState.addEventListener('change', (state) => {
          if (state === 'active') dispatch(onFocus());
          else dispatch(onFocusLost());
        });
        return () => sub.remove();
      },
);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
