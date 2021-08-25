// (C) 2021 GoodData Corporation
import moment, { Moment } from "moment";
import { IRelativeDateFilter } from "@gooddata/sdk-model";

enum DATE_GRANULARITY {
    DATE = "GDC.time.date",
    WEEK = "GDC.time.week_us",
    MONTH = "GDC.time.month",
    QUARTER = "GDC.time.quarter",
    YEAR = "GDC.time.year",
}

const iterateDates = (start: Moment, end: Moment) => {
    let wholeDates: any = [];
    while (start <= end) {
        wholeDates.push(start.format("MM/DD/YYYY"));
        const newDate = start.add(1, "days");
        start = newDate;
    }

    return wholeDates;
};

export const getRelativeDateFilterShiftedValyes = (relativeDateFilter: IRelativeDateFilter) => {
    const { from, to, granularity } = relativeDateFilter.relativeDateFilter;

    let startDate;
    switch (granularity) {
        case DATE_GRANULARITY.YEAR: {
            startDate = moment().add(from, "years").set("month", 0).set("date", 1);
            const endDate = moment().add(to, "years").set("month", 12).set("date", 0);

            return iterateDates(startDate, endDate);
        }

        case DATE_GRANULARITY.MONTH: {
            startDate = moment().add(from, "months").set("date", 1);
            const endDate = moment()
                .add(to + 1, "months")
                .set("date", 0);

            return iterateDates(startDate, endDate);
        }

        case DATE_GRANULARITY.DATE: {
            startDate = moment().add(from, "days");
            const endDate = moment().add(to, "days");

            return iterateDates(startDate, endDate);
        }

        case DATE_GRANULARITY.QUARTER: {
            startDate = getFirstDayQuarter(from);
            const endDate = getLastDayQuarter(to);

            return iterateDates(startDate, endDate);
        }
    }
};

const getFirstDayQuarter = (from: number) => {
    const { date, month } = getQuarterDateAndMonth(from);

    let result: any;
    if (month <= 3) {
        result = date.set("month", 0).set("date", 1);
    } else if (month <= 6) {
        result = date.set("month", 3).set("date", 1);
    } else if (month <= 9) {
        result = date.set("month", 6).set("date", 1);
    } else if (month <= 12) {
        result = date.set("month", 9).set("date", 1);
    }

    return result;
};

const getLastDayQuarter = (to: number) => {
    const { date, month } = getQuarterDateAndMonth(to);

    let result: any;
    if (month <= 3) {
        result = date.set("month", 3).set("date", 0);
    } else if (month <= 6) {
        result = date.set("month", 6).set("date", 0);
    } else if (month <= 9) {
        result = date.set("month", 9).set("date", 0);
    } else if (month <= 12) {
        result = date.set("month", 12).set("date", 0);
    }

    return result;
};

const getQuarterDateAndMonth = (value: number) => {
    const date = moment().add("months", value * 3);

    return {
        date,
        month: date.get("month"),
    };
};
