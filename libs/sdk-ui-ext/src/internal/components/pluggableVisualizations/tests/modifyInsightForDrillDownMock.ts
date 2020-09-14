// (C) 2020 GoodData Corporation

import {
    IInsight,
    IInsightDefinition,
    newBucket,
    newInsightDefinition,
    newNegativeAttributeFilter,
    newPositiveAttributeFilter,
    newAttribute,
    uriRef,
    modifyAttribute,
} from "@gooddata/sdk-model";
import { Department, Region, Won } from "@gooddata/reference-workspace/dist/ldm/full";
import { IImplicitDrillDown, IDrillDownContext } from "../../../interfaces/Visualization";

const insightDefinitionWithMeasureViewStack: IInsightDefinition = newInsightDefinition(
    "visualizationClass-url",
    (b) => {
        return b
            .title("sourceInsight")
            .buckets([newBucket("measure", Won), newBucket("stack", Region), newBucket("view", Department)])
            .filters([newNegativeAttributeFilter(Department, [])]);
    },
);

const departmentUri = "/gdc/md/lmnivlu3sowt63jvr2mo1wlse5fyv203/obj/1027";
const westCostUri = "/gdc/md/lmnivlu3sowt63jvr2mo1wlse5fyv203/obj/1023/elements?id=1237";

const regionUri = "/gdc/md/lmnivlu3sowt63jvr2mo1wlse5fyv203/obj/1024";
const directSalesUri = "/gdc/md/lmnivlu3sowt63jvr2mo1wlse5fyv203/obj/1026/elements?id=1226";

const replacedBucket = newBucket(
    "view",
    newAttribute(uriRef("implicitDrillDown-target-uri"), (b) =>
        b.localId(Department.attribute.localIdentifier),
    ),
);

const expectedInsightDefinitionWithMeasureViewStack: IInsightDefinition = newInsightDefinition(
    "visualizationClass-url",
    (b) => {
        return b
            .title("sourceInsight")
            .buckets([newBucket("measure", Won), newBucket("stack", Region), replacedBucket])
            .filters([
                newNegativeAttributeFilter(Department, []),
                newPositiveAttributeFilter(
                    modifyAttribute(Department, (a) => a.displayForm(uriRef(departmentUri))),
                    { uris: [directSalesUri] },
                ),
                newPositiveAttributeFilter(
                    modifyAttribute(Region, (a) => a.displayForm(uriRef(regionUri))),
                    { uris: [westCostUri] },
                ),
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
        ...expectedInsightDefinitionWithMeasureViewStack.insight,
        identifier: "sourceInsightIdentifier",
        uri: "/sourceInsightUri",
    },
};

const drillDefinition: IImplicitDrillDown = {
    implicitDrillDown: {
        from: { drillFromAttribute: { localIdentifier: Department.attribute.localIdentifier } },
        target: {
            drillToAttribute: {
                attributeDisplayForm: {
                    uri: "implicitDrillDown-target-uri",
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
                            identifier: null,
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
                            name: Region.attribute.alias,
                            localIdentifier: Region.attribute.localIdentifier,
                            uri: regionUri,
                            identifier: null,
                            formOf: null,
                        },
                    },
                },
                {
                    header: {
                        attributeHeaderItem: {
                            name: "Direct Sales",
                            uri: directSalesUri,
                        },
                        attributeHeader: {
                            name: Department.attribute.alias,
                            localIdentifier: Department.attribute.localIdentifier,
                            uri: departmentUri,
                            identifier: null,
                            formOf: null,
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
