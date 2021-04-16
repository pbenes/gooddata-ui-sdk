// (C) 2007-2018 GoodData Corporation
import React from "react";
import Measure from "react-measure";
import cloneDeep from "lodash/cloneDeep";
import get from "lodash/get";
import set from "lodash/set";
import isEqual from "lodash/isEqual";
import noop from "lodash/noop";
import partial from "lodash/partial";
import throttle from "lodash/throttle";
import isNil from "lodash/isNil";
import cx from "classnames";
import { IChartConfig, OnLegendReady } from "../../interfaces";
import { Chart, IChartProps } from "./Chart";
import { isPieOrDonutChart, isOneOfTypes, isHeatmap } from "../chartTypes/_util/common";
import { VisualizationTypes } from "@gooddata/sdk-ui";
import Highcharts from "../lib";
import { alignChart } from "../chartTypes/_chartCreators/helpers";
import { ILegendProps, Legend, ILegendOptions } from "@gooddata/sdk-ui-vis-commons";
import { Bubble, BubbleHoverTrigger, Icon } from "@gooddata/sdk-ui-kit";
import { BOTTOM, LEFT, RIGHT, TOP } from "../typings/mess";
import { ITheme } from "@gooddata/sdk-backend-spi";

/**
 * @internal
 */
export const FLUID_LEGEND_THRESHOLD = 768;

export interface IChartHTMLElement extends HTMLElement {
    getChart(): Highcharts.Chart;
    getHighchartRef(): HTMLElement;
}

/**
 * @internal
 */
export interface IHighChartsRendererProps {
    chartOptions: any;
    hcOptions: any;
    documentObj?: Document;
    height: number;
    width: number;
    legend: ILegendOptions;
    locale: string;
    theme?: ITheme;
    onLegendReady: OnLegendReady;
    legendRenderer(legendProps: ILegendProps): any;
    chartRenderer(chartProps: IChartProps): any;
    afterRender(): void;
}

export interface IHighChartsRendererState {
    legendItemsEnabled: boolean[];
    showFluidLegend: boolean;
}

export function renderChart(props: IChartProps): JSX.Element {
    return <Chart {...props} />;
}

export function renderLegend(props: ILegendProps): JSX.Element {
    return <Legend {...props} />;
}

function updateAxisTitleStyle(axis: Highcharts.AxisOptions) {
    set(axis, "title.style", {
        ...get(axis, "title.style", {}),
        textOverflow: "ellipsis",
        overflow: "hidden",
    });
}

export class HighChartsRenderer extends React.PureComponent<
    IHighChartsRendererProps,
    IHighChartsRendererState
