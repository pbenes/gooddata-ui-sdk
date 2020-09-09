// (C) 2020 GoodData Corporation
import noop from "lodash/noop";
import { PluggableBulletChart } from "../PluggableBulletChart";
import * as referencePointMocks from "../../../../tests/mocks/referencePointMocks";
import { IBucketOfFun, IFilters, IReferencePoint, IVisConstruct } from "../../../../interfaces/Visualization";
import { DEFAULT_BULLET_CHART_CONFIG } from "../../../../constants/uiConfig";
import { OverTimeComparisonTypes, BucketNames } from "@gooddata/sdk-ui";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";

const defaultProps: IVisConstruct = {
    backend: dummyBackend(),
    projectId: "PROJECTID",
    element: "body",
    configPanelElement: null as string,
    callbacks: {
        afterRender: noop,
        pushData: noop,
    },
    renderFun: noop,
    visualizationProperties: {},
};

function createComponent(props: IVisConstruct = defaultProps) {
    return new PluggableBulletChart(props);
}

describe("PluggableBulletChart", () => {
    const bulletChart = createComponent();

    it("should create visualization", () => {
        expect(bulletChart).toBeTruthy();
    });

    it("should return reference point with three measures and one category and only valid filters", async () => {
        const expectedBuckets: IBucketOfFun[] = [
            {
                localIdentifier: "measures",
                items: referencePointMocks.multipleMetricsAndCategoriesReferencePoint.buckets[0].items.slice(
                    0,
                    1,
                ),
            },
            {
                localIdentifier: "secondary_measures",
                items: referencePointMocks.multipleMetricsAndCategoriesReferencePoint.buckets[0].items.slice(
                    1,
                    2,
                ),
            },
            {
                localIdentifier: "tertiary_measures",
                items: referencePointMocks.multipleMetricsAndCategoriesReferencePoint.buckets[0].items.slice(
                    2,
                    3,
                ),
            },
            {
                localIdentifier: "view",
                items: referencePointMocks.multipleMetricsAndCategoriesReferencePoint.buckets[1].items.slice(
                    0,
                    2,
                ),
            },
        ];

        const expectedFilters: IFilters = {
            localIdentifier: "filters",
            items: referencePointMocks.multipleMetricsAndCategoriesReferencePoint.filters.items.slice(0, 2),
        };

        const extendedReferencePoint = await bulletChart.getExtendedReferencePoint(
            referencePointMocks.multipleMetricsAndCategoriesReferencePoint,
        );

        const expectedUiConfig = {
            ...DEFAULT_BULLET_CHART_CONFIG,
            buckets: {
                [BucketNames.MEASURES]: {
                    ...DEFAULT_BULLET_CHART_CONFIG.buckets[BucketNames.MEASURES],
                    canAddItems: false,
                },
                [BucketNames.SECONDARY_MEASURES]: {
                    ...DEFAULT_BULLET_CHART_CONFIG.buckets[BucketNames.MEASURES],
                    canAddItems: false,
                },
                [BucketNames.TERTIARY_MEASURES]: {
                    ...DEFAULT_BULLET_CHART_CONFIG.buckets[BucketNames.MEASURES],
                    canAddItems: false,
                },
            },
        };

        expect(extendedReferencePoint).toMatchObject({
            buckets: expectedBuckets,
            filters: expectedFilters,
            uiConfig: expectedUiConfig,
            properties: {},
        });
    });

    it("should return reference point with three measures and no attribute", async () => {
        const expectedBuckets: IBucketOfFun[] = [
            {
                localIdentifier: "measures",
                items: referencePointMocks.multipleMetricsAndCategoriesReferencePoint.buckets[0].items.slice(
                    0,
                    1,
                ),
            },
            {
                localIdentifier: "secondary_measures",
                items: referencePointMocks.multipleMetricsAndCategoriesReferencePoint.buckets[0].items.slice(
                    1,
                    2,
                ),
            },
            {
                localIdentifier: "tertiary_measures",
                items: referencePointMocks.multipleMetricsAndCategoriesReferencePoint.buckets[0].items.slice(
                    2,
                    3,
                ),
            },
            {
                localIdentifier: "view",
                items: [],
            },
        ];

        const expectedFilters: IFilters = {
            localIdentifier: "filters",
            items: [],
        };

        const extendedReferencePoint = await bulletChart.getExtendedReferencePoint(
            referencePointMocks.multipleMetricsNoCategoriesReferencePoint,
        );

        const expectedUiConfig = {
            ...DEFAULT_BULLET_CHART_CONFIG,
            buckets: {
                [BucketNames.MEASURES]: {
                    ...DEFAULT_BULLET_CHART_CONFIG.buckets[BucketNames.MEASURES],
                    canAddItems: false,
                },
                [BucketNames.SECONDARY_MEASURES]: {
                    ...DEFAULT_BULLET_CHART_CONFIG.buckets[BucketNames.MEASURES],
                    canAddItems: false,
                },
                [BucketNames.TERTIARY_MEASURES]: {
                    ...DEFAULT_BULLET_CHART_CONFIG.buckets[BucketNames.MEASURES],
                    canAddItems: false,
                },
            },
        };

        expect(extendedReferencePoint).toMatchObject({
            buckets: expectedBuckets,
            filters: expectedFilters,
            uiConfig: expectedUiConfig,
            properties: {},
        });
    });

    it("should return reference point with target and comparative measures and one category", async () => {
        const expectedBuckets: IBucketOfFun[] = [
            {
                localIdentifier: "measures",
                items: [],
            },
            {
                localIdentifier: "secondary_measures",
                items: referencePointMocks.secondaryMeasuresAndAttributeReferencePoint.buckets[1].items.slice(
                    0,
                    1,
                ),
            },
            {
                localIdentifier: "tertiary_measures",
                items: referencePointMocks.secondaryMeasuresAndAttributeReferencePoint.buckets[1].items.slice(
                    1,
                    2,
                ),
            },
            {
                localIdentifier: "view",
                items: referencePointMocks.secondaryMeasuresAndAttributeReferencePoint.buckets[2].items.slice(
                    0,
                    2,
                ),
            },
        ];
        const expectedFilters: IFilters = {
            localIdentifier: "filters",
            items: referencePointMocks.secondaryMeasuresAndAttributeReferencePoint.filters.items.slice(0, 2),
        };

        const extendedReferencePoint = await bulletChart.getExtendedReferencePoint(
            referencePointMocks.secondaryAndTertiaryMeasuresWithTwoAttributesReferencePoint,
        );

        const expectedUiConfig = {
            ...DEFAULT_BULLET_CHART_CONFIG,
            buckets: {
                [BucketNames.SECONDARY_MEASURES]: {
                    ...DEFAULT_BULLET_CHART_CONFIG.buckets[BucketNames.MEASURES],
                    canAddItems: false,
                },
                [BucketNames.TERTIARY_MEASURES]: {
                    ...DEFAULT_BULLET_CHART_CONFIG.buckets[BucketNames.MEASURES],
                    canAddItems: false,
                },
            },
        };

        expect(extendedReferencePoint).toMatchObject({
            buckets: expectedBuckets,
            filters: expectedFilters,
            uiConfig: expectedUiConfig,
            properties: {},
        });
    });

    describe("isError property", () => {
        it("should set to true if primary measure is missing", async () => {
            await bulletChart.getExtendedReferencePoint(
                referencePointMocks.secondaryAndTertiaryMeasuresWithTwoAttributesReferencePoint,
            );

            expect((bulletChart as any).getIsError()).toEqual(true);
        });

        it("should set to false if primary measure is present", async () => {
            await bulletChart.getExtendedReferencePoint(
                referencePointMocks.multipleMetricsNoCategoriesReferencePoint,
            );

            expect((bulletChart as any).getIsError()).toEqual(false);
        });
    });

    describe("Arithmetic measures", () => {
        it("should add AM that does fit", async () => {
            const extendedReferencePoint = await bulletChart.getExtendedReferencePoint({
                buckets: [
                    {
                        localIdentifier: "measures",
                        items: [
                            referencePointMocks.arithmeticMeasureItems[3],
                            referencePointMocks.derivedMeasureItems[0],
                            referencePointMocks.masterMeasureItems[1],
                            referencePointMocks.masterMeasureItems[0],
                        ],
                    },
                ],
                filters: {
                    localIdentifier: "filters",
                    items: [referencePointMocks.overTimeComparisonDateItem],
                },
            });

            expect(extendedReferencePoint.buckets).toEqual([
                {
                    localIdentifier: "measures",
                    items: [referencePointMocks.arithmeticMeasureItems[3]],
                },
                {
                    localIdentifier: "secondary_measures",
                    items: [referencePointMocks.derivedMeasureItems[0]],
                },
                {
                    localIdentifier: "tertiary_measures",
                    items: [referencePointMocks.masterMeasureItems[0]],
                },
                {
                    localIdentifier: "view",
                    items: [],
                },
            ]);
        });

        it("should skip AM that does not fit and place derived together with master", async () => {
            const extendedReferencePoint = await bulletChart.getExtendedReferencePoint({
                buckets: [
                    {
                        localIdentifier: "measures",
                        items: [
                            referencePointMocks.masterMeasureItems[0],
                            referencePointMocks.arithmeticMeasureItems[6],
                            referencePointMocks.masterMeasureItems[1],
                            referencePointMocks.derivedMeasureItems[0],
                            referencePointMocks.masterMeasureItems[2],
                        ],
                    },
                ],
                filters: {
                    localIdentifier: "filters",
                    items: [referencePointMocks.overTimeComparisonDateItem],
                },
            });

            expect(extendedReferencePoint.buckets).toEqual([
                {
                    localIdentifier: "measures",
                    items: [referencePointMocks.masterMeasureItems[0]],
                },
                {
                    localIdentifier: "secondary_measures",
                    items: [referencePointMocks.masterMeasureItems[1]],
                },
                {
                    localIdentifier: "tertiary_measures",
                    items: [referencePointMocks.derivedMeasureItems[0]],
                },
                {
                    localIdentifier: "view",
                    items: [],
                },
            ]);
        });

        it("should accept arithmetic measure when it has the same measure in both operands", async () => {
            const extendedReferencePoint = await bulletChart.getExtendedReferencePoint({
                buckets: [
                    {
                        localIdentifier: "measures",
                        items: [
                            referencePointMocks.arithmeticMeasureItems[2],
                            referencePointMocks.masterMeasureItems[0],
                            referencePointMocks.masterMeasureItems[1],
                        ],
                    },
                ],
                filters: {
                    localIdentifier: "filters",
                    items: [referencePointMocks.overTimeComparisonDateItem],
                },
            });

            expect(extendedReferencePoint.buckets).toEqual([
                {
                    localIdentifier: "measures",
                    items: [referencePointMocks.arithmeticMeasureItems[2]],
                },
                {
                    localIdentifier: "secondary_measures",
                    items: [referencePointMocks.masterMeasureItems[0]],
                },
                {
                    localIdentifier: "tertiary_measures",
                    items: [referencePointMocks.masterMeasureItems[1]],
                },
                {
                    localIdentifier: "view",
                    items: [],
                },
            ]);
        });
    });

    describe("Over Time Comparison", () => {
        it("should return reference point containing uiConfig with PP, SP supported comparison types", async () => {
            const extendedReferencePoint = await bulletChart.getExtendedReferencePoint(
                referencePointMocks.emptyReferencePoint,
            );

            expect(extendedReferencePoint.uiConfig.supportedOverTimeComparisonTypes).toEqual([
                OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
                OverTimeComparisonTypes.PREVIOUS_PERIOD,
            ]);
        });

        describe("placing new derived items", () => {
            it("should place new derived bucket item to tertiary measures bucket", async () => {
                const referencePoint: IReferencePoint = {
                    buckets: [
                        {
                            localIdentifier: "measures",
                            items: [referencePointMocks.masterMeasureItems[0]],
                        },
                        {
                            localIdentifier: "secondary_measures",
                            items: [referencePointMocks.masterMeasureItems[1]],
                        },
                        {
                            localIdentifier: "tertiary_measures",
                            items: [],
                        },
                        {
                            localIdentifier: "view",
                            items: [],
                        },
                    ],
                    filters: {
                        localIdentifier: "filters",
                        items: [referencePointMocks.overTimeComparisonDateItem],
                    },
                };

                const referencePointWithDerivedItems = await bulletChart.addNewDerivedBucketItems(
                    referencePoint,
                    [referencePointMocks.derivedMeasureItems[0]],
                );

                const extendedReferencePoint = await bulletChart.getExtendedReferencePoint(
                    referencePointWithDerivedItems,
                );

                expect(extendedReferencePoint.buckets).toEqual([
                    {
                        localIdentifier: "measures",
                        items: [referencePointMocks.masterMeasureItems[0]],
                    },
                    {
                        localIdentifier: "secondary_measures",
                        items: [referencePointMocks.masterMeasureItems[1]],
                    },
                    {
                        localIdentifier: "tertiary_measures",
                        items: [referencePointMocks.derivedMeasureItems[0]],
                    },
                    {
                        localIdentifier: "view",
                        items: [],
                    },
                ]);
            });

            it("should place new derived bucket item to secondary measures bucket", async () => {
                const referencePoint: IReferencePoint = {
                    buckets: [
                        {
                            localIdentifier: "measures",
                            items: [referencePointMocks.masterMeasureItems[0]],
                        },
                        {
                            localIdentifier: "secondary_measures",
                            items: [],
                        },
                        {
                            localIdentifier: "tertiary_measures",
                            items: [],
                        },
                        {
                            localIdentifier: "view",
                            items: [],
                        },
                    ],
                    filters: {
                        localIdentifier: "filters",
                        items: [referencePointMocks.overTimeComparisonDateItem],
                    },
                };

                const referencePointWithDerivedItems = await bulletChart.addNewDerivedBucketItems(
                    referencePoint,
                    [referencePointMocks.derivedMeasureItems[0]],
                );

                const extendedReferencePoint = await bulletChart.getExtendedReferencePoint(
                    referencePointWithDerivedItems,
                );

                expect(extendedReferencePoint.buckets).toEqual([
                    {
                        localIdentifier: "measures",
                        items: [referencePointMocks.masterMeasureItems[0]],
                    },
                    {
                        localIdentifier: "secondary_measures",
                        items: [referencePointMocks.derivedMeasureItems[0]],
                    },
                    {
                        localIdentifier: "tertiary_measures",
                        items: [],
                    },
                    {
                        localIdentifier: "view",
                        items: [],
                    },
                ]);
            });
        });
    });

    describe("Drill Down", () => {
        it("should replace the drill down attribute and add intersection filters", () => {
            fail("not implemented");
        });
    });
});
