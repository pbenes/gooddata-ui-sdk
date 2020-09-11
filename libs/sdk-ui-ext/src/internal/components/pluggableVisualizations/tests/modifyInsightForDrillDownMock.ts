// (C) 2020 GoodData Corporation

import {
    IInsight,
    IInsightDefinition,
    newBucket,
    newInsightDefinition,
    newNegativeAttributeFilter,
    newPositiveAttributeFilter,
    UriRef,
} from "@gooddata/sdk-model";
import { Department, Region, Won, Status } from "@gooddata/reference-workspace/dist/ldm/full";
import { IImplicitDrillDown } from "sdk-ui-ext/src/internal";
import { IDrillDownContext } from "sdk-ui-ext/src/internal/interfaces/Visualization";

const insightDefinitionWithMeasureViewStack: IInsightDefinition = newInsightDefinition(
    "visualizationClass-url",
    (b) => {
        return b
            .title("sourceInsight")
            .buckets([newBucket("measure", Won), newBucket("stack", Region), newBucket("view", Department)])
            .filters([newNegativeAttributeFilter(Department, [])]);
    },
);

const westCostUri = "/gdc/md/lmnivlu3sowt63jvr2mo1wlse5fyv203/obj/1023/elements?id=1237";

const expectedInsightDefinitionWithMeasureViewStack: IInsightDefinition = newInsightDefinition(
    "visualizationClass-url",
    (b) => {
        return b
            .title("sourceInsight")
            .buckets([newBucket("measure", Won), newBucket("stack", Status), newBucket("view", Department)])
            .filters([
                newNegativeAttributeFilter(Department, []),
                newPositiveAttributeFilter(Region, { uris: [westCostUri] }),
                newPositiveAttributeFilter(Department, ["Direct Sales"]),
            ]);
    },
);

const insightMeasureViewStack: IInsight = {
    ...insightDefinitionWithMeasureViewStack,
    insight: {
        ...insightDefinitionWithMeasureViewStack.insight,
        identifier: "sourceInsightIdentifier",
        uri: "/sourceInsightUri",
    },
};

const expectedInsightMeasureViewStack: IInsight = {
    ...expectedInsightDefinitionWithMeasureViewStack,
    insight: {
        ...insightDefinitionWithMeasureViewStack.insight,
        identifier: "sourceInsightIdentifier",
        uri: "/sourceInsightUri",
    },
};

const drillDefinition: IImplicitDrillDown = {
    implicitDrillDown: {
        from: { drillFromAttribute: { localIdentifier: Region.attribute.localIdentifier } },
        target: {
            drillToAttribute: {
                attributeDisplayForm: {
                    uri: (Status.attribute.displayForm as UriRef).uri,
                },
            },
        },
    },
};

const context: IDrillDownContext = {
    drillDefinition,
    event: {
        dataView: null,
        drillContext: {
            type: "column",
            element: "bar",
            intersection: [
                {
                    header: {
                        measureHeaderItem: {
                            name: Won.measure.title,
                            format: "#,##0.00",
                            localIdentifier: Won.measure.localIdentifier,
                            uri: "/gdc/md/lmnivlu3sowt63jvr2mo1wlse5fyv203/obj/9203",
                            identifier: "aazb6kroa3iC",
                        },
                    },
                },
                {
                    header: {
                        attributeHeaderItem: {
                            name: "West Coast",
                            uri: westCostUri,
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
                            uri: "/gdc/md/lmnivlu3sowt63jvr2mo1wlse5fyv203/obj/1026/elements?id=1226",
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

export const modifyInsightForDrillDown = {
    insightMeasureViewStack,
    expectedInsightMeasureViewStack,
    context,
};
