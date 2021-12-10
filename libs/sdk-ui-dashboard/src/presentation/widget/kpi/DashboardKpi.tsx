// (C) 2020-2021 GoodData Corporation
import React, { useMemo } from "react";
import { useDashboardComponentsContext } from "../../dashboardContexts";
import { IDashboardKpiProps } from "./types";
import { useDashboardSelector } from "../../../model";
import { selectDashboardRenderMode } from "../../../model/store/renderMode/renderModeSelectors";

/**
 * @internal
 */
export const DashboardKpi = (props: IDashboardKpiProps): JSX.Element => {
    const { KpiComponentProvider } = useDashboardComponentsContext();
    const renderMode = useDashboardSelector(selectDashboardRenderMode);
    const { kpiWidget } = props;
    const KpiComponent = useMemo(
        () => KpiComponentProvider(kpiWidget.kpi, kpiWidget, renderMode),
        [KpiComponentProvider, kpiWidget, renderMode],
    );

    return <KpiComponent {...props} />;
};
