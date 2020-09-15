// (C) 2020 GoodData Corporation
import { InvariantError } from "ts-invariant";
import { uniqWith } from "lodash";

import { IInsightDefinition, insightAttributes, insightBuckets, insightSetBuckets, insightSorts } from ".";
import {
    bucketAttributeIndex,
    bucketSetTotals,
    bucketTotals,
    IBucket,
    newBucket,
} from "../execution/buckets";
import { isAttributeSort, isMeasureSort, ISortItem, sortEntityIds } from "../execution/base/sort";
import { ITotal } from "../execution/base/totals";
import { attributeLocalId, isAttribute } from "../execution/attribute";
import { areObjRefsEqual } from "../objRef";
/**
 * Makes sure the insight does not have any nonsensical data (like totals that no longer make sense, etc.), before it is saved.
 *
 * @param insight - the insight or insight definition to sanitize
 * @public
 */
export function insightSanitize<T extends IInsightDefinition>(insight: T): T {
    return removeInvalidTotals(removeDuplicateDrillAttributes(insight));
}

function removeDuplicateDrillAttributes<T extends IInsightDefinition>(insight: T): T {
    const removed = insightBuckets(insight).map((bucket) => {
        if (bucket.localIdentifier === "attribute") {
            return newBucket(
                bucket.localIdentifier,
                ...uniqWith(bucket.items, (firstItem, secondItem) => {
                    if (isAttribute(firstItem) && isAttribute(secondItem)) {
                        return areObjRefsEqual(
                            firstItem.attribute.displayForm,
                            secondItem.attribute.displayForm,
                        );
                    }

                    return false;
                }),
            );
        }

        return bucket;
    });

    return insightSetBuckets(insight, removed);
}

function removeInvalidTotals<T extends IInsightDefinition>(insight: T): T {
    const sortItems = insightSorts(insight);

    const attributeIdentifiers = insightAttributes(insight).map(attributeLocalId);
    const sanitizedBuckets = insightBuckets(insight).map((bucket) => {
        const totals = bucketTotals(bucket);

        if (totals.length && isSortedOnDifferentThanFirstAttributeInBucket(bucket, sortItems)) {
            bucket.totals = getBucketTotalsWithoutSubtotals(bucket);
            if (totals.length === 0) {
                return bucketSetTotals(bucket, []);
            }
        }

        const sanitizedTotals = totals.filter((total) =>
            attributeIdentifiers.includes(total.attributeIdentifier),
        );
        if (sanitizedTotals.length !== totals.length) {
            return bucketSetTotals(bucket, sanitizedTotals);
        }

        return bucket;
    });

    return insightSetBuckets(insight, sanitizedBuckets);
}

function isSortedOnDifferentThanFirstAttributeInBucket(bucket: IBucket, sortItems: ISortItem[]): boolean {
    return sortItems.some((sortItem) => {
        if (isAttributeSort(sortItem)) {
            const attributeIdentifier = sortEntityIds(sortItem).attributeIdentifiers[0];
            const attributeIndex = bucketAttributeIndex(bucket, attributeIdentifier);
            return attributeIndex > 0;
        } else if (isMeasureSort(sortItem)) {
            return true;
        }
        throw new InvariantError(
            'Unexpected sortType, only supported sortTypes are "attributeSortItem" and "measureSortItem"',
        );
    });
}

function getBucketTotalsWithoutSubtotals(bucket: IBucket): ITotal[] {
    return bucketTotals(bucket).filter(
        (total) => bucketAttributeIndex(bucket, total.attributeIdentifier) === 0,
    );
}
