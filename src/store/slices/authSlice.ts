import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "SUPER_ADMIN" | string;
  avatar?: string | null;
  phone?: string | null;
  lastLoginAt?: string | null;
  emailVerified?: boolean;
}

export interface AuthState {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isInitialized: false,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: AdminUser; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.isInitialized = true;
      if (typeof window !== "undefined") {
        localStorage.setItem("admin_token", action.payload.token);
        localStorage.setItem(
          "admin_user",
          JSON.stringify(action.payload.user)
        );
      }
    },
    setUser: (state, action: PayloadAction<AdminUser | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload && !!state.token;
      if (typeof window !== "undefined") {
        if (action.payload) {
          localStorage.setItem("admin_user", JSON.stringify(action.payload));
        } else {
          localStorage.removeItem("admin_user");
        }
      }
    },
    setToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload;
      state.isAuthenticated = !!action.payload && !!state.user;
      if (typeof window !== "undefined") {
        if (action.payload) {
          localStorage.setItem("admin_token", action.payload);
        } else {
          localStorage.removeItem("admin_token");
        }
      }
    },
    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.isInitialized = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isInitialized = true;
      if (typeof window !== "undefined") {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_user");
      }
    },
  },
});

export const { setCredentials, setUser, setToken, setInitialized, logout } =
  authSlice.actions;
export default authSlice.reducer;
