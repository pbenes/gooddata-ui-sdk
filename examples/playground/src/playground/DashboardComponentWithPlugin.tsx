// (C) 2021 GoodData Corporation
import React from "react";
import {
    DashboardContext,
    DashboardPluginV1,
    IDashboardCustomizer,
    IDashboardEventHandling,
    IDashboardWidgetProps,
    newCustomWidget,
    newDashboardItem,
    newDashboardSection,
    DefaultMenuButton,
} from "@gooddata/sdk-ui-dashboard";
import { idRef } from "@gooddata/sdk-model";
import { useDashboardLoader } from "@gooddata/sdk-ui-loaders";

import { LoadingComponent } from "@gooddata/sdk-ui";

const dashboardRef = idRef("aeO5PVgShc0T");

function MyCustomWidget(_props: IDashboardWidgetProps): JSX.Element {
    return <div>Custom widget customization.</div>;
}

class LocalPlugin extends DashboardPluginV1 {
    public readonly author = "FE Workshop";
    public readonly displayName = "App e2e test";
    public readonly version = "1.0";

    public register(
        _ctx: DashboardContext,
        customize: IDashboardCustomizer,
        _handlers: IDashboardEventHandling,
    ): void {
        customize.customWidgets().addCustomWidget("myCustomWidget", MyCustomWidget);
        customize.layout().customizeFluidLayout((_layout, customizer) => {
            customizer.addSection(
                0,
                newDashboardSection(
                    "Workshop Section Plugin",
                    newDashboardItem(newCustomWidget("myWidget1", "myCustomWidget"), {
                        xl: {
                            // all 12 columns of the grid will be 'allocated' for this this new item
                            gridWidth: 12,
                            // minimum height since the custom widget now has just some one-liner text
                            gridHeight: 1,
                        },
                    }),
                ),
            );
        });
    }
}

const LocalExtraPlugin = {
    factory: () => new LocalPlugin(),
};

const DashboardComponentWithPlugin: React.FC = () => {
    const { status, result, error } = useDashboardLoader({
        dashboard: dashboardRef,
        // Is static ok?
        loadingMode: "staticOnly",
        extraPlugins: LocalExtraPlugin,
    });

    if (status === "loading" || status === "pending") {
        return <LoadingComponent />;
    }

    if (error) {
        return <div>Error loading dashboard...</div>;
    }

    const { DashboardComponent, props: dashboardProps } = result!;
    return (
        <div>
            <DashboardComponent {...dashboardProps} MenuButtonComponent={DefaultMenuButton} />
        </div>
    );
};

export default DashboardComponentWithPlugin;
