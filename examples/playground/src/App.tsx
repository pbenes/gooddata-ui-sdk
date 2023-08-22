// (C) 2019-2023 GoodData Corporation
import React, { useMemo } from "react";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";
import { createBackend } from "./createBackend.js";
//@ts-ignore
import { MyComponent } from "./playground/PivotTableManualResizing.js";
import { InsightView } from "@gooddata/sdk-ui-ext";

function hasCredentialsSetup(): boolean {
    if (BACKEND_TYPE === "tiger") {
        return !!process.env.TIGER_API_TOKEN;
    }
    return BUILD_TYPE === "public" || (process.env.GDC_USERNAME && process.env.GDC_PASSWORD);
}

const AppWithBackend: React.FC = () => {
    // only create the backend instance once
    const backend = useMemo(() => {
        return createBackend();
    }, []);

    const config = {
        menu: {
            aggregationsSubMenuForRows: true,
            aggregationsSubMenu: true,
            aggregations: true,
        },
    };
    const insight = "aabJYXneDnKP";

    return (
        <BackendProvider backend={backend}>
            <WorkspaceProvider workspace={WORKSPACE}>
                <div
                    style={{
                        width: "665px",
                        height: "362px",
                        padding: 40,
                        margin: 10,
                        border: "2px solid black",
                    }}
                >
                    <InsightView insight={insight} config={config} />
                </div>
                <MyComponent />
            </WorkspaceProvider>
        </BackendProvider>
    );
};

export const App: React.FC = () => {
    if (!hasCredentialsSetup()) {
        return (
            <p>
                Your playground is not setup with credentials. Check out the README.md for more. TL;DR: point
                the playground against the public access proxy or set GDC_USERNAME and GDC_PASSWORD or
                TIGER_API_TOKEN in the .env file.
            </p>
        );
    }

    return <AppWithBackend />;
};
