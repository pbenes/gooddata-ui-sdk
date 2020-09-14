// (C) 2020 GoodData Corporation
import {
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
import { IDrillEventIntersectionElement, IDrillIntersectionAttributeItem } from "@gooddata/sdk-ui";
import { IMeasureDescriptor } from "@gooddata/sdk-backend-spi";

export const targetUri = "target-uri";

export const insightDefinitionWithStackBy: IInsightDefinition = newInsightDefinition(
    "visualizationClass-url",
    (b) => {
        return b
            .title("sourceInsight")
            .buckets([newBucket("measure", Won), newBucket("stack", Region), newBucket("view", Department)])
            .filters([newNegativeAttributeFilter(Department, [])]);
    },
);

export const insightDefinition: IInsightDefinition = newInsightDefinition("visualizationClass-url", (b) => {
    return b
        .title("sourceInsight")
        .buckets([newBucket("measure", Won), newBucket("view", Department, Region)])
        .filters([newNegativeAttributeFilter(Department, [])]);
});

export const expectedInsightDefinitionDrillToRegion: IInsightDefinition = newInsightDefinition(
    "visualizationClass-url",
    (b) => {
        return b
            .title("sourceInsight")
            .buckets([
                newBucket("measure", Won),
                newBucket(
                    "view",
                    newAttribute(uriRef(targetUri), (b) => b.localId(Region.attribute.localIdentifier)),
                ),
            ])
            .filters([
                newNegativeAttributeFilter(Department, []),
                newPositiveAttributeFilter(
                    modifyAttribute(Region, (a) => a.displayForm(uriRef(regionUri))),
                    { uris: [westCostUri] },
                ),
                newPositiveAttributeFilter(
                    modifyAttribute(Department, (a) => a.displayForm(uriRef(departmentUri))),
                    { uris: [directSalesUri] },
                ),
            ]);
    },
);

const departmentUri = "/gdc/md/lmnivlu3sowt63jvr2mo1wlse5fyv203/obj/1027";
const westCostUri = "/gdc/md/lmnivlu3sowt63jvr2mo1wlse5fyv203/obj/1023/elements?id=1237";

const regionUri = "/gdc/md/lmnivlu3sowt63jvr2mo1wlse5fyv203/obj/1024";
const directSalesUri = "/gdc/md/lmnivlu3sowt63jvr2mo1wlse5fyv203/obj/1026/elements?id=1226";

export const expectedInsightDefinitionWithStackByDrillToDepartment: IInsightDefinition = newInsightDefinition(
    "visualizationClass-url",
    (b) => {
        return b
            .title("sourceInsight")
            .buckets([
                newBucket("measure", Won),
                newBucket("stack", Region),
                newBucket(
                    "view",
                    newAttribute(uriRef(targetUri), (b) => b.localId(Department.attribute.localIdentifier)),
                ),
            ])
            .filters([
                newNegativeAttributeFilter(Department, []),
                newPositiveAttributeFilter(
                    modifyAttribute(Department, (a) => a.displayForm(uriRef(departmentUri))),
                    { uris: [directSalesUri] },
                ),
            ]);
    },
);

export const expectedInsightDefinitionWithStackByDrillToRegion: IInsightDefinition = newInsightDefinition(
    "visualizationClass-url",
    (b) => {
        return b
            .title("sourceInsight")
            .buckets([
                newBucket("measure", Won),
                newBucket(
                    "stack",
                    newAttribute(uriRef(targetUri), (b) => b.localId(Region.attribute.localIdentifier)),
                ),
                newBucket("view", Department),
            ])
            .filters([
                newNegativeAttributeFilter(Department, []),
                newPositiveAttributeFilter(
                    modifyAttribute(Region, (a) => a.displayForm(uriRef(regionUri))),
                    { uris: [westCostUri] },
                ),
                newPositiveAttributeFilter(
                    modifyAttribute(Department, (a) => a.displayForm(uriRef(departmentUri))),
                    { uris: [directSalesUri] },
                ),
            ]);
    },
);

export const measureHeader: IMeasureDescriptor = {
    measureHeaderItem: {
        name: Won.measure.title,
        format: "#,##0.00",
        localIdentifier: Won.measure.localIdentifier,
        uri: "/gdc/md/lmnivlu3sowt63jvr2mo1wlse5fyv203/obj/9203",
        identifier: null,
    },
};

export const westCoastHeader: IDrillIntersectionAttributeItem = {
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
};

export const directSalesHeader: IDrillIntersectionAttributeItem = {
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
};

export const intersection: IDrillEventIntersectionElement[] = [
    {
        header: measureHeader,
    },
    {
        header: directSalesHeader,
    },
    {
        header: westCoastHeader,
    },
];
