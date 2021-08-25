// (C) 2021 GoodData Corporation

import {
    newRelativeDateFilter,
    IRelativeDateFilter,
    idRef,
    DateAttributeGranularity,
} from "@gooddata/sdk-model";

import { getRelativeDateFilterShiftedValyes } from "../date";

const generateRelativeDateFilter = (granularity: DateAttributeGranularity) =>
    newRelativeDateFilter(idRef("gdc/uri/rf"), granularity, -3, 0);

describe("getRelativeDateFilterShiftedValyes", () => {
    it.each([
        ["day", generateRelativeDateFilter("GDC.time.date")],
        ["month", generateRelativeDateFilter("GDC.time.month")],
        ["quarter", generateRelativeDateFilter("GDC.time.quarter")],
        ["year", generateRelativeDateFilter("GDC.time.year")],
    ])(
        "should return correct from to date values for %s granularity",
        (_granularity: string, relativeDateFilter: IRelativeDateFilter) => {
            const result = getRelativeDateFilterShiftedValyes(relativeDateFilter);
            expect(result).toMatchSnapshot();
        },
    );
});
