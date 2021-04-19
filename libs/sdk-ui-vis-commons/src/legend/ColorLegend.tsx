// (C) 2020 GoodData Corporation
import React from "react";
import cx from "classnames";
import {
    IColorLegendBox,
    IColorLegendConfig,
    IHeatmapLegendLabel as IColorLegendLabel,
    getColorLegendConfiguration,
} from "./helpers";
import { TOP, BOTTOM } from "./PositionTypes";
import { IColorLegendItem } from "./types";
import { ITheme } from "@gooddata/sdk-backend-spi";
import { withTheme } from "@gooddata/sdk-ui-theme-provider";

/**
 * @internal
 */
export interface IColorLegendProps {
    data: IColorLegendItem[];
    numericSymbols: string[];
    position: string;
    isSmall?: boolean;
    format?: string;
    theme?: ITheme;
    title?: string;
}

interface IColorLabelsProps {
    labels: IColorLegendLabel[];
}

interface IColorBoxesProps {
    boxes: IColorLegendBox[];
}

export function ColorLabels(colorLabelProps: IColorLabelsProps): JSX.Element {
    const { labels } = colorLabelProps;
    return (
        <div className="labels">
            {labels.map(
                (item: IColorLegendLabel): JSX.Element => {
                    const { key, label, style } = item;
                    return (
                        <span key={key} style={style}>
                            {label}
                        </span>
                    );
                },
            )}
        </div>
    );
}

export function ColorBoxes(colorBoxProps: IColorBoxesProps): JSX.Element {
    const { boxes } = colorBoxProps;
    return (
        <div className="boxes">
            {boxes.map(
                (box: IColorLegendBox): JSX.Element => {
                    const classes = cx("box", box.class);
                    const { key, style } = box;
                    return <span className={classes} key={key} style={style} />;
                },
            )}
        </div>
    );
}

function renderLegendBoxes(
    renderLabelsFirst: boolean,
    boxes: IColorLegendBox[],
    labels: IColorLegendLabel[],
) {
    return (
        <>
            {renderLabelsFirst && <ColorLabels labels={labels} />}
            <ColorBoxes boxes={boxes} />
            {!renderLabelsFirst && <ColorLabels labels={labels} />}
        </>
    );
}

function LegendWithTitle(props: { title: string; position: string; children: any }): JSX.Element {
    const { title, position, children } = props;
    const direction = position === TOP || position === BOTTOM ? "row" : "column";
    const justifyContent = position === TOP || position === BOTTOM ? "flex-end" : "flex-start";
    const innerFlexDirection = position === TOP || position === BOTTOM ? "column" : "row";
    const titleStyle =
        position === TOP || position === BOTTOM
            ? {
                  marginRight: 10,
                  alignSelf: "center",
                  minWidth: 50,
              }
            : {
                  marginLeft: 20,
                  maxWidth: 210,
                  marginBottom: 10,
              };
    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent,
                flexDirection: direction,
            }}
        >
            <div
                style={{
                    overflow: "hidden",
                    ...titleStyle,
                    maxHeight: "20px",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                }}
            >
                {title}
            </div>
            <div style={{ display: "flex", flexDirection: innerFlexDirection }}>{props.children}</div>
        </div>
    );
}

/**
 * @internal
 */
export const ColorLegend = withTheme((colorLegendProps: IColorLegendProps) => {
    const { title, data, format, numericSymbols, isSmall = false, position, theme } = colorLegendProps;
    if (!data.length) {
        return null;
    }

    const config: IColorLegendConfig = getColorLegendConfiguration(
        data,
        format,
        numericSymbols,
        isSmall,
        position,
        theme,
    );
    const classes = cx(...config.classes);
    const renderLabelsFirst = config.position === TOP;
    const { boxes, labels } = config;

    const renderedBoxes = renderLegendBoxes(renderLabelsFirst, boxes, labels);
    return (
        <div className={classes}>
            {title ? (
                <LegendWithTitle title={title} position={position}>
                    {renderedBoxes}
                </LegendWithTitle>
            ) : (
                renderedBoxes
            )}
        </div>
    );
});
