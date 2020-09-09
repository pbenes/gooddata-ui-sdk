// (C) 2020 GoodData Corporation

import {
    bucketSetTotals,
    IFilter,
    IInsight,
    IInsightDefinition,
    ISortItem,
    modifyAttribute,
    newAttribute,
    newAttributeSort,
    newBucket,
    newInsightDefinition,
    newPositiveAttributeFilter,
    newTotal,
    uriRef,
} from "@gooddata/sdk-model";
import { IImplicitDrillDown, IVisualizationProperties } from "../../../..";
import { Department, Region, Status, Won } from "@gooddata/reference-workspace/dist/ldm/full";

const properties: IVisualizationProperties = {
    controls: {
        columnWidths: [
            {
                attributeColumnWidthItem: {
                    attributeIdentifier: Region.attribute.localIdentifier,
                    width: { value: 131 },
                },
            },
            {
                attributeColumnWidthItem: {
                    attributeIdentifier: Status.attribute.localIdentifier,
                    width: { value: 125 },
                },
            },
            {
                attributeColumnWidthItem: {
                    attributeIdentifier: Department.attribute.localIdentifier,
                    width: { value: 97 },
                },
            },
            { measureColumnWidthItem: { width: { value: 270 } } },
        ],
    },
    sortItems: [
        {
            attributeSortItem: {
                attributeIdentifier: Region.attribute.localIdentifier,
                direction: "desc",
            },
        },
        {
            attributeSortItem: {
                attributeIdentifier: Status.attribute.localIdentifier,
                direction: "asc",
            },
        },
    ],
};

const filters: IFilter[] = [newPositiveAttributeFilter(Department, ["Inside Sales"])];
const sorts: ISortItem[] = [newAttributeSort(Department)];
const sourceInsightDefinition: IInsightDefinition = newInsightDefinition("visualizationClass-url", (b) => {
    return b
        .title("sourceInsight")
        .buckets([
            newBucket(
                "attribute",
                Region,
                modifyAttribute(Status, (b) => b.alias("status alias")),
                Department,
            ),
            bucketSetTotals(newBucket("measure", Won), []),
        ])
        .filters(filters)
        .sorts(sorts)
        .properties(properties);
});

const sourceInsightDefinitionWithTotals: IInsightDefinition = newInsightDefinition(
    "visualizationClass-url",
    (b) => {
        return b
            .title("sourceInsight")
            .buckets([
                newBucket("attribute", Region, Status, Department),
                newBucket("measure", Won, newTotal("nat", Won, Region)),
            ])
            .filters(filters)
            .sorts(sorts)
            .properties(properties);
    },
);

const sourceInsight: IInsight = {
    ...sourceInsightDefinition,
    insight: {
        ...sourceInsightDefinition.insight,
        identifier: "sourceInsightIdentifier",
        uri: "/sourceInsightUri",
    },
};

const sourceInsightWithTotals: IInsight = {
    ...sourceInsightDefinitionWithTotals,
    insight: {
        ...sourceInsight.insight,
        ...sourceInsightDefinitionWithTotals.insight,
    },
};

const drillConfig: IImplicitDrillDown = {
    implicitDrillDown: {
        from: { drillFromAttribute: { localIdentifier: Status.attribute.localIdentifier } },
        target: {
            drillToAttribute: {
                attributeDisplayForm: {
                    uri: "implicitDrillDown-target-uri",
                },
            },
        },
    },
};

const expectedProperties: IVisualizationProperties = {
    ...sourceInsight.insight.properties,
    controls: {
        columnWidths: [
            {
                attributeColumnWidthItem: {
                    attributeIdentifier: Status.attribute.localIdentifier,
                    width: { value: 125 },
                },
            },
            {
                attributeColumnWidthItem: {
                    attributeIdentifier: Department.attribute.localIdentifier,
                    width: { value: 97 },
                },
            },
            { measureColumnWidthItem: { width: { value: 270 } } },
        ],
    },
    sortItems: [
        // TODO we do not sanitize sort items?
        {
            attributeSortItem: {
                attributeIdentifier: Region.attribute.localIdentifier,
                direction: "desc",
            },
        },
        {
            attributeSortItem: {
                attributeIdentifier: Status.attribute.localIdentifier,
                direction: "asc",
            },
        },
    ],
};
const expectedInsightDefinition: IInsightDefinition = newInsightDefinition(
    sourceInsight.insight.visualizationUrl,
    (b) => {
        return b
            .title(sourceInsight.insight.title)
            .buckets([
                newBucket(
                    "attribute",
                    newAttribute(
                        uriRef(
                            drillConfig.implicitDrillDown.target.drillToAttribute.attributeDisplayForm.uri,
                        ),
                        (b) => b.localId(Status.attribute.localIdentifier),
                    ),
                    Department,
                ),
                bucketSetTotals(newBucket("measure", Won), []),
            ])
            .filters([newPositiveAttributeFilter(Department, ["Inside Sales"])])
            .sorts([newAttributeSort(Department)])
            .properties(expectedProperties);
    },
);

const expectedInsight: IInsight = {
    ...expectedInsightDefinition,
    insight: {
        ...expectedInsightDefinition.insight,
        identifier: sourceInsight.insight.identifier,
        uri: sourceInsight.insight.uri,
    },
};

export const convertOnDrillMocks = {
    properties,
    sourceInsight,
    sourceInsightWithTotals,
    drillConfig,
    expectedInsight,
};
