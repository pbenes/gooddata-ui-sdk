// (C) 2020 GoodData Corporation
import {
    IAttribute,
    IAttributeOrMeasure,
    IInsight,
    isAttribute,
    VisualizationProperties,
    insightModifyItems,
    insightReduceItems,
    attributeLocalId,
    modifyAttribute,
    insightSetProperties,
    insightSetFilters,
    IFilter,
    insightProperties,
    insightItems,
    bucketItemLocalId,
    newPositiveAttributeFilter,
} from "@gooddata/sdk-model";
import { BucketNames, IDrillEvent } from "@gooddata/sdk-ui";
import get from "lodash/get";
import last from "lodash/last";
import { IImplicitDrillDown } from "../../interfaces/Visualization";
import { isDrillIntersectionAttributeItem, IDrillEventIntersectionElement } from "@gooddata/sdk-ui";
import { drillDownFromAttributeLocalId, drillDownDisplayForm } from "../../utils/ImplicitDrillDownHelper";

function matchesDrillDownTargetAttribute(
    drillDefinition: IImplicitDrillDown,
    attribute: IAttribute,
): boolean {
    return attributeLocalId(attribute) === drillDownFromAttributeLocalId(drillDefinition);
}

type TColumnWidths = {
    attributeColumnWidthItem?: {
        attributeIdentifier: string;
        width: {
            value: number;
        };
    };
    measureColumnWidthItem?: {
        width: {
            value: number;
        };
    };
};

enum ENUM_PROPERTIES_TYPE {
    CONTROLS = "controls",
}

export function removeAttributesFromBuckets(
    insight: IInsight,
    drillDefinition: IImplicitDrillDown,
): IInsight {
    const removedLeftAttributes = insightReduceItems(
        insight,
        (acc: IAttributeOrMeasure[], cur: IAttributeOrMeasure): IAttributeOrMeasure[] => {
            if (isAttribute(cur) && matchesDrillDownTargetAttribute(drillDefinition, cur)) {
                return [cur];
            }

            return [...acc, cur];
        },
    );

    return insightModifyItems(
        removedLeftAttributes,
        (bucketItem: IAttributeOrMeasure): IAttributeOrMeasure => {
            if (isAttribute(bucketItem) && matchesDrillDownTargetAttribute(drillDefinition, bucketItem)) {
                const displayForm = drillDownDisplayForm(drillDefinition);
                return modifyAttribute(bucketItem, (a) => a.displayForm(displayForm).noAlias());
            }
            return bucketItem;
        },
    );
}

function removePropertiesForRemovedAttributes(insight: IInsight): IInsight {
    const properties: VisualizationProperties = insightProperties(insight);

    if (!properties) {
        return insight;
    }

    const identifiers = insightItems(insight).map((bucketItem: IAttributeOrMeasure) =>
        bucketItemLocalId(bucketItem),
    );

    const result = Object.entries(properties).reduce((acc, [key, value]) => {
        if (key === ENUM_PROPERTIES_TYPE.CONTROLS && value.columnWidths) {
            const columns = value.columnWidths.filter(
                (c: TColumnWidths) =>
                    c?.attributeColumnWidthItem?.attributeIdentifier === undefined ||
                    identifiers.includes(c.attributeColumnWidthItem.attributeIdentifier),
            );

            return {
                ...acc,
                [key]: {
                    columnWidths: columns,
                },
            };
        }

        return { ...acc };
    }, properties);

    return insightSetProperties(insight, result);
}

export function sanitizeTableProperties(insight: IInsight): IInsight {
    return removePropertiesForRemovedAttributes(insight);
}

export function convertIntersectionToFilters(intersections: IDrillEventIntersectionElement[]): IFilter[] {
    return intersections
        .map((intersection) => intersection.header)
        .filter(isDrillIntersectionAttributeItem)
        .map((header) =>
            newPositiveAttributeFilter(header.attributeHeader.uri, [header.attributeHeaderItem.uri]),
        );
}

export function addIntersectionFiltersToInsight(
    source: IInsight,
    intersection: IDrillEventIntersectionElement[],
): IInsight {
    const filters = convertIntersectionToFilters(intersection);
    const resultFilters = [...source.insight.filters, ...filters];

    return insightSetFilters(source, resultFilters);
}

export function getIntersectionPartAfter(
    intersection: IDrillEventIntersectionElement[],
    localIdentifier: string,
) {
    const index = intersection.findIndex(
        (item: IDrillEventIntersectionElement) =>
            isDrillIntersectionAttributeItem(item.header) &&
            item.header.attributeHeader.localIdentifier === localIdentifier,
    );

    return intersection.slice(index);
}

export function adjustIntersectionForColumnBar(source: IInsight, event: IDrillEvent) {
    const buckets = source.insight.buckets;

    const hasStackByAttributes =
        get(
            buckets.find((bucket) => bucket.localIdentifier === BucketNames.STACK),
            "items",
            [],
        ).length > 0;

    let reorderedIntersection = event.drillContext.intersection;
    if (hasStackByAttributes) {
        const lastItem = last(reorderedIntersection);
        const beginning = reorderedIntersection.slice(0, -1);

        // don't care about measures, they'll be filtered out
        reorderedIntersection = [lastItem, ...beginning];
    }

    return reorderedIntersection;
}
