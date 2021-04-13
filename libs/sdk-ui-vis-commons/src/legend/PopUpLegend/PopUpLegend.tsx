// (C) 2007-2021 GoodData Corporation
import React, { Component, useState } from "react";
import cx from "classnames";

import { StaticLegend } from "../StaticLegend";
import { IPushpinCategoryLegendItem } from "../types";

import { LegendDialog } from "./LegendDialog";

export interface IPopUpLegendProps {
    series: IPushpinCategoryLegendItem[];
}

export const PopUpLegend: React.FC<IPopUpLegendProps> = (props: IPopUpLegendProps) => {
    const [isDialogOpen, setDialogOpen] = useState(false);
    const onCloseDialog = () => setDialogOpen(false);

    const classNames = cx("viz-static-legend-wrap", "position-top");
    const classNamesContent = cx("viz-legend", "static", "position-top");

    return (
        <div className={classNames}>
            <div className={classNamesContent}>
                <div
                    onClick={() => {
                        setDialogOpen(true);
                    }}
                    className={"s-legend-anchor"}
                >
                    legend click me!{" "}
                </div>
                <LegendDialog isOpen={isDialogOpen} onCloseDialog={onCloseDialog}>
                    <div className="kpi-alert-dialog">
                        <div className="action-close icon-cross" onClick={onCloseDialog} />
                        <StaticLegend containerHeight={300} series={props.series} position={"left"} />
                    </div>
                </LegendDialog>
            </div>
        </div>
    );
};
