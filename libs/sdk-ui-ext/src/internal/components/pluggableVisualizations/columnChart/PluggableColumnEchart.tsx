// (C) 2019-2022 GoodData Corporation
import isEmpty from "lodash/isEmpty";
import { VisualizationTypes, BucketNames } from "@gooddata/sdk-ui";
import { newAttributeSort } from "@gooddata/sdk-model";
import { AXIS, AXIS_NAME } from "../../../constants/axis";
import { COLUMN_CHART_SUPPORTED_PROPERTIES } from "../../../constants/supportedProperties";
import { IVisConstruct, IReferencePoint } from "../../../interfaces/Visualization";
import { getBucketItems } from "../../../utils/bucketHelper";
import { canSortStackTotalValue } from "../barChart/sortHelpers";
import { ISortConfig, newAvailableSortsGroup } from "../../../interfaces/SortConfig";
import { getCustomSortDisabledExplanation } from "../../../utils/sort";
import { PluggableBaseChart } from "../baseChart/PluggableBaseChart";
import * as echarts from "echarts";

/**
 * PluggableColumnChart
 *
 * ## Buckets
 *
 * | Name     | Id       | Accepts             |
 * |----------|----------|---------------------|
 * | Measures | measures | measures only       |
 * | ViewBy   | view     | attributes or dates |
 * | StackBy  | stack    | attributes or dates |
 *
 * ### Bucket axioms
 *
 * - |Measures| ≥ 1
 * - |ViewBy| ≤ 2
 * - |StackBy| ≤ 1
 * - |StackBy| = 1 ⇒ |Measures| ≤ 1
 * - |StackBy| = 0 ⇒ |Measures| ≤ 20
 * - |Measures| ≥ 2 ⇒ |StackBy| = 0
 * - ∀ a, b ∈ ViewBy (isDate(a) ∧ isDate(b) ⇒ dateDataset(a) = dateDataset(b))
 *
 * ## Dimensions
 *
 * The PluggableColumnChart always creates two dimensional execution.
 *
 * - |StackBy| != 0 ⇒ [[StackBy[0]], [...ViewBy, MeasureGroupIdentifier]]
 * - |StackBy| = 0 ⇒ [[MeasureGroupIdentifier], [...ViewBy]]
 *
 * ##  Sorts
 *
 * The PluggableColumnChart does not use any sorts.
 *
 * If "enableChartsSorting" is enabled, the sorts can be changed by the user.
 */
export class PluggableColumnEchart extends PluggableBaseChart {
    constructor(props: IVisConstruct) {
        super(props);
        this.secondaryAxis = AXIS_NAME.SECONDARY_Y;
        this.type = VisualizationTypes.COLUMN;
        this.defaultControlsProperties = {
            stackMeasures: false,
        };

        this.initializeProperties(props.visualizationProperties);
    }

    public getSupportedPropertiesList(): string[] {
        return COLUMN_CHART_SUPPORTED_PROPERTIES[this.axis || AXIS.DUAL] || [];
    }

    private renderTooltipHTML(textData: string[][], maxTooltipContentWidth: number = 300): string {
        const maxItemWidth = maxTooltipContentWidth - 20;
        const titleStyle = `style="max-width: ${maxItemWidth}px;"`;
        const valueStyle = `style="max-width: ${maxItemWidth}px;"`;
        const itemClass = "gd-viz-tooltip-item";
        const valueClass = "gd-viz-tooltip-value";

        return textData
            .map((item: string[]) => {
                // the third span is hidden, that help to have tooltip work with max-width
                return `<div class="${itemClass}">
                            <span class="gd-viz-tooltip-title" ${titleStyle}>${item[0]}</span>
                            <div class="gd-viz-tooltip-value-wraper" ${titleStyle}>
                                <span class="${valueClass}" ${valueStyle}>${item[1]}</span>
                            </div>
                            <div class="gd-viz-tooltip-value-wraper" ${titleStyle}>
                                <span class="gd-viz-tooltip-value-max-content" ${valueStyle}>${item[1]}</span>
                            </div>
                        </div>`;
            })
            .join("\n");
    }

