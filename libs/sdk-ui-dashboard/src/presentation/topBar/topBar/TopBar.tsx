// (C) 2020-2021 GoodData Corporation
import React, { useMemo } from "react";
import { useDashboardComponentsContext } from "../../dashboardContexts";
import { ITopBarProps } from "./types";
import { useDashboardSelector } from "../../../model";
import { selectDashboardRenderMode } from "../../../model/store/renderMode/renderModeSelectors";

/**
 * @internal
 */
export const TopBar = (props: ITopBarProps): JSX.Element => {
    const { TopBarComponentProvider } = useDashboardComponentsContext();
    const renderMode = useDashboardSelector(selectDashboardRenderMode);
    const TopBarComponent = useMemo(
        () => TopBarComponentProvider(renderMode),
        [TopBarComponentProvider, renderMode],
    );

    return <TopBarComponent {...props} />;
};
