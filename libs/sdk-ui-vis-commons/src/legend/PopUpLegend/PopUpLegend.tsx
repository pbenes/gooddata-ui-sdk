// (C) 2007-2021 GoodData Corporation
import React, { useEffect, useState } from "react";
import cx from "classnames";
import { Button, Icon } from "@gooddata/sdk-ui-kit";
import { v4 } from "uuid";

import { StaticLegend } from "../StaticLegend";
import { IPushpinCategoryLegendItem } from "../types";

import { LegendDialog } from "./LegendDialog";
import { ITEM_HEIGHT } from "../helpers";
import { LegendList } from "../LegendList";

export interface IRowLegendProps {
    maxRowsCount: number;
    series: IPushpinCategoryLegendItem[];
    enableBorderRadius?: boolean; //TODO where get this props?
    onDialogIconClick: () => void;
    onLegendItemClick: (item: IPushpinCategoryLegendItem) => void;
}

export const RowLegend: React.FC<IRowLegendProps> = (props: IRowLegendProps) => {
    const { series, maxRowsCount, enableBorderRadius, onDialogIconClick, onLegendItemClick } = props;
    const [isOverflow, setOverFlow] = useState(false);

    const LEGEND_HEIGHT = maxRowsCount * ITEM_HEIGHT;

    const checkOverFlow = (element: HTMLDivElement | null) => {
        if (!element) return;
        const { clientHeight, scrollHeight } = element;
        console.log("clientHeight:", clientHeight, "scrollHeight", scrollHeight);
        setOverFlow(scrollHeight > clientHeight);
    };

    const legendButton = isOverflow && (
        <div onClick={onDialogIconClick} style={{ width: 16 }}>
            <Icon.Explore />
        </div>
    );

    return (
        <div style={{ display: "flex", justifyContent: "flex-end", height: LEGEND_HEIGHT }}>
            <div className={"viz-legend static position-top"}>
                <div
                    style={{ overflow: "hidden" }}
                    className="series"
                    ref={(element) => {
                        checkOverFlow(element);
                    }}
                >
                    <LegendList
                        enableBorderRadius={enableBorderRadius}
                        series={[...series, ...series]}
                        onItemClick={onLegendItemClick}
                    />
                </div>
            </div>
            {legendButton}
        </div>
    );
};

export const useRandomComponentId = (idPrefix: string) => {
    const [componentId, setComponentId] = useState<string>("");

    useEffect(() => {
        const id = v4();
        setComponentId(`${idPrefix}${id}`);
    }, []);

    return componentId;
};

export interface IPopUpLegendProps {
    legendDetails: any; //TODO Add types
    series: IPushpinCategoryLegendItem[];
    onLegendItemClick: (item: IPushpinCategoryLegendItem) => void;
}

export const PopUpLegend: React.FC<IPopUpLegendProps> = (props: IPopUpLegendProps) => {
    const { series, legendDetails, onLegendItemClick } = props;
    const { position, name, maxRows } = legendDetails;
    const [isDialogOpen, setDialogOpen] = useState(false);
    const dialogId = useRandomComponentId("s-legend-anchor-");

    // TODO: intl for default
    const legendTitle = name || "Legend";
    const onCloseDialog = () => setDialogOpen(false);

    const classNames = cx("viz-static-legend-wrap", `position-${position}`, dialogId);

    return (
        <div className={classNames}>
            <RowLegend
                maxRowsCount={maxRows}
                series={series}
                onDialogIconClick={() => {
                    setDialogOpen(true);
                }}
                onLegendItemClick={onLegendItemClick}
            />

            <LegendDialog name={name} alignTo={dialogId} isOpen={isDialogOpen} onCloseDialog={onCloseDialog}>
                <StaticLegend
                    containerHeight={300}
                    series={[...series, ...series, ...series]}
                    position={"left"}
                    onItemClick={onLegendItemClick}
                />
            </LegendDialog>
        </div>
    );
};
