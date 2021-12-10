// (C) 2021 GoodData Corporation
import { createSlice } from "@reduxjs/toolkit";
import { renderModeReducers } from "./renderModeReducers";
import { renderModeInitialState } from "./renderModeState";

const slice = createSlice({
    name: "renderMode",
    initialState: renderModeInitialState,
    reducers: renderModeReducers,
});

export const renderModeSliceReducer = slice.reducer;
export const renderModeSliceActions = slice.actions;
