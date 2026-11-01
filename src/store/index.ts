import { configureStore } from "@reduxjs/toolkit";
import uiReducer from "./slices/uiSlice";
import filterReducer from "./slices/filterSlice";
import authReducer from "./slices/authSlice";

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    filter: filterReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
