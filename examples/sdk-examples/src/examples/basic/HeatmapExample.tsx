// (C) 2007-2019 GoodData Corporation
import React from "react";
import { Heatmap } from "@gooddata/sdk-ui-charts";
import { Ldm, LdmExt } from "../../ldm";

const style = { height: 300 };

function renderH(responsive: boolean | "popup") {
    return (
        <>
            <div style={style} className="s-heat-map">
                <Heatmap
                    measure={LdmExt.TotalSales1}
                    rows={Ldm.LocationState}
                    columns={Ldm.MenuCategory}
                    config={{ legend: { position: "right", responsive } }}
                />
            </div>
            <div style={style} className="s-heat-map">
                <Heatmap
                    measure={LdmExt.TotalSales1}
                    rows={Ldm.LocationState}
                    columns={Ldm.MenuCategory}
                    config={{ legend: { position: "left", responsive } }}
                />
            </div>
            <div style={style} className="s-heat-map">
                <Heatmap
                    measure={LdmExt.TotalSales1}
                    rows={Ldm.LocationState}
                    columns={Ldm.MenuCategory}
                    config={{ legend: { position: "top", responsive } }}
                />
            </div>
            <div style={style} className="s-heat-map">
                <Heatmap
                    measure={LdmExt.TotalSales1}
                    rows={Ldm.LocationState}
                    columns={Ldm.MenuCategory}
                    config={{ legend: { position: "bottom", responsive } }}
                />
            </div>
        </>
    );
}
export const HeatmapExample: React.FC = () => {
    // TODO: delete this, we will use storybook
    return (
        <>
            <div>true</div>
            {renderH(true)}
            <div>false</div>
            {renderH(false)}
            <div>popup</div>
            {renderH("popup")}
        </>
    );
};
