// (C) 2019-2023 GoodData Corporation
import React, { useMemo } from "react";
import { InsightView } from "@gooddata/sdk-ui-ext";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";
import { createBackend } from "./createBackend.js";
import { newAttribute, newMeasure, uriRef, idRef } from "@gooddata/sdk-model";
import { PivotTable } from "@gooddata/sdk-ui-pivot";



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

    const measures =
        [
            newMeasure(uriRef("/gdc/md/g2zpqxe8zk32vmjrux9mb3zywxat1w70/obj/1144"), (m: any) => m.alias("Amount").format("#,##0.00").localId("m__gdc_md_g2zpqxe8zk32vmjrux9mb3zywxat1w70_obj_1144_sum").title("Sum of Amount").aggregation("sum")),
            newMeasure(uriRef("/gdc/md/g2zpqxe8zk32vmjrux9mb3zywxat1w70/obj/1146"), (m: any) => m.format("#,##0.00").localId("m__gdc_md_g2zpqxe8zk32vmjrux9mb3zywxat1w70_obj_1146_sum").title("Sum of Days to Close").aggregation("sum"))

    ];
    let rows: any = [
        newAttribute(uriRef("/gdc/md/g2zpqxe8zk32vmjrux9mb3zywxat1w70/obj/1024"), (a: any) => a.localId("a__gdc_md_g2zpqxe8zk32vmjrux9mb3zywxat1w70_obj_1024"))
    ];


    let columns  = [
        newAttribute(uriRef("/gdc/md/g2zpqxe8zk32vmjrux9mb3zywxat1w70/obj/1027"), (a: any) => a.localId("a__gdc_md_g2zpqxe8zk32vmjrux9mb3zywxat1w70_obj_1027"))
    ];

    const config = {
        menu: {
                aggregationsSubMenuForRows: true,
                aggregationsSubMenu: true,
                aggregations: true
            }
    }


    if (true) {
        const WS = "6c3a7a4718dc44c68845e7677c444d2e";
        const insight = idRef("0b65f40c-ece0-4131-884d-8d4ee4f1d7fb");
        return (
            <BackendProvider backend={backend}>
                <WorkspaceProvider workspace={WS}>
                    <div style={{ width: "665px", height: "362px", padding: 40, margin: 10, border: "2px solid black" }}>
                        <InsightView insight={insight} config={config} />
                    </div>
                </WorkspaceProvider>
            </BackendProvider>
        );
    }

    const WS = "g2zpqxe8zk32vmjrux9mb3zywxat1w70";
    return (
        <BackendProvider backend={backend}>
            <WorkspaceProvider workspace={WS}>
                <div style={{ height: 500}}>
                <PivotTable
                    measures={measures}
                    rows={rows}
                    columns={columns}
                    config={config}
                />
                </div>
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
