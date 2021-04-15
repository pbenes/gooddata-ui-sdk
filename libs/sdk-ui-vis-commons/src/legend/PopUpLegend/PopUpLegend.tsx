// (C) 2007-2021 GoodData Corporation
import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import cx from "classnames";
import { v4 } from "uuid";

import { Icon } from "@gooddata/sdk-ui-kit";

import { StaticLegend } from "../StaticLegend";
import { IPushpinCategoryLegendItem } from "../types";

import { LegendDialog } from "./LegendDialog";
import { ITEM_HEIGHT } from "../helpers";
import { LegendList } from "../LegendList";

const useCheckOverflow = (): [boolean, (element: HTMLDivElement | null) => void] => {
    const [isOverflow, setOverFlow] = useState(false);

    const checkOverFlow = (element: HTMLDivElement | null) => {
        if (!element) return;
        const { clientHeight, scrollHeight } = element;
        setOverFlow(scrollHeight > clientHeight);
    };

    return [isOverflow, checkOverFlow];
};

export interface IRowLegendIcoButton {
    isVisible: boolean;
    onIconClick: () => void;
}

export const RowLegendIcoButton: React.FC<IRowLegendIcoButton> = (props) => {
    const { isVisible, onIconClick } = props;

    if (!isVisible) {
        return null;
    }

    return (
        <div onClick={onIconClick} style={{ width: 16 }}>
            <Icon.Explore />
        </div>
    );
};

export interface IRowLegendProps {
    legendLabel: string;
    maxRowsCount: number;
    series: IPushpinCategoryLegendItem[];
    enableBorderRadius?: boolean; //TODO where get this props?
    onDialogIconClick: () => void;
    onLegendItemClick: (item: IPushpinCategoryLegendItem) => void;
}

export const RowLegend: React.FC<IRowLegendProps> = (props: IRowLegendProps) => {
    const { series, maxRowsCount, enableBorderRadius, onDialogIconClick, onLegendItemClick } = props;
    const [isOverflow, checkOverFlow] = useCheckOverflow();

    const LEGEND_HEIGHT = maxRowsCount * ITEM_HEIGHT;

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
                        series={series}
                        onItemClick={onLegendItemClick}
                    />
                </div>
            </div>
            <RowLegendIcoButton isVisible={isOverflow} onIconClick={onDialogIconClick} />
        </div>
    );
};

const useRandomComponentId = (idPrefix: string) => {
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

export const PopUpLegend: React.FC<IPopUpLegendProps> = (props) => {
    const { series, legendDetails, onLegendItemClick } = props;
    const { position, name, maxRows } = legendDetails;
    const intl = useIntl();
    const [isDialogOpen, setDialogOpen] = useState(false);
    const dialogId = useRandomComponentId("s-legend-anchor-");

    const dialogTitle = name || intl.formatMessage({ id: "properties.legend.title" });

    const onCloseDialog = () => setDialogOpen(false);

    const classNames = cx("viz-static-legend-wrap", `position-${position}`, dialogId);

    return (
        <div className={classNames}>
            <RowLegend
                legendLabel={name}
                maxRowsCount={maxRows}
                series={series}
                onDialogIconClick={() => {
                    setDialogOpen(true);
                }}
                onLegendItemClick={onLegendItemClick}
            />

            <LegendDialog
                name={dialogTitle}
                alignTo={dialogId}
                isOpen={isDialogOpen}
                onCloseDialog={onCloseDialog}
            >
                <StaticLegend
                    containerHeight={300}
                    series={series}
                    position={"left"}
                    onItemClick={onLegendItemClick}
                />
            </LegendDialog>
        </div>
    );
};
