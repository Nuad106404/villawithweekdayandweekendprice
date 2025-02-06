import { configureStore } from '@reduxjs/toolkit';
import bookingReducer from './slices/bookingSlice';
import villaReducer from './slices/villaSlice';
import adminReducer from './slices/adminSlice';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    booking: bookingReducer,
    villa: villaReducer,
    admin: adminReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
