// (C) 2020 GoodData Corporation

import {
    IInsight,
    IInsightDefinition,
    newBucket,
    newInsightDefinition,
    newNegativeAttributeFilter,
} from "@gooddata/sdk-model";
import { Department, Region, Status, Won } from "@gooddata/reference-workspace/dist/ldm/full";
import { IImplicitDrillDown } from "sdk-ui-ext/src/internal";

const insightWithMeasureViewStack: IInsightDefinition = newInsightDefinition(
    "visualizationClass-url",
    (b) => {
        return b
            .title("sourceInsight")
            .buckets([newBucket("measure", Won), newBucket("stack", Region), newBucket("view", Department)])
            .filters([newNegativeAttributeFilter(Department, [])]);
    },
);

const sourceInsightMeasureViewStack: IInsight = {
    ...insightWithMeasureViewStack,
    insight: {
        ...insightWithMeasureViewStack.insight,
        identifier: "sourceInsightIdentifier",
        uri: "/sourceInsightUri",
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

export const modifyInsightForDrillDown = {
    sourceInsightMeasureViewStack,
    drillConfig,
};
