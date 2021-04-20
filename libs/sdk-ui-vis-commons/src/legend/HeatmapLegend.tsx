// (C) 2007-2020 GoodData Corporation
import React from "react";
import { IHeatmapLegendItem, IColorLegendItem } from "./types";
import { ColorLegend } from "./ColorLegend";
import { TOP, BOTTOM } from "./PositionTypes";

/**
 * @internal
 */
export interface IHeatmapLegendProps {
    series: IHeatmapLegendItem[];
    size: "large" | "medium" | "small";
    format?: string;
    numericSymbols: string[];
    position: string;
    title?: string;
}

/**
 * @internal
 */
export class HeatmapLegend extends React.PureComponent<IHeatmapLegendProps> {
    public render(): React.ReactNode {
        const { title, series, format, numericSymbols, size, position } = this.props;
        const data = series.map(
            (item: IHeatmapLegendItem): IColorLegendItem => {
                const { range, color } = item;
                return { range, color };
            },
        );

        return (
            <ColorLegend
                data={data}
                format={format}
                size={size}
                numericSymbols={numericSymbols}
                position={position}
                title={title}
            />
        );
    }
}
