// (C) 2019 GoodData Corporation
import noop from "lodash/noop";
import get from "lodash/get";
import * as referencePointMocks from "../../../tests/mocks/referencePointMocks";
import {
    IBucketOfFun,
    IFilters,
    IVisProps,
    IVisConstruct,
    IDrillDownContext,
} from "../../../interfaces/Visualization";
import { MAX_VIEW_COUNT } from "../../../constants/uiConfig";
import * as uiConfigMocks from "../../../tests/mocks/uiConfigMocks";
import * as testMocks from "../../../tests/mocks/testMocks";
import {
    COLUMN_CHART_SUPPORTED_PROPERTIES,
    OPTIONAL_STACKING_PROPERTIES,
} from "../../../constants/supportedProperties";
import { AXIS } from "../../../constants/axis";
import { PluggableColumnChart } from "../columnChart/PluggableColumnChart";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { insightSetProperties, IInsight } from "@gooddata/sdk-model";
import { modifyInsightForDrillDown } from "./modifyInsightForDrillDownMock";

describe("PluggableColumnBarCharts", () => {
    const defaultProps: IVisConstruct = {
        projectId: "PROJECTID",
        element: "body",
        configPanelElement: null as string,
        callbacks: {
            afterRender: noop,
            pushData: noop,
        },
        backend: dummyBackend(),
        visualizationProperties: {},
        renderFun: noop,
    };

    function createComponent(props = defaultProps) {
        return new PluggableColumnChart(props);
    }

    const executionFactory = dummyBackend({ hostname: "test", raiseNoDataExceptions: true })
        .workspace("PROJECTID")
        .execution();

    describe("optional stacking", () => {
        const options: IVisProps = {
            dimensions: { height: null },
            locale: "en-US",
            custom: {
                stickyHeaderOffset: 3,
            },
        };
        const emptyPropertiesMeta = {};

        it("should place third attribute to stack bucket", async () => {
            const columnChart = createComponent(defaultProps);
            const mockRefPoint = referencePointMocks.oneMetricAndManyCategoriesReferencePoint;
            const expectedBuckets: IBucketOfFun[] = [
                {
                    localIdentifier: "measures",
                    items: mockRefPoint.buckets[0].items,
                },
                {
                    localIdentifier: "view",
                    items: mockRefPoint.buckets[1].items.slice(0, MAX_VIEW_COUNT),
                },
                {
                    localIdentifier: "stack",
                    items: mockRefPoint.buckets[1].items.slice(MAX_VIEW_COUNT, MAX_VIEW_COUNT + 1),
                },
            ];
            const expectedFilters: IFilters = {
                localIdentifier: "filters",
                items: mockRefPoint.filters.items.slice(0, MAX_VIEW_COUNT + 1),
            };
            const extendedReferencePoint = await columnChart.getExtendedReferencePoint(mockRefPoint);

            expect(extendedReferencePoint).toEqual({
                buckets: expectedBuckets,
                filters: expectedFilters,
                properties: {},
                uiConfig: uiConfigMocks.oneMetricAndOneStackColumnUiConfig,
            });
        });

        it("should reuse one measure, two categories and one category as stack", async () => {
            const columnChart = createComponent(defaultProps);
            const mockRefPoint = referencePointMocks.oneMetricAndManyCategoriesAndOneStackRefPoint;
            const expectedBuckets: IBucketOfFun[] = [
                {
                    localIdentifier: "measures",
                    items: mockRefPoint.buckets[0].items,
                },
                {
                    localIdentifier: "view",
                    items: mockRefPoint.buckets[1].items.slice(0, MAX_VIEW_COUNT),
                },
                {
                    localIdentifier: "stack",
                    items: mockRefPoint.buckets[2].items,
                },
            ];
            const expectedFilters: IFilters = {
                localIdentifier: "filters",
                items: mockRefPoint.filters.items,
            };
            const extendedReferencePoint = await columnChart.getExtendedReferencePoint(mockRefPoint);

            expect(extendedReferencePoint).toEqual({
                buckets: expectedBuckets,
                filters: expectedFilters,
                properties: {},
                uiConfig: uiConfigMocks.oneMetricAndOneStackColumnUiConfig,
            });
        });

        it("should reuse all measures, two categories and no stack", async () => {
            const columnChart = createComponent(defaultProps);
            const mockRefPoint = referencePointMocks.multipleMetricsAndCategoriesReferencePoint;
            const expectedBuckets: IBucketOfFun[] = [
                {
                    localIdentifier: "measures",
                    items: mockRefPoint.buckets[0].items,
                },
                {
                    localIdentifier: "view",
                    items: mockRefPoint.buckets[1].items.slice(0, MAX_VIEW_COUNT),
                },
                {
                    localIdentifier: "stack",
                    items: [],
                },
            ];
            const expectedFilters: IFilters = {
                localIdentifier: "filters",
                items: mockRefPoint.filters.items.slice(0, MAX_VIEW_COUNT),
            };
            const expectedProperties = {
                controls: {
                    secondary_yaxis: {
                        measures: ["m3", "m4"],
                    },
                },
            };
            const extendedReferencePoint = await columnChart.getExtendedReferencePoint(mockRefPoint);

            expect(extendedReferencePoint).toEqual({
                buckets: expectedBuckets,
                filters: expectedFilters,
                uiConfig: {
                    ...uiConfigMocks.multipleMetricsAndCategoriesColumnUiConfig,
                    axis: "dual",
                },
                properties: expectedProperties,
            });
        });

        it("should return reference point without Date in stacks", async () => {
            const columnChart = createComponent(defaultProps);
            const mockRefPoint = referencePointMocks.dateAsFirstCategoryReferencePoint;
            const expectedBuckets: IBucketOfFun[] = [
                {
                    localIdentifier: "measures",
                    items: mockRefPoint.buckets[0].items,
                },
                {
                    localIdentifier: "view",
                    items: mockRefPoint.buckets[1].items.slice(0, MAX_VIEW_COUNT),
                },
                {
                    localIdentifier: "stack",
                    items: [],
                },
            ];
            const expectedFilters: IFilters = {
                localIdentifier: "filters",
                items: [],
            };
            const extendedReferencePoint = await columnChart.getExtendedReferencePoint(mockRefPoint);

            expect(extendedReferencePoint).toEqual({
                buckets: expectedBuckets,
                filters: expectedFilters,
                properties: {},
                uiConfig: uiConfigMocks.oneMetricAndManyCategoriesColumnUiConfig,
            });
        });

        it("should keep only one date attribute in view by bucket", async () => {
            const columnChart = createComponent(defaultProps);
            const mockRefPoint = referencePointMocks.dateAttributeOnRowAndColumnReferencePoint;
            const expectedBuckets: IBucketOfFun[] = [
                {
                    localIdentifier: "measures",
                    items: mockRefPoint.buckets[0].items,
                },
                {
                    localIdentifier: "view",
                    items: mockRefPoint.buckets[1].items.slice(0, 1),
                },
                {
                    localIdentifier: "stack",
                    items: [],
                },
            ];
            const extendedReferencePoint = await columnChart.getExtendedReferencePoint(mockRefPoint);

            expect(extendedReferencePoint.buckets).toEqual(expectedBuckets);
        });

        it("should cut out measures tail when getting many measures, no category and one stack", async () => {
            const columnChart = createComponent(defaultProps);
            const mockRefPoint = referencePointMocks.multipleMetricsOneStackByReferencePoint;
            const expectedBuckets: IBucketOfFun[] = [
                {
                    localIdentifier: "measures",
                    items: mockRefPoint.buckets[0].items.slice(0, 1),
                },
                {
                    localIdentifier: "view",
                    items: [],
                },
                {
                    localIdentifier: "stack",
                    items: mockRefPoint.buckets[2].items,
                },
            ];
            const expectedFilters: IFilters = {
                localIdentifier: "filters",
                items: [],
            };
            const extendedReferencePoint = await columnChart.getExtendedReferencePoint(mockRefPoint);

            expect(extendedReferencePoint).toEqual({
                buckets: expectedBuckets,
                filters: expectedFilters,
                uiConfig: uiConfigMocks.oneStackAndNoCategoryColumnUiConfig,
                properties: {},
            });
        });

        it("should update supported properties list base on axis type", async () => {
            const mockProps = {
                ...defaultProps,
                pushData: jest.fn(),
            };
            const chart = createComponent(mockProps);

            await chart.getExtendedReferencePoint(
                referencePointMocks.oneMetricAndCategoryAndStackReferencePoint,
            );
            expect(get(chart, "supportedPropertiesList")).toEqual(
                COLUMN_CHART_SUPPORTED_PROPERTIES[AXIS.PRIMARY].filter(
                    (props: string) => props !== OPTIONAL_STACKING_PROPERTIES[0],
                ),
            );

            await chart.getExtendedReferencePoint(
                referencePointMocks.measuresOnSecondaryAxisAndAttributeReferencePoint,
            );
            expect(get(chart, "supportedPropertiesList")).toEqual(
                COLUMN_CHART_SUPPORTED_PROPERTIES[AXIS.SECONDARY],
            );

            await chart.getExtendedReferencePoint(
                referencePointMocks.multipleMetricsAndCategoriesReferencePoint,
            );
            expect(get(chart, "supportedPropertiesList")).toEqual(
                COLUMN_CHART_SUPPORTED_PROPERTIES[AXIS.DUAL],
            );
        });

        it("should disable open as report for insight have two view items", () => {
            const visualization = createComponent(defaultProps);
            visualization.update(
                options,
                testMocks.insightWithSingleMeasureAndTwoViewBy,
                emptyPropertiesMeta,
                executionFactory,
            );
            const isOpenAsReportSupported = visualization.isOpenAsReportSupported();
            expect(isOpenAsReportSupported).toBe(false);
        });

        it("should disable open as report for insight have properties stackMeasures ", () => {
            const visualization = createComponent(defaultProps);

            // stackMeasures property
            const visualizationProperties = {
                controls: {
                    stackMeasures: true,
                },
            };
            const testInsight = insightSetProperties(
                testMocks.insightWithTwoMeasuresAndViewBy,
                visualizationProperties,
            );

            visualization.update(options, testInsight, emptyPropertiesMeta, executionFactory);
            const isOpenAsReportSupported = visualization.isOpenAsReportSupported();
            expect(isOpenAsReportSupported).toBe(false);
        });

        it("should disable open as report for insight have properties stackMeasuresToPercent", () => {
            const visualization = createComponent(defaultProps);

            // stackMeasuresToPercent property
            const visualizationProperties = {
                controls: {
                    stackMeasuresToPercent: true,
                },
            };
            const testInsight = insightSetProperties(
                testMocks.insightWithTwoMeasuresAndViewBy,
                visualizationProperties,
            );

            visualization.update(options, testInsight, emptyPropertiesMeta, executionFactory);
            const isOpenAsReportSupported = visualization.isOpenAsReportSupported();
            expect(isOpenAsReportSupported).toBe(false);
        });

        it("should enable open as report for normal column chart", () => {
            const visualization = createComponent(defaultProps);

            visualization.update(
                options,
                testMocks.insightWithTwoMeasuresAndViewBy,
                emptyPropertiesMeta,
                executionFactory,
            );
            const isOpenAsReportSupported = visualization.isOpenAsReportSupported();
            expect(isOpenAsReportSupported).toBe(true);
        });

        it("should retain stacking config after adding new measure", async () => {
            const columnChart = createComponent(defaultProps);

            // step1: init column chart with 1M, 1VB, 1SB with 'Stack to 100%' enabled
            const initialState =
                referencePointMocks.oneMeasuresOneCategoryOneStackItemWithStackMeasuresToPercent;
            let extendedReferencePoint = await columnChart.getExtendedReferencePoint(initialState);
            // 'Stack to 100%' checkbox is checked
            expect(extendedReferencePoint.properties.controls).toEqual({
                stackMeasuresToPercent: true,
            });

            // step2: remove StackBy item
            const stateWithStackByItemRemoved =
                referencePointMocks.oneMeasuresOneCategoryWithStackMeasuresToPercent;
            extendedReferencePoint = await columnChart.getExtendedReferencePoint(stateWithStackByItemRemoved);
            // 'Stack to 100%' and 'Stack Measures' checkboxes are hidden
            expect(extendedReferencePoint.properties.controls).toBeFalsy();

            // step3: add one more measure
            const stateWithNewMeasureAdded =
                referencePointMocks.twoMeasuresOneCategoryWithStackMeasuresToPercent;
            extendedReferencePoint = await columnChart.getExtendedReferencePoint(stateWithNewMeasureAdded);
            // column chart should be stacked in percent with 'Stack to 100%' and 'Stack Measures' checkboxes are checked
            expect(extendedReferencePoint.properties.controls).toEqual({
                stackMeasures: true,
                stackMeasuresToPercent: true,
            });
        });
    });

    describe("Drill Down", () => {
        it.only("should replace the drill down attribute and add intersection filters", () => {
            const barChart = createComponent(defaultProps);

            const context: IDrillDownContext = {
                drillDefinition: {
                    implicitDrillDown: {
                        from: {
                            drillFromAttribute: {
                                localIdentifier: "998da372d62a4584b145cd026423fe24",
                            },
                        },
                        target: {
                            drillToAttribute: {
                                attributeDisplayForm: {
                                    uri: "/gdc/md/lmnivlu3sowt63jvr2mo1wlse5fyv203/obj/1086",
                                },
                            },
                        },
                    },
                },
                event: {
                    dataView: null,
                    drillContext: {
                        type: "column",
                        element: "bar",
                        intersection: [
                            {
                                header: {
                                    measureHeaderItem: {
                                        name: "_Close [EOP]",
                                        format: "#,##0.00",
                                        localIdentifier: "f7122f53c54f483fbe920b374d90eeed",
                                        uri: "/gdc/md/lmnivlu3sowt63jvr2mo1wlse5fyv203/obj/9203",
                                        identifier: "aazb6kroa3iC",
                                    },
                                },
                            },
                            {
                                header: {
                                    attributeHeaderItem: {
                                        name: "West Coast",
                                        uri:
                                            "/gdc/md/lmnivlu3sowt63jvr2mo1wlse5fyv203/obj/1023/elements?id=1237",
                                    },
                                    attributeHeader: {
                                        name: "Region",
                                        localIdentifier: "1d770104ba174b548f1f4dd69da40e96",
                                        uri: "/gdc/md/lmnivlu3sowt63jvr2mo1wlse5fyv203/obj/1024",
                                        identifier: "label.owner.region",
                                        formOf: {
                                            name: "Region",
                                            uri: "/gdc/md/lmnivlu3sowt63jvr2mo1wlse5fyv203/obj/1023",
                                            identifier: "attr.owner.region",
                                        },
                                    },
                                },
                            },
                            {
                                header: {
                                    attributeHeaderItem: {
                                        name: "Direct Sales",
                                        uri:
                                            "/gdc/md/lmnivlu3sowt63jvr2mo1wlse5fyv203/obj/1026/elements?id=1226",
                                    },
                                    attributeHeader: {
                                        name: "Department",
                                        localIdentifier: "998da372d62a4584b145cd026423fe24",
                                        uri: "/gdc/md/lmnivlu3sowt63jvr2mo1wlse5fyv203/obj/1027",
                                        identifier: "label.owner.department",
                                        formOf: {
                                            name: "Department",
                                            uri: "/gdc/md/lmnivlu3sowt63jvr2mo1wlse5fyv203/obj/1026",
                                            identifier: "attr.owner.department",
                                        },
                                    },
                                },
                            },
                        ],
                        x: 1,
                        y: 41515,
                    },
                },
            };

            const insite: IInsight = {
                insight: {
                    buckets: [
                        {
                            items: [
                                {
                                    measure: {
                                        localIdentifier: "f7122f53c54f483fbe920b374d90eeed",
                                        title: "_Close [EOP]",
                                        definition: {
                                            measureDefinition: {
                                                item: {
                                                    uri: "/gdc/md/lmnivlu3sowt63jvr2mo1wlse5fyv203/obj/9203",
                                                },
                                                filters: [],
                                            },
                                        },
                                    },
                                },
                            ],
                            localIdentifier: "measures",
                        },
                        {
                            items: [
                                {
                                    attribute: {
                                        localIdentifier: "1d770104ba174b548f1f4dd69da40e96",
                                        displayForm: {
                                            uri: "/gdc/md/lmnivlu3sowt63jvr2mo1wlse5fyv203/obj/1024",
                                        },
                                    },
                                },
                            ],
                            localIdentifier: "view",
                        },
                        {
                            items: [
                                {
                                    attribute: {
                                        localIdentifier: "998da372d62a4584b145cd026423fe24",
                                        displayForm: {
                                            uri: "/gdc/md/lmnivlu3sowt63jvr2mo1wlse5fyv203/obj/1027",
                                        },
                                    },
                                },
                            ],
                            localIdentifier: "stack",
                        },
                    ],
                    filters: [
                        {
                            negativeAttributeFilter: {
                                displayForm: {
                                    uri: "/gdc/md/lmnivlu3sowt63jvr2mo1wlse5fyv203/obj/1027",
                                },
                                notIn: {
                                    values: [],
                                },
                            },
                        },
                    ],
                    identifier: "aagHlbCbdPMD",
                    properties: {},
                    sorts: [],
                    title: "More drillsItems",
                    uri: "/gdc/md/lmnivlu3sowt63jvr2mo1wlse5fyv203/obj/76120",
                    visualizationUrl: "/gdc/md/lmnivlu3sowt63jvr2mo1wlse5fyv203/obj/75539",
                    updated: "2020-09-10 13:57:37",
                },
            };

            const expextedInsight: IInsight = {
                insight: {
                    buckets: [
                        {
                            items: [
                                {
                                    measure: {
                                        localIdentifier: "f7122f53c54f483fbe920b374d90eeed",
                                        title: "_Close [EOP]",
                                        definition: {
                                            measureDefinition: {
                                                item: {
                                                    uri: "/gdc/md/lmnivlu3sowt63jvr2mo1wlse5fyv203/obj/9203",
                                                },
                                                filters: [],
                                            },
                                        },
                                    },
                                },
                            ],
                            localIdentifier: "measures",
                        },
                        {
                            items: [
                                {
                                    attribute: {
                                        localIdentifier: "1d770104ba174b548f1f4dd69da40e96",
                                        displayForm: {
                                            uri: "/gdc/md/lmnivlu3sowt63jvr2mo1wlse5fyv203/obj/1024",
                                        },
                                    },
                                },
                            ],
                            localIdentifier: "view",
                        },
                        {
                            items: [
                                {
                                    attribute: {
                                        localIdentifier: "998da372d62a4584b145cd026423fe24",
                                        displayForm: {
                                            uri: "/gdc/md/lmnivlu3sowt63jvr2mo1wlse5fyv203/obj/1086",
                                        },
                                    },
                                },
                            ],
                            localIdentifier: "stack",
                        },
                    ],
                    filters: [
                        {
                            negativeAttributeFilter: {
                                displayForm: {
                                    uri: "/gdc/md/lmnivlu3sowt63jvr2mo1wlse5fyv203/obj/1027",
                                },
                                notIn: {
                                    values: [],
                                },
                            },
                        },
                        {
                            positiveAttributeFilter: {
                                displayForm: {
                                    uri: "/gdc/md/lmnivlu3sowt63jvr2mo1wlse5fyv203/obj/1027",
                                },
                                in: {
                                    uris: [
                                        "/gdc/md/lmnivlu3sowt63jvr2mo1wlse5fyv203/obj/1026/elements?id=1226",
                                    ],
                                },
                            },
                        },
                        {
                            positiveAttributeFilter: {
                                displayForm: {
                                    uri: "/gdc/md/lmnivlu3sowt63jvr2mo1wlse5fyv203/obj/1024",
                                },
                                in: {
                                    uris: [
                                        "/gdc/md/lmnivlu3sowt63jvr2mo1wlse5fyv203/obj/1023/elements?id=1237",
                                    ],
                                },
                            },
                        },
                    ],
                    identifier: "aagHlbCbdPMD",
                    properties: {},
                    sorts: [],
                    title: "More drillsItems",
                    uri: "/gdc/md/lmnivlu3sowt63jvr2mo1wlse5fyv203/obj/76120",
                    visualizationUrl: "/gdc/md/lmnivlu3sowt63jvr2mo1wlse5fyv203/obj/75539",
                    updated: "2020-09-10 13:57:37",
                },
            };

            const result: IInsight = barChart.modifyInsightForDrillDown(
                modifyInsightForDrillDown.sourceInsightMeasureViewStack,
                context,
            );

            expect(result).toEqual(expextedInsight);
        });
    });
});
