// (C) 2019 GoodData Corporation
import { GdcVisualizationObject } from "@gooddata/gd-bear-model";
import {
    IFilter,
    isPositiveAttributeFilter,
    IPositiveAttributeFilter,
    filterAttributeElements,
    isAttributeElementsByRef,
    filterAttributeDisplayForm,
    INegativeAttributeFilter,
    isNegativeAttributeFilter,
    IRelativeDateFilter,
    isAbsoluteDateFilter,
    IAbsoluteDateFilter,
    isMeasureValueFilter,
    IMeasureValueFilter,
    measureValueFilterMeasure,
    measureValueFilterCondition,
    isIdentifierRef,
    IMeasureFilter,
    relativeDateFilterValues,
    absoluteDateFilterValues,
} from "@gooddata/sdk-model";

const convertMeasureValueFilter = (
    filter: IMeasureValueFilter,
): GdcVisualizationObject.IMeasureValueFilter => {
    const measureObjQualifier = measureValueFilterMeasure(filter);

    if (isIdentifierRef(measureObjQualifier)) {
        throw new Error("Cannot convert measure value filter for measure specified by identifier");
    }

    return {
        measureValueFilter: {
            measure: measureObjQualifier,
            condition: measureValueFilterCondition(filter),
        },
    };
};

const convertRelativeDateFilter = (
    filter: IRelativeDateFilter,
): GdcVisualizationObject.IRelativeDateFilter => {
    return {
        relativeDateFilter: {
            dataSet: filterAttributeDisplayForm(filter),
            ...relativeDateFilterValues(filter),
        },
    };
};

const convertAbsoluteDateFilter = (
    filter: IAbsoluteDateFilter,
): GdcVisualizationObject.IAbsoluteDateFilter => {
    return {
        absoluteDateFilter: {
            dataSet: filterAttributeDisplayForm(filter),
            ...absoluteDateFilterValues(filter),
        },
    };
};

const convertNegativeAttributeFilter = (
    filter: INegativeAttributeFilter,
): GdcVisualizationObject.INegativeAttributeFilter => {
    const elements = filterAttributeElements(filter);
    return {
        negativeAttributeFilter: {
            displayForm: filterAttributeDisplayForm(filter),
            notIn: isAttributeElementsByRef(elements) ? elements.uris : elements.values,
        },
    };
};

const convertPositiveAttributeFilter = (
    filter: IPositiveAttributeFilter,
): GdcVisualizationObject.IPositiveAttributeFilter => {
    const elements = filterAttributeElements(filter);
    return {
        positiveAttributeFilter: {
            displayForm: filterAttributeDisplayForm(filter),
            in: isAttributeElementsByRef(elements) ? elements.uris : elements.values,
        },
    };
};

export const convertExtendedFilter = (filter: IFilter): GdcVisualizationObject.ExtendedFilter => {
    if (isMeasureValueFilter(filter)) {
        return convertMeasureValueFilter(filter);
    } else {
        return convertFilter(filter);
    }
};

export const convertFilter = (filter: IMeasureFilter): GdcVisualizationObject.Filter => {
    if (isPositiveAttributeFilter(filter)) {
        return convertPositiveAttributeFilter(filter);
    } else if (isNegativeAttributeFilter(filter)) {
        return convertNegativeAttributeFilter(filter);
    } else if (isAbsoluteDateFilter(filter)) {
        return convertAbsoluteDateFilter(filter);
    } else {
        return convertRelativeDateFilter(filter);
    }
};