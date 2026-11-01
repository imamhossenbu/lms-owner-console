import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface FilterState {
  searchQuery: string;
  roleFilter: string;
  statusFilter: string;
  currentPage: number;
  pageSize: number;
}

const initialState: FilterState = {
  searchQuery: "",
  roleFilter: "ALL",
  statusFilter: "ALL",
  currentPage: 1,
  pageSize: 10,
};

export const filterSlice = createSlice({
  name: "filter",
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.currentPage = 1;
    },
    setRoleFilter: (state, action: PayloadAction<string>) => {
      state.roleFilter = action.payload;
      state.currentPage = 1;
    },
    setStatusFilter: (state, action: PayloadAction<string>) => {
      state.statusFilter = action.payload;
      state.currentPage = 1;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    resetFilters: (state) => {
      state.searchQuery = "";
      state.roleFilter = "ALL";
      state.statusFilter = "ALL";
      state.currentPage = 1;
    },
  },
});

export const {
  setSearchQuery,
  setRoleFilter,
  setStatusFilter,
  setCurrentPage,
  resetFilters,
} = filterSlice.actions;

export default filterSlice.reducer;
