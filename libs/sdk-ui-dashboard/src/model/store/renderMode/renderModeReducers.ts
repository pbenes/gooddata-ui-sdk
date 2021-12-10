// (C) 2021 GoodData Corporation

import { Action, CaseReducer, PayloadAction } from "@reduxjs/toolkit";
import { DashboardRenderModeState } from "./renderModeState";
import { IRenderMode } from "../../types/commonTypes";

type RenderModeReducer<A extends Action> = CaseReducer<DashboardRenderModeState, A>;

type SetRenderModePayload = IRenderMode;
const setDashboardRenderMode: RenderModeReducer<PayloadAction<SetRenderModePayload>> = (state, action) => {
    const mode = action.payload;

    state.renderMode = mode;
};

export const renderModeReducers = {
    setDashboardRenderMode,
};
