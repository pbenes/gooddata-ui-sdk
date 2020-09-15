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
    uriRef,
} from "@gooddata/sdk-model";
import { IImplicitDrillDown } from "../../interfaces/Visualization";
import { isDrillIntersectionAttributeItem, IDrillEventIntersectionElement } from "@gooddata/sdk-ui";
import { drillDownFromAttributeLocalId, drillDownDisplayForm } from "../../utils/ImplicitDrillDownHelper";
import { ColumnWidthItem, isAttributeColumnWidthItem } from "@gooddata/sdk-ui-pivot";

function matchesDrillDownTargetAttribute(
    drillDefinition: IImplicitDrillDown,
    attribute: IAttribute,
): boolean {
    return attributeLocalId(attribute) === drillDownFromAttributeLocalId(drillDefinition);
}

enum ENUM_PROPERTIES_TYPE {
    CONTROLS = "controls",
}

export function modifyBucketsAttributesForDrillDown(
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
            const columns = value.columnWidths.filter((columnWidth: ColumnWidthItem) => {
                if (isAttributeColumnWidthItem(columnWidth)) {
                    return identifiers.includes(columnWidth.attributeColumnWidthItem.attributeIdentifier);
                }
                return true;
            });

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
            newPositiveAttributeFilter(uriRef(header.attributeHeader.uri), {
                uris: [header.attributeHeaderItem.uri],
            }),
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
): IDrillEventIntersectionElement[] {
    const index = intersection.findIndex(
        (item: IDrillEventIntersectionElement) =>
            isDrillIntersectionAttributeItem(item.header) &&
            item.header.attributeHeader.localIdentifier === localIdentifier,
    );

    return intersection.slice(index);
}
