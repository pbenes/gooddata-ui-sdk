// (C) 2020-2021 GoodData Corporation
import React, { useMemo } from "react";

import { useDashboardComponentsContext } from "../../dashboardContexts";
import { IDashboardInsightMenuProps } from "./types";
import { useDashboardSelector } from "../../../model";
import { selectDashboardRenderMode } from "../../../model/store/renderMode/renderModeSelectors";

/**
 * @internal
 */
export const DashboardInsightMenu = (props: IDashboardInsightMenuProps): JSX.Element => {
    const { insight, widget } = props;
    const { InsightMenuComponentProvider } = useDashboardComponentsContext();
    const renderMode = useDashboardSelector(selectDashboardRenderMode);
    const InsightMenuComponent = useMemo(
        () => InsightMenuComponentProvider(insight, widget, renderMode),
        [InsightMenuComponentProvider, insight, widget, renderMode],
    );

    return <InsightMenuComponent {...props} />;
};
