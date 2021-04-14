// (C) 2007-2021 GoodData Corporation
import React, { useEffect, useState } from "react";
import cx from "classnames";
import { Button, Icon } from "@gooddata/sdk-ui-kit";
import { v4 } from "uuid";

import { StaticLegend } from "../StaticLegend";
import { IPushpinCategoryLegendItem } from "../types";

import { LegendDialog } from "./LegendDialog";
import LegendItem from "../LegendItem";
import { ITEM_HEIGHT } from "../helpers";

export interface IRowLegendProps {
    maxRowsCount: number;
    series: IPushpinCategoryLegendItem[];
    onClick: () => void;
}

export const RowLegend: React.FC<IRowLegendProps> = (props: IRowLegendProps) => {
    const { onClick, series, maxRowsCount } = props;
    const [isOverflow, setOverFlow] = useState(true);

    const LEGEND_HEIGHT = maxRowsCount * ITEM_HEIGHT;

    const legendItemList = [...series, ...series, ...series].map((item: any, index: number) => {
        const { type, labelKey, data } = item;
        // const borderRadius = shouldItemHaveBorderRadius(item, enableBorderRadius);
        const borderRadius = false;

        /*if (type === LEGEND_AXIS_INDICATOR) {
            return <LegendAxisIndicator key={index} labelKey={labelKey} data={data} width={width} />;
        } else if (type === LEGEND_SEPARATOR) {
            return <LegendSeparator key={index} />;
        } else {*/
        return (
            <LegendItem
                enableBorderRadius={borderRadius}
                key={index}
                item={item}
                // width={width}
                onItemClick={() => {
                    console.log("OnlegendItemclick");
                }}
            />
        );
        /* }*/
    });

    const checkOverFlow = (element: HTMLDivElement | null) => {
        if (!element) return;
        const { clientHeight, scrollHeight } = element;
        console.log("clientHeight:", clientHeight, "scrollHeight", scrollHeight);
        setOverFlow(scrollHeight > clientHeight);
    };

    const legendButton = (
        <div onClick={onClick} style={{ width: 16 }}>
            <Icon.Explore />
        </div>
    );

    return (
        <div
            style={{ display: "flex", flexDirection: "row-reverse", height: LEGEND_HEIGHT }}
            ref={(element) => {
                checkOverFlow(element);
            }}
        >
            {legendButton}
            <div className={"viz-legend static position-top"}>
                <div style={{ overflow: "hidden" }} className="series">
                    {legendItemList}
                </div>
            </div>
        </div>
    );
};

export interface IPopUpLegendProps {
    legendDetails: any;
    series: IPushpinCategoryLegendItem[];
}

export const PopUpLegend: React.FC<IPopUpLegendProps> = (props: IPopUpLegendProps) => {
    const { series } = props;
    const { position, name } = props.legendDetails;
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [dialogId, setDialogId] = useState<string>("");

    const onCloseDialog = () => setDialogOpen(false);

    useEffect(() => {
        const id = v4();
        setDialogId(`s-legend-anchor-${id}`);
    }, []);

    const classNames = cx("viz-static-legend-wrap", `position-${position}`, dialogId);

    return (
        <div className={classNames}>
            <RowLegend
                maxRowsCount={1}
                series={series}
                onClick={() => {
                    setDialogOpen(true);
                }}
            />

            <LegendDialog alignTo={dialogId} isOpen={isDialogOpen} onCloseDialog={onCloseDialog}>
                <div className="legend-popup-dialog kpi-alert-dialog">
                    <div className="legend-header">
                        <div className="legend-header-title">{name}</div>
                        <div className="legend-close action-close icon-cross" onClick={onCloseDialog} />
                    </div>
                    <div className="legend-content">
                        <StaticLegend
                            containerHeight={300}
                            series={[...series, ...series, ...series]}
                            position={"left"}
                        />
                    </div>
                </div>
            </LegendDialog>
        </div>
    );
};
