// (C) 2020 GoodData Corporation
import {
    IAttribute,
    IAttributeOrMeasure,
    IBucket,
    IInsight,
    isAttribute,
    isMeasure,
    VisualizationProperties,
} from "@gooddata/sdk-model";
import flatMap from "lodash/flatMap";
import { IImplicitDrillDown } from "../../interfaces/Visualization";
import { isDrillIntersectionAttributeItem, IDrillEventIntersectionElement } from "@gooddata/sdk-ui";

function matchesDrillDownTargetAttribute(drillConfig: IImplicitDrillDown, attribute: IAttribute) {
    const drillSourceLocalIdentifier = drillConfig.implicitDrillDown.from.drillFromAttribute.localIdentifier;
    return attribute.attribute.localIdentifier === drillSourceLocalIdentifier;
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

export function removeAttributesFromBuckets(insight: IInsight, drillConfig: IImplicitDrillDown): IInsight {
    const modifiedBuckets: IBucket[] = [];

    insight.insight.buckets.forEach((b: IBucket) => {
        const items: { result: IAttributeOrMeasure[] } = b.items.reduce(
            (acc: { result: IAttributeOrMeasure[] }, i: IAttributeOrMeasure) => {
                if (isAttribute(i) && matchesDrillDownTargetAttribute(drillConfig, i)) {
                    const displayForm =
                        drillConfig.implicitDrillDown.target.drillToAttribute.attributeDisplayForm;
                    return {
                        result: [
                            {
                                ...i,
                                attribute: {
                                    ...i.attribute,
                                    displayForm,
                                    alias: undefined,
                                },
                            },
                        ],
                    };
                }

                return { result: [...acc.result, i] };
            },
            { result: [] },
        );

        modifiedBuckets.push({ ...b, items: [...items.result] });
    });

    return {
        ...insight,
        insight: {
            ...insight.insight,
            buckets: modifiedBuckets,
        },
    };
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
