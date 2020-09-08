// (C) 2020 GoodData Corporation
import {
    IAttribute,
    IAttributeOrMeasure,
    IBucket,
    IInsight,
    isAttribute,
    isMeasure,
    VisualizationProperties,
    insightModifyItems,
    insightReduceItems,
    attributeLocalId,
    modifyAttribute,
} from "@gooddata/sdk-model";
import flatMap from "lodash/flatMap";
import { IImplicitDrillDown } from "../../interfaces/Visualization";
import { isDrillIntersectionAttributeItem, IDrillEventIntersectionElement } from "@gooddata/sdk-ui";
import { drillDownFromAttributeLocalId, drillDownDisplayForm } from "../../utils/ImplicitDrillDownHelper";

function matchesDrillDownTargetAttribute(drillDefinition: IImplicitDrillDown, attribute: IAttribute) {
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
                return modifyAttribute(bucketItem, (a) => a.displayForm(displayForm).alias(undefined));
            }
            return bucketItem;
        },
    );
}

function removePropertiesForRemovedAttributes(insight: IInsight) {
    if (!insight.insight.properties) {
        return insight;
    }

    const properties: VisualizationProperties = insight.insight.properties;

    const identifiers = flatMap(insight.insight.buckets, (b: IBucket) => {
        for (const i of b.items) {
            if (isAttribute(i)) {
                return i.attribute.localIdentifier;
            }
            if (isMeasure(i)) {
                return i.measure.localIdentifier;
            }
        }
    });

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

    return {
        ...insight,
        insight: {
            ...insight.insight,
            properties: result,
        },
    };
}

export function sanitizeTableProperties(insight: IInsight): IInsight {
    return removePropertiesForRemovedAttributes(insight);
}

export function convertIntersectionToFilters(intersection: IDrillEventIntersectionElement[]) {
    return intersection
        .map((i) => i.header)
        .filter(isDrillIntersectionAttributeItem)
        .map((h) => ({
            positiveAttributeFilter: {
                displayForm: {
                    uri: h.attributeHeader.uri,
                },
                in: {
                    uris: [h.attributeHeaderItem.uri],
                },
            },
        }));
}

export function addIntersectionFiltersToInsight(
    source: IInsight,
    intersection: IDrillEventIntersectionElement[],
) {
    const filters = convertIntersectionToFilters(intersection);

    return {
        insight: {
            ...source.insight,
            filters: [...source.insight.filters, ...filters],
        },
    };
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
