// (C) 2007-2020 GoodData Corporation
import React from "react";
import Measure, { Rect } from "react-measure";
import cx from "classnames";

import isEmpty from "lodash/isEmpty";

import { FluidLegend } from "./FluidLegend";
import { StaticLegend, IStaticLegendProps } from "./StaticLegend";
import { HeatmapLegend } from "./HeatmapLegend";
import { IntlWrapper, IntlTranslationsProvider, ITranslationsComponentProps } from "@gooddata/sdk-ui";
import { IPushpinCategoryLegendItem, ItemBorderRadiusPredicate } from "./types";
import { PopUpLegend } from "./PopUpLegend/PopUpLegend";
import { RIGHT, TOP, BOTTOM } from "./PositionTypes";

/**
 * @internal
 */
export interface ILegendProps {
    legendDetails?: any;
    responsive?: boolean;
    legendItemsEnabled?: any[];
    height?: number;
    position: string;
    heatmapLegend?: boolean;
    series: any;
    seriesMapper?: (visibleSeries: any) => any;
    format?: string;
    locale?: string;
    showFluidLegend?: boolean;
    enableBorderRadius?: boolean | ItemBorderRadiusPredicate;
    onItemClick(item: any): void;
    validateOverHeight(legendClient: Rect): void;
}

/**
 * @internal
 */
export class Legend extends React.PureComponent<ILegendProps> {
    public static defaultProps = {
        responsive: false,
        legendItemsEnabled: [] as any,
        height: 0,
        showFluidLegend: false,
        isLegendOverHeight: false,
        enableBorderRadius: false,
    };

    public onItemClick = (item: IPushpinCategoryLegendItem): void => {
        this.props.onItemClick(item);
    };

    public getSeries = (): any => {
        const { series, legendItemsEnabled = [], seriesMapper } = this.props;

        const seriesWithVisibility = series.map((seriesItem: any) => {
            const isVisible = legendItemsEnabled[seriesItem.legendIndex];
            return {
                ...seriesItem,
                isVisible,
            };
        });

        if (seriesMapper) {
            return seriesMapper(seriesWithVisibility);
        }

        return seriesWithVisibility;
    };

    public renderPopUpLegend = (legendDetails: any): React.ReactNode => {
        return (
            <PopUpLegend
                series={this.getSeries()}
                legendDetails={legendDetails}
                onLegendItemClick={this.onItemClick}
            />
        );
    };

    public renderFluid = (): React.ReactNode => {
        const { enableBorderRadius } = this.props;

        return (
            <Measure client={true}>
                {({ measureRef, contentRect }: any) => {
                    const usedWidth =
                        contentRect.client && contentRect.client.width
                            ? Math.floor(contentRect.client.width)
                            : 0;
                    return (
                        <div className="viz-fluid-legend-wrap" ref={measureRef}>
                            <FluidLegend
                                series={this.getSeries()}
                                enableBorderRadius={enableBorderRadius}
                                onItemClick={this.onItemClick}
                                containerWidth={usedWidth}
                            />
                        </div>
                    );
                }}
            </Measure>
        );
    };

    public renderStatic = (): React.ReactNode => {
        const { position, height, enableBorderRadius } = this.props;

        const classNames = cx("viz-static-legend-wrap", `position-${position}`);

        const props: IStaticLegendProps = {
            containerHeight: 0,
            series: this.getSeries(),
            onItemClick: this.onItemClick,
            position,
            enableBorderRadius,
        };

        return (
            <Measure client={true}>
                {({ measureRef, contentRect }: any) => {
                    const measuredHeight =
                        contentRect.client && contentRect.client.height
                            ? Math.floor(contentRect.client.height)
                            : 0;
                    const usedHeight = height || measuredHeight;

                    if (!isEmpty(contentRect.client)) {
                        this.props.validateOverHeight(contentRect.client);
                    }

                    return (
                        <div className={classNames} ref={measureRef}>
                            <StaticLegend {...props} containerHeight={usedHeight} />
                        </div>
                    );
                }}
            </Measure>
        );
    };

    public render(): React.ReactNode {
        // const { responsive, showFluidLegend, heatmapLegend, legendDetails } = this.props;
        const { heatmapLegend, legendDetails } = this.props;

        if (!legendDetails) {
            return null;
        }

        // const isFluidLegend = Boolean(responsive && showFluidLegend);

        if (heatmapLegend) {
            return this.renderHeatmapLegend(legendDetails);
        }

        /*
        if (isFluidLegend) {
            return this.renderFluid();
        }

        return this.renderStatic();*/

        return this.renderPopUpLegend(legendDetails);
    }

    private getHeatmapLegendPosition(legendDetails: any) {
        const { locale, format, responsive, position } = this.props;
        const { showFluidLegend } = this.props;
        // if (responsive === "popup") {
        if (true) {
            return legendDetails?.position;
        } else {
            const isSmall = Boolean(responsive && showFluidLegend);
            if (isSmall) {
                return position === TOP ? TOP : BOTTOM;
            } else {
                return position || RIGHT;
            }
        }
    }

    private renderHeatmapLegend = (legendDetails: any): React.ReactNode => {
        const { locale, format, responsive, position } = this.props;
        const { showFluidLegend } = this.props;
        const series = this.getSeries();
        // TODO: isSmall also for new popup cases, legend sometimes overflows
        const isSmall = Boolean(responsive && showFluidLegend);
        let finalPosition = this.getHeatmapLegendPosition(legendDetails);
        const title = "legend with very large long text name which should be shortened";

        return (
            <IntlWrapper locale={locale}>
                <IntlTranslationsProvider>
                    {(props: ITranslationsComponentProps) => (
                        <HeatmapLegend
                            title={title}
                            series={series}
                            format={format}
                            isSmall={isSmall}
                            numericSymbols={props.numericSymbols}
                            position={finalPosition}
                        />
                    )}
                </IntlTranslationsProvider>
            </IntlWrapper>
        );
    };
}
