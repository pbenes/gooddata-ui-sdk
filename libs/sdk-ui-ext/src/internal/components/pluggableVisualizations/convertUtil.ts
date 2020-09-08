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

// TODO use proper type
export type IImplicitDrillDown = any;

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

export function removeAttributesFromBuckets(
    insight: IInsight,
    drillConfig: IImplicitDrillDown,
): { insight: IInsight; removedItems: IAttribute[] } {
    const modifiedBuckets: IBucket[] = [];
    const removedItems: IAttribute[] = [];

    insight.insight.buckets.forEach((b: IBucket) => {
        const items: { removed: IAttribute[]; result: IAttributeOrMeasure[] } = b.items.reduce(
            (acc: { removed: IAttribute[]; result: IAttributeOrMeasure[] }, i: IAttributeOrMeasure) => {
                if (isAttribute(i) && matchesDrillDownTargetAttribute(drillConfig, i)) {
                    const displayForm =
                        drillConfig.implicitDrillDown.target.drillToAttribute.attributeDisplayForm;
                    return {
                        removed: [...acc.result].filter(isAttribute),
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

                return { removed: acc.removed, result: [...acc.result, i] };
            },
            { removed: [], result: [] },
        );

        modifiedBuckets.push({ ...b, items: [...items.result] });
        removedItems.push(...items.removed);
    });

    const resultInsight = {
        ...insight,
        insight: {
            ...insight.insight,
            buckets: modifiedBuckets,
        },
    };

    return {
        insight: resultInsight,
        removedItems: removedItems || [],
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
    let updatedInsight = removePropertiesForRemovedAttributes(insight);

    return updatedInsight;
}
