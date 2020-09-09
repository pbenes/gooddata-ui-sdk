// (C) 2019-2020 GoodData Corporation

import { InvariantError } from "ts-invariant";
import { bucketItemLocalId } from "../bucketItem";
import { newBucket } from "..";
import { Account, Won } from "../../../../__mocks__/model";
import { IAttribute } from "../../attribute";
import { IMeasure } from "../../measure";

describe("bucketItemLocalId", () => {
    it("should throw InvariantError if bucketItem is invalid type", () => {
        expect(() => bucketItemLocalId({} as any)).toThrowError(InvariantError);
    });

    it("should return valid localIdentifier for attribute bucketItem ", () => {
        const AttributeBucket1 = newBucket("attributeBucket1", Account.Name);
        const firstBucketItem: IAttribute = AttributeBucket1.items[0] as IAttribute;

        expect(bucketItemLocalId(firstBucketItem)).toBe(firstBucketItem.attribute.localIdentifier);
    });

    it("should return valid localIdentifier for measure bucketItem ", () => {
        const AttributeBucket1 = newBucket("measureBucket1", Won);
        const firstBucketItem: IMeasure = AttributeBucket1.items[0] as IMeasure;

        expect(bucketItemLocalId(firstBucketItem)).toBe(firstBucketItem.measure.localIdentifier);
    });
});
