// (C) 2021 GoodData Corporation
import { IRenderMode } from "../../types/commonTypes";

/**
 * @alpha
 */
export interface DashboardRenderModeState {
    renderMode: IRenderMode;
}

export const renderModeInitialState: DashboardRenderModeState = {
    renderMode: { mode: "view" },
};
