// (C) 2007-2021 GoodData Corporation
import React, { useEffect, useState } from "react";
import cx from "classnames";
import { Button, Icon } from "@gooddata/sdk-ui-kit";
import { v4 } from "uuid";

import { StaticLegend } from "../StaticLegend";
import { IPushpinCategoryLegendItem } from "../types";

import { LegendDialog } from "./LegendDialog";
import LegendItem from "../LegendItem";

export interface IRowLegendProps {
    maxRowsCount: number;
    series: IPushpinCategoryLegendItem[];
    onClick: () => void;
}

export const RowLegend: React.FC<IRowLegendProps> = (props: IRowLegendProps) => {
    const { onClick, series } = props;

    const legendItemList = [...series, ...series].map((item: any, index: number) => {
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

    /*const legendButton =  <Button
        className={"gd-button-primary"}
        iconLeft={<Icon.Explore />}
    />*/

    const legendButton = (
        <div onClick={onClick} style={{ border: "1px solid" }}>
            <Icon.Explore />
        </div>
    );

    return (
        <div style={{ border: "1px solid green" }}>
            <div className={"viz-legend static position-top"}>
                <div style={{ border: "1px solid red" }} className="series">
                    {legendItemList}
                </div>
            </div>
            {legendButton}
        </div>
    );
};

export interface IPopUpLegendProps {
    legendDetails: any;
    series: IPushpinCategoryLegendItem[];
}

export const PopUpLegend: React.FC<IPopUpLegendProps> = (props: IPopUpLegendProps) => {
    const { series } = props;
    const { position } = props.legendDetails;
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
                maxRowsCount={2}
                series={series}
                onClick={() => {
                    setDialogOpen(true);
                }}
            />

            <LegendDialog alignTo={dialogId} isOpen={isDialogOpen} onCloseDialog={onCloseDialog}>
                <div className="kpi-alert-dialog">
                    <div className="action-close icon-cross" onClick={onCloseDialog} />
                    <StaticLegend
                        containerHeight={300}
                        series={[...series, ...series, ...series]}
                        position={"left"}
                    />
                </div>
            </LegendDialog>
        </div>
    );
};