    protected renderVisualization(options: any, insight: any, executionFactory: any): void {
        const palette = (index: number) => {
            const firstInPalette = options?.config?.colorPalette?.[index]?.fill;
            return `rgb(${firstInPalette.r},${firstInPalette.g},${firstInPalette.b})`;
        };

        const chartDom = this.getElement();
        const myChart = echarts.init(chartDom);
        const option: echarts.EChartsOption = {
            legend: {
                orient: "vertical",
                right: 10,
                top: "center",
            },
            animation: false,
            xAxis: {
                data: [],
                axisTick: {
                    show: false,
                },
                show: true,
                axisLabel: {
                    fontFamily: "avenir",
                },
            },
            yAxis: {
                type: "value",
                axisLabel: {
                    fontFamily: "avenir",
                },
            },
            series: [],
            tooltip: {
                trigger: "item",
                formatter: (params: any) => {
                    const { name, value } = params;
                    return this.renderTooltipHTML([
                        ["X axis name", name],
                        ["Y axis name", value.toFixed(0)],
                    ]);
                },
            },
        };

        const execution = this.getExecution(options, insight, executionFactory);
        execution.execute().then((r) => {
            r.readAll().then((dv) => {
                console.log("dataview", dv);
                // @ts-ignore
                option.xAxis.data = dv?.headerItems?.[1]?.[0]?.map((elem) => elem?.attributeHeaderItem?.name);
                // @ts-ignore
                if (!option.xAxis.data?.[0]) {
                    // @ts-ignore
                    option.xAxis.show = false;
                }

                option.series = dv?.data
                    // @ts-ignore
                    .map(
                        // @ts-ignore
                        (data, index): echarts.BarSeriesOption => ({
                            data: data,
                            type: "bar",
                            stack: "x",
                            label: {
                                show: true,
                                fontFamily: "avenir",
                                color: "#fff",
                                textBorderWidth: 1,
                                textBorderColor: "#000",
                                fontSize: 11,
                                fontWeight: "bold",
                            },
                            itemStyle: {
                                color: palette(index),
                            },
                        }),
                    )
                    .reverse();

                myChart.clear();
                // @ts-ignore
                option.series[0].name = dv?.headerItems?.[0]?.[0]?.[0]?.measureHeaderItem?.name;
                myChart.setOption(option);
            });
        });
    }

    protected getDefaultAndAvailableSort(
        referencePoint: IReferencePoint,
        canSortStackTotalValue: boolean,
    ): {
        defaultSort: ISortConfig["defaultSort"];
        availableSorts: ISortConfig["availableSorts"];
    } {
        if (this.isSortDisabled(referencePoint).disabled) {
            return {
                defaultSort: [],
                availableSorts: [],
            };
        }
        const { buckets } = referencePoint;
        const viewBy = getBucketItems(buckets, BucketNames.VIEW);
        const stackBy = getBucketItems(buckets, BucketNames.STACK);
        const measures = getBucketItems(buckets, BucketNames.MEASURES);
        const defaultSort = viewBy.map((vb) => newAttributeSort(vb.localIdentifier, "asc"));
        const isStacked = !isEmpty(stackBy) || canSortStackTotalValue;

        if (viewBy.length === 2) {
            if (measures.length >= 2 && !canSortStackTotalValue) {
                return {
                    defaultSort,
                    availableSorts: [
                        newAvailableSortsGroup(viewBy[0].localIdentifier),
                        newAvailableSortsGroup(
                            viewBy[1].localIdentifier,
                            measures.map((m) => m.localIdentifier),
                        ),
                    ],
                };
            }

            return {
                defaultSort,
                availableSorts: [
                    newAvailableSortsGroup(viewBy[0].localIdentifier),
                    newAvailableSortsGroup(
                        viewBy[1].localIdentifier,
                        isEmpty(stackBy) ? measures.map((m) => m.localIdentifier) : [],
                        true,
                        isStacked || measures.length > 1,
                    ),
                ],
            };
        }

        if (!isEmpty(viewBy) && isStacked) {
            return {
                defaultSort,
                availableSorts: [
                    newAvailableSortsGroup(
                        viewBy[0].localIdentifier,
                        isEmpty(stackBy) ? measures.map((m) => m.localIdentifier) : [],
                    ),
                ],
            };
        }

        if (!isEmpty(viewBy) && !isEmpty(measures)) {
            return {
                defaultSort,
                availableSorts: [
                    newAvailableSortsGroup(
                        viewBy[0].localIdentifier,
                        measures.map((m) => m.localIdentifier),
                        true,
                        measures.length > 1,
                    ),
                ],
            };
        }

        return {
            defaultSort: [],
            availableSorts: [],
        };
    }

    private isSortDisabled(referencePoint: IReferencePoint) {
        const { buckets } = referencePoint;
        const measures = getBucketItems(buckets, BucketNames.MEASURES);
        const viewBy = getBucketItems(buckets, BucketNames.VIEW);
        const disabled = viewBy.length < 1 || measures.length < 1;
        const disabledExplanation = getCustomSortDisabledExplanation(measures, viewBy, this.intl);
        return {
            disabled,
            disabledExplanation,
        };
    }

    public getSortConfig(referencePoint: IReferencePoint): Promise<ISortConfig> {
        const { buckets, properties, availableSorts: previousAvailableSorts } = referencePoint;
        const { defaultSort, availableSorts } = this.getDefaultAndAvailableSort(
            referencePoint,
            canSortStackTotalValue(buckets, properties),
        );

        const { disabled, disabledExplanation } = this.isSortDisabled(referencePoint);

        return Promise.resolve({
            supported: true,
            disabled,
            appliedSort: super.reuseCurrentSort(
                previousAvailableSorts,
                properties,
                availableSorts,
                defaultSort,
            ),
            defaultSort,
            availableSorts,
            ...(disabledExplanation && { disabledExplanation }),
        });
    }
}