> {
    public static defaultProps = {
        afterRender: noop,
        height: null as number,
        legend: {
            enabled: true,
            responsive: false,
            position: RIGHT,
        },
        chartRenderer: renderChart,
        legendRenderer: renderLegend,
        onLegendReady: noop,
        documentObj: document,
    };

    private highchartsRendererRef = React.createRef<HTMLDivElement>(); // whole component = legend + chart
    private chartRef: IChartHTMLElement;

    constructor(props: IHighChartsRendererProps) {
        super(props);

        this.state = {
            legendItemsEnabled: [],
            showFluidLegend: this.shouldShowFluid(),
        };
    }

    public onWindowResize = (): void => {
        this.setState({
            showFluidLegend: this.shouldShowFluid(),
        });

        this.realignPieOrDonutChart();
    };

    private throttledOnWindowResize = throttle(this.onWindowResize, 100);

    public shouldShowFluid(): boolean {
        const { documentObj } = this.props;
        return documentObj.documentElement.clientWidth < FLUID_LEGEND_THRESHOLD;
    }

    public UNSAFE_componentWillMount(): void {
        this.resetLegendState(this.props);
    }

    public componentDidMount(): void {
        // http://stackoverflow.com/questions/18240254/highcharts-width-exceeds-container-div-on-first-load
        setTimeout(() => {
            if (this.chartRef) {
                const chart = this.chartRef.getChart();

                if (chart.container && chart.container.style) {
                    chart.container.style.height = (this.props.height && String(this.props.height)) || "100%";
                    chart.container.style.position = this.props.height ? "relative" : "absolute";
                    chart.reflow();
                }
            }
        }, 0);

        this.props.onLegendReady({
            legendItems: this.getItems(this.props.legend.items),
        });

        window.addEventListener("resize", this.throttledOnWindowResize);
    }

    public componentWillUnmount(): void {
        this.throttledOnWindowResize.cancel();
        window.removeEventListener("resize", this.throttledOnWindowResize);
    }

    public UNSAFE_componentWillReceiveProps(nextProps: IHighChartsRendererProps): void {
        const thisLegendItems = get(this.props, "legend.items", []);
        const nextLegendItems = get(nextProps, "legend.items", []);
        const hasLegendChanged = !isEqual(thisLegendItems, nextLegendItems);
        if (hasLegendChanged) {
            this.resetLegendState(nextProps);
        }

        if (!isEqual(this.props.legend.items, nextProps.legend.items)) {
            this.props.onLegendReady({
                legendItems: this.getItems(nextProps.legend.items),
            });
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public onLegendItemClick = (item: any): void => {
        this.setState({
            legendItemsEnabled: set<boolean[]>(
                [...this.state.legendItemsEnabled],
                item.legendIndex,
                !this.state.legendItemsEnabled[item.legendIndex],
            ),
        });
    };

    public setChartRef = (chartRef: IChartHTMLElement): void => {
        this.chartRef = chartRef;
    };

    public getLegendPosition(legendDetails: any | null) {
        if (true) {
            return legendDetails?.position;
        }

        return this.props.legend.position;
    }

    public getFlexDirection(legendDetails: any): React.CSSProperties["flexDirection"] {
        const position = this.getLegendPosition(legendDetails);
        if (position === TOP || position === BOTTOM) {
            return "column";
        }

        return "row";
    }

    public getItems(items: any[]): any[] {
        return items.map((i) => {
            return {
                name: i.name,
                color: i.color,
                onClick: partial(this.onLegendItemClick, i),
            };
        });
    }

    public resetLegendState(props: IHighChartsRendererProps): void {
        const legendItemsCount = get(props, "legend.items.length", 0);
        this.setState({
            legendItemsEnabled: new Array(legendItemsCount).fill(true),
        });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    private onChartSelection = (event: any): void => {
        const chartWrapper = event.target.renderTo.parentElement;
        const resetZoomButton = chartWrapper.closest(".visualization").querySelector(".viz-zoom-out");
        if (event.resetSelection) {
            resetZoomButton.style.display = "none";
        } else {
            resetZoomButton.style.display = "block";
        }
    };

    public createChartConfig(chartConfig: IChartConfig, legendItemsEnabled: any[]): IChartConfig {
        const config: any = cloneDeep(chartConfig);
        const { yAxis } = config;

        yAxis.forEach((axis: Highcharts.AxisOptions) => updateAxisTitleStyle(axis));

        if (chartConfig.chart.zoomType) {
            config.chart.events = {
                ...config.chart.events,
                selection: this.onChartSelection,
            };
        }
        // render chart with disabled visibility based on legendItemsEnabled
        const firstSeriesTypes = [
            VisualizationTypes.PIE,
            VisualizationTypes.DONUT,
            VisualizationTypes.TREEMAP,
        ];
        const itemsPath = isOneOfTypes(config.chart.type, firstSeriesTypes) ? "series[0].data" : "series";
        const items: any[] = get(config, itemsPath) as any[];
        set(
            config,
            itemsPath,
            items.map((item: any, itemIndex: any) => {
                const visible =
                    legendItemsEnabled[itemIndex] !== undefined ? legendItemsEnabled[itemIndex] : true;
                return {
                    ...item,
                    visible: isNil(item.visible) ? visible : item.visible,
                };
            }),
        );

        return config;
    }

    public getLegendDetails(contentRect: any, legendProps: any, chartOptions: any) {
        const { width, height } = contentRect?.client;

        if (!width || !height) {
            return null;
        }

        const name = chartOptions?.legendName ? { name: chartOptions?.legendName } : {};

        if (width < 630) {
            //            // latest update: never without legend
            //            if (height < 280) {
            //                return { ...name, type: "no-legend" };
            //            } else {
            return { ...name, position: TOP, type: "top, 1row", renderPopUp: true };
            //            }
        } else {
            // width >= 630
            const isLegendTopBottom = legendProps.position === "top" || legendProps.position === "bottom";

            if (height < 280) {
                return { ...name, position: RIGHT, type: "right, paging", renderPopUp: false };
            } else if (height < 360) {
                return {
                    ...name,
                    position: legendProps.position,
                    renderPopUp: isLegendTopBottom,
                    maxRows: 1,
                    type: "user, max 1 row for top/bottom",
                };
            } else {
                return {
                    ...name,
                    position: legendProps.position,
                    renderPopUp: isLegendTopBottom,
                    maxRows: 2,
                    type: "user, max 2 rows for top/bottom",
                };
            }
        }
    }

    public renderLegend(legendDetails: any): React.ReactNode {
        const { chartOptions, legend, height, legendRenderer, locale } = this.props;
        const { items, format } = legend;
        const { showFluidLegend } = this.state;

        if (!legend.enabled) {
            return null;
        }

        let { type } = chartOptions;
        if (isPieOrDonutChart(type)) {
            type = VisualizationTypes.PIE;
        }

        let pos = legend.position;
        // TODO: responsive === "popup"
        if (true) {
            pos = legendDetails?.position;
        }

        console.log("rendering position", pos);
        const legendProps: ILegendProps = {
            position: pos,
            responsive: legend.responsive,
            enableBorderRadius: legend.enableBorderRadius,
            seriesMapper: legend.seriesMapper,
            series: items,
            onItemClick: this.onLegendItemClick,
            legendItemsEnabled: this.state.legendItemsEnabled,
            heatmapLegend: isHeatmap(type),
            height,
            legendDetails,
            format,
            locale,
            showFluidLegend,
            validateOverHeight: () => {},
        };

        return legendRenderer(legendProps);
    }

    public renderHighcharts(): React.ReactNode {
        // shrink chart to give space to legend items
        const style = { flex: "1 1 auto", position: "relative", overflow: "hidden" };
        const chartProps = {
            domProps: { className: "viz-react-highchart-wrap gd-viz-highchart-wrap", style },
            ref: this.setChartRef,
            config: this.createChartConfig(this.props.hcOptions, this.state.legendItemsEnabled),
            callback: this.props.afterRender,
        };
        return this.props.chartRenderer(chartProps);
    }

    private onZoomOutButtonClick = (): void => {
        this.chartRef.getChart().zoomOut();
    };

    private renderZoomOutButton() {
        const {
            hcOptions: { chart },
            theme,
        } = this.props;
        if (chart && chart.zoomType) {
            return (
                <BubbleHoverTrigger
                    tagName="abbr"
                    hideDelay={100}
                    showDelay={100}
                    className="gd-bubble-trigger-zoom-out"
                >
                    <button
                        className="viz-zoom-out s-zoom-out"
                        onClick={this.onZoomOutButtonClick}
                        style={{ display: "none" }}
                    >
                        <Icon.Undo color={theme?.palette?.complementary?.c7} />
                    </button>
                    <Bubble alignPoints={[{ align: "cr cl" }, { align: "cl cr" }]}>
                        {chart.resetZoomButton?.tooltip}
                    </Bubble>
                </BubbleHoverTrigger>
            );
        }
        return null;
    }

    private renderVisualization(legendDetails: any) {
        if (!legendDetails) {
            return null;
        }

        const { legend } = this.props;
        const { showFluidLegend } = this.state;

        const classes = cx(
            "viz-line-family-chart-wrap",
            "s-viz-line-family-chart-wrap",
            legend.responsive ? "responsive-legend" : "non-responsive-legend",
            {
                [`flex-direction-${this.getFlexDirection(legendDetails)}`]: true,
                "legend-position-bottom": this.isBottomLegend(legendDetails),
            },
        );

        // TODO: bind on param
        // if (legend.responsive === "popup") {
        let pos = this.getLegendPosition(legendDetails);

        const isLegendRenderedFirst: boolean = pos === TOP || pos === LEFT || showFluidLegend;

        return (
            <div className={classes}>
                <div className={classes} ref={this.highchartsRendererRef}>
                    {this.renderZoomOutButton()}
                    {isLegendRenderedFirst && this.renderLegend(legendDetails)}
                    {this.renderHighcharts()}
                    {!isLegendRenderedFirst && this.renderLegend(legendDetails)}
                </div>
            </div>
        );
    }

    public render(): React.ReactNode {
        const { legend, chartOptions } = this.props;

        return (
            <Measure client={true}>
                {({ measureRef, contentRect }: any) => {
                    const legendDetails = this.getLegendDetails(contentRect, legend, chartOptions);
                    return (
                        <div
                            className="visualization-container-measure-wrap"
                            style={{ width: "100%", height: "100%" }}
                            ref={measureRef}
                        >
                            {this.renderVisualization(legendDetails)}
                        </div>
                    );
                }}
            </Measure>
        );
    }

    private realignPieOrDonutChart() {
        const {
            chartOptions: { type },
        } = this.props;
        const { chartRef } = this;

        if (isPieOrDonutChart(type) && chartRef) {
            alignChart(chartRef.getChart());
        }
    }

    private isBottomLegend(legendDetails: any): boolean {
        const pos = this.getLegendPosition(legendDetails);
        return pos === BOTTOM;
    }
}
