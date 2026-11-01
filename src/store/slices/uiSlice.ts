import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UiState {
  sidebarCollapsed: boolean;
  theme: "light" | "night";
  activeMobileMenu: boolean;
}

const initialState: UiState = {
  sidebarCollapsed: false,
  theme: "light",
  activeMobileMenu: false,
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === "light" ? "night" : "light";
    },
    setTheme: (state, action: PayloadAction<"light" | "night">) => {
      state.theme = action.payload;
    },
    toggleMobileMenu: (state) => {
      state.activeMobileMenu = !state.activeMobileMenu;
    },
    setMobileMenu: (state, action: PayloadAction<boolean>) => {
      state.activeMobileMenu = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarCollapsed,
  toggleTheme,
  setTheme,
  toggleMobileMenu,
  setMobileMenu,
} = uiSlice.actions;

export default uiSlice.reducer;
