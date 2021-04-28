// (C) 2007-2021 GoodData Corporation
import React, { useRef, useState } from "react";
import { useIntl } from "react-intl";
import { v4 } from "uuid";

import { Icon } from "@gooddata/sdk-ui-kit";

import { StaticLegend } from "../StaticLegend";
import { IPushpinCategoryLegendItem, ItemBorderRadiusPredicate } from "../types";

import { LegendDialog } from "./LegendDialog";
import { LegendList } from "../LegendList";

const LEGEND_ROW_HEIGHT = 20;
const LEGEND_TOP_BOTTOM_PADDING = 10;

const useCheckOverflow = (): [boolean, number, (element: HTMLDivElement | null) => void] => {
    const [isOverflow, setOverFlow] = useState(false);
    const [numOfUsedRow, setNumOfUsedRow] = useState(1);

    const getNumberOfRows = (clientHeight: number) => {
        return (clientHeight - LEGEND_TOP_BOTTOM_PADDING) / LEGEND_ROW_HEIGHT;
    };

    const checkOverFlow = (element: HTMLDivElement | null) => {
        if (!element) return;
        const { clientHeight, scrollHeight } = element;
        setOverFlow(scrollHeight > clientHeight);

        const numberOfRows = getNumberOfRows(clientHeight);
        setNumOfUsedRow(numberOfRows);
    };

    return [isOverflow, numOfUsedRow, checkOverFlow];
};

const useRandomComponentId = (idPrefix: string) => {
    const val = useRef("");
    if (!val.current) {
        const id = v4();
        val.current = `${idPrefix}${id}`;
    }
    return val.current;
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
        <div className="legend-popup-button">
            <div onClick={onIconClick} className="legend-popup-icon">
                <Icon.LegendMenu />
            </div>
        </div>
    );
};

export interface ILegendLabel {
    label: string;
}

export const LegendLabelItem: React.FC<ILegendLabel> = (props) => {
    const { label } = props;
    if (!label) {
        return null;
    }
    return (
        <div className="series-item">
            <div className="series-name">{`${label}:`}</div>
        </div>
    );
};

export interface IRowLegendProps {
    legendLabel: string;
    maxRowsCount: number;
    series: IPushpinCategoryLegendItem[];
    enableBorderRadius?: boolean | ItemBorderRadiusPredicate;
    onDialogIconClick: () => void;
    onLegendItemClick: (item: IPushpinCategoryLegendItem) => void;
}

export const RowLegend: React.FC<IRowLegendProps> = (props) => {
    const {
        series,
        maxRowsCount,
        legendLabel,
        enableBorderRadius,
        onDialogIconClick,
        onLegendItemClick,
    } = props;
    const [isOverflow, numOfUsedRow, checkOverFlow] = useCheckOverflow();

    const LEGEND_HEIGHT = maxRowsCount * LEGEND_ROW_HEIGHT + LEGEND_TOP_BOTTOM_PADDING;

    const itemsAlign = numOfUsedRow === 1 ? "flex-end" : "flex-start";

    return (
        <div className="legend-popup-row" style={{ maxHeight: LEGEND_HEIGHT }}>
            <div className="viz-legend static position-row">
                <div
                    className="series"
                    style={{
                        justifyContent: itemsAlign,
                    }}
                    ref={(element) => {
                        checkOverFlow(element);
                    }}
                >
                    <LegendLabelItem label={legendLabel} />
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

export interface IPopUpLegendProps {
    series: IPushpinCategoryLegendItem[];
    onLegendItemClick: (item: IPushpinCategoryLegendItem) => void;
    name: string;
    maxRows: number;
    enableBorderRadius?: boolean | ItemBorderRadiusPredicate;
    containerId: string;
}

export const PopUpLegend: React.FC<IPopUpLegendProps> = (props) => {
    const { name, maxRows, enableBorderRadius, series, onLegendItemClick, containerId } = props;
    const intl = useIntl();
    const [isDialogOpen, setDialogOpen] = useState(false);
    const dialogId = useRandomComponentId("s-legend-anchor-");

    const dialogTitle = name || intl.formatMessage({ id: "properties.legend.title" });

    const onCloseDialog = () => setDialogOpen(false);

    return (
        <div className={dialogId}>
            <RowLegend
                legendLabel={name}
                maxRowsCount={maxRows}
                series={[...series]}
                onDialogIconClick={() => {
                    setDialogOpen(true);
                }}
                onLegendItemClick={onLegendItemClick}
                enableBorderRadius={enableBorderRadius}
            />

            <LegendDialog
                name={dialogTitle}
                alignTo={`.${containerId}`}
                isOpen={isDialogOpen}
                onCloseDialog={onCloseDialog}
            >
                <StaticLegend
                    containerHeight={300}
                    series={[...series]}
                    position={"dialog"}
                    onItemClick={onLegendItemClick}
                    shouldFillAvailableSpace={false}
                    enableBorderRadius={enableBorderRadius}
                />
            </LegendDialog>
        </div>
    );
};
