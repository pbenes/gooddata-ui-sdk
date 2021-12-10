// (C) 2020-2021 GoodData Corporation
import React, { useMemo } from "react";

import { useDashboardComponentsContext } from "../../dashboardContexts";
import { IDashboardInsightMenuButtonProps } from "./types";
import { useDashboardSelector } from "../../../model";
import { selectDashboardRenderMode } from "../../../model/store/renderMode/renderModeSelectors";

/**
 * @internal
 */
export const DashboardInsightMenuButton = (props: IDashboardInsightMenuButtonProps): JSX.Element => {
    const { insight, widget } = props;
    const { InsightMenuButtonComponentProvider } = useDashboardComponentsContext();
    const renderMode = useDashboardSelector(selectDashboardRenderMode);
    const InsightMenuButtonComponent = useMemo(
        () => InsightMenuButtonComponentProvider(insight, widget, renderMode),
        [InsightMenuButtonComponentProvider, insight, widget],
    );

    return <InsightMenuButtonComponent {...props} />;
};
