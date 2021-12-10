// (C) 2020-2021 GoodData Corporation
import React, { useMemo } from "react";

import { useDashboardComponentsContext } from "../../dashboardContexts";
import { IDashboardInsightProps } from "./types";
import { useDashboardSelector } from "../../../model";
import { selectDashboardRenderMode } from "../../../model/store/renderMode/renderModeSelectors";

/**
 * @internal
 */
export const DashboardInsight = (props: IDashboardInsightProps): JSX.Element => {
    const { insight, widget } = props;
    const { InsightComponentProvider } = useDashboardComponentsContext();
    const renderMode = useDashboardSelector(selectDashboardRenderMode);
    const InsightComponent = useMemo(
        () => InsightComponentProvider(insight, widget, renderMode),
        [InsightComponentProvider, insight, widget, renderMode],
    );

    return <InsightComponent {...props} />;
};
