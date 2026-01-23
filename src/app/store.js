import { configureStore } from '@reduxjs/toolkit';
import counterReducer from '../features/counter/counterSlice';
import authReducer from '../features/auth/authSlice';
import responsesReducer from '../features/questions/responsesSlice';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    auth: authReducer,
    responses: responsesReducer,
  },
});