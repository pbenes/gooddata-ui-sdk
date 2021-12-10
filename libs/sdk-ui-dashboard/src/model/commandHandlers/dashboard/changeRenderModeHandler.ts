// (C) 2021 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { DashboardContext } from "../../types/commonTypes";
import { DashboardRenderModeChanged, dashboardRenderModeChanged } from "../../events/dashboard";
import { ChangeDashboardRenderMode } from "../../commands/dashboard";
import { renderModeSliceActions } from "../../store/renderMode";
import { put } from "redux-saga/effects";

export function* changeDashboardRenderModeHandler(
    ctx: DashboardContext,
    cmd: ChangeDashboardRenderMode,
): SagaIterator<DashboardRenderModeChanged> {
    const { mode } = cmd.payload;

    yield put(renderModeSliceActions.setDashboardRenderMode(mode));

    return dashboardRenderModeChanged(ctx, mode, cmd.correlationId);
}
