// (C) 2020 GoodData Corporation
import noop from "lodash/noop";
import { PluggableBulletChart } from "../PluggableBulletChart";
import * as referencePointMocks from "../../../../tests/mocks/referencePointMocks";
import {
    IBucketOfFun,
    IFilters,
    IReferencePoint,
    IVisConstruct,
    IImplicitDrillDown,
} from "../../../../interfaces/Visualization";
import { DEFAULT_BULLET_CHART_CONFIG } from "../../../../constants/uiConfig";
import {
    OverTimeComparisonTypes,
    BucketNames,
    IDrillEventIntersectionElement,
    DrillEventIntersectionElementHeader,
    IDrillEvent,
    VisType,
} from "@gooddata/sdk-ui";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import {
    newAttribute,
    IAttribute,
    IInsight,
    IInsightDefinition,
    newInsightDefinition,
    newBucket,
    newNegativeAttributeFilter,
    newPositiveAttributeFilter,
    uriRef,
} from "@gooddata/sdk-model";
import { IMeasureDescriptor } from "@gooddata/sdk-backend-spi";
import { IDrillIntersectionAttributeItem } from "@gooddata/sdk-ui";
import { Department, Region, Won } from "@gooddata/reference-workspace/dist/ldm/full";

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
        function createMeasureDescriptor(name: string, localIdentifier: string): IMeasureDescriptor {
            return {
                measureHeaderItem: {
                    localIdentifier,
                    name,
                    format: "###.#",
                },
            };
        }

        function createAttributeDescriptor(
            name: string,
            localIdentifier: string,
        ): IDrillIntersectionAttributeItem {
            return {
                attributeHeaderItem: {
                    uri: `/gdc/md/${name}-element`,
                    name: `${name}-element-name`,
                },
                attributeHeader: {
                    uri: `/gdc/md/obj/${name}`,
                    identifier: `id-${name}`,
                    localIdentifier,
                    name,
                    formOf: {
                        uri: `/gdc/md/obj/formof-${name}`,
                        identifier: `formof-id-${name}`,
                        name: `formof-${name}`,
                    },
                },
            };
        }

        function wrapHeader(header: DrillEventIntersectionElementHeader): IDrillEventIntersectionElement {
            return { header };
        }

        function createDrillDefinition(fromAttribute: IAttribute, targetUri: string): IImplicitDrillDown {
            return {
                implicitDrillDown: {
                    from: {
                        drillFromAttribute: { localIdentifier: fromAttribute.attribute.localIdentifier },
                    },
                    target: {
                        drillToAttribute: {
                            attributeDisplayForm: uriRef(targetUri),
                        },
                    },
                },
            };
        }

        function wrapUriIdentifier(
            insightDefinition: IInsightDefinition,
            uri: string,
            identifier: string,
        ): IInsight {
            return {
                ...insightDefinition,
                insight: {
                    ...insightDefinition.insight,
                    identifier,
                    uri,
                },
            };
        }

        function createDrillEvent(
            type: VisType,
            intersection: IDrillEventIntersectionElement[],
        ): IDrillEvent {
            return {
                dataView: null,
                drillContext: {
                    type,
                    intersection,
                    element: null,
                },
            };
        }

        const measure = wrapHeader(createMeasureDescriptor("m", "m_acugFHNJgsBy"));
        const attribute1 = wrapHeader(createAttributeDescriptor("a1", "a1"));
        const attribute2 = wrapHeader(createAttributeDescriptor("a2", Region.attribute.localIdentifier));
        const attribute3 = wrapHeader(createAttributeDescriptor("a3", "a3"));
        const targetUri = "target-uri";

        const intersection = [measure, attribute1, attribute2, attribute3];

        it("should replace the drill down attribute and add intersection filters", () => {
            const bulletChart = createComponent();

            const drillDefinition = createDrillDefinition(Region, targetUri);

            const sourceInsightDefinition: IInsightDefinition = newInsightDefinition(
                "visualizationClass-url",
                (b) => {
                    return b
                        .title("sourceInsight")
                        .buckets([
                            newBucket("measure", Won),
                            newBucket("view", Region, Department),
                            newBucket("stack", Department),
                        ])
                        .filters([newNegativeAttributeFilter(Department, [])]);
                },
            );
            const sourceInsight = wrapUriIdentifier(sourceInsightDefinition, "first", "first");
            const replacedAttribute = newAttribute(uriRef(targetUri), (b) =>
                b.localId(Region.attribute.localIdentifier),
            );

            const expectedInsightDefinition: IInsightDefinition = newInsightDefinition(
                "visualizationClass-url",
                (b) => {
                    return b
                        .title("sourceInsight")
                        .buckets([
                            newBucket("measure", Won),
                            newBucket("view", replacedAttribute, Department),
                            newBucket("stack", Department),
                        ])
                        .filters([
                            newNegativeAttributeFilter(Department, []),
                            newPositiveAttributeFilter(newAttribute(uriRef("/gdc/md/obj/a2")), {
                                uris: ["/gdc/md/a2-element"],
                            }),
                            newPositiveAttributeFilter(newAttribute(uriRef("/gdc/md/obj/a3")), {
                                uris: ["/gdc/md/a3-element"],
                            }),
                        ]);
                },
            );
            const expectedInsight = wrapUriIdentifier(expectedInsightDefinition, "first", "first");

            const result: IInsight = bulletChart.modifyInsightForDrillDown(sourceInsight, {
                drillDefinition,
                event: createDrillEvent("bullet", intersection),
            });

            expect(result).toEqual(expectedInsight);
        });
    });
});
