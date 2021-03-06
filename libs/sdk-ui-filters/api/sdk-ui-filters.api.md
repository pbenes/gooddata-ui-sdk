## API Report File for "@gooddata/sdk-ui-filters"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts

import { DashboardDateFilterConfigMode } from '@gooddata/sdk-backend-spi';
import { DateFilterGranularity } from '@gooddata/sdk-backend-spi';
import { DateString } from '@gooddata/sdk-backend-spi';
import { IAbsoluteDateFilterForm } from '@gooddata/sdk-backend-spi';
import { IAbsoluteDateFilterPreset } from '@gooddata/sdk-backend-spi';
import { IAllTimeDateFilter } from '@gooddata/sdk-backend-spi';
import { IAnalyticalBackend } from '@gooddata/sdk-backend-spi';
import { IAttributeFilter } from '@gooddata/sdk-model';
import { IElementQueryOptions } from '@gooddata/sdk-backend-spi';
import { IElementQueryResult } from '@gooddata/sdk-backend-spi';
import { IMeasureValueFilter } from '@gooddata/sdk-model';
import { IRelativeDateFilterForm } from '@gooddata/sdk-backend-spi';
import { IRelativeDateFilterPreset } from '@gooddata/sdk-backend-spi';
import { IRelativeDateFilterPresetOfGranularity } from '@gooddata/sdk-backend-spi';
import { ISeparators } from '@gooddata/sdk-ui';
import { ObjRef } from '@gooddata/sdk-model';
import { OnError } from '@gooddata/sdk-ui';
import { default as React_2 } from 'react';
import { RelativeGranularityOffset } from '@gooddata/sdk-backend-spi';

// @alpha
export type AbsoluteDateFilterOption = IUiAbsoluteDateFilterForm | IAbsoluteDateFilterPreset;

// Warning: (ae-forgotten-export) The symbol "IAttributeElementsProps" needs to be exported by the entry point index.d.ts
//
// @public
export const AttributeElements: React_2.ComponentType<IAttributeElementsProps>;

// Warning: (ae-forgotten-export) The symbol "IAttributeFilterProps" needs to be exported by the entry point index.d.ts
//
// @public
export const AttributeFilter: React_2.ComponentType<IAttributeFilterProps>;

// Warning: (ae-forgotten-export) The symbol "IDateFilterState" needs to be exported by the entry point index.d.ts
//
// @beta (undocumented)
export class DateFilter extends React_2.PureComponent<IDateFilterProps, IDateFilterState> {
    constructor(props: IDateFilterProps);
    // (undocumented)
    static defaultProps: Partial<IDateFilterProps>;
    // (undocumented)
    static getDerivedStateFromProps(nextProps: IDateFilterProps, prevState: IDateFilterState): IDateFilterState;
    // (undocumented)
    render(): React_2.ReactNode;
}

// @beta (undocumented)
export const DateFilterHelpers: {
    validateFilterOption: (filterOption: import("./interfaces").DateFilterOption) => import("./interfaces").IExtendedDateFilterErrors;
    getDateFilterTitle: (filter: import("./interfaces").DateFilterOption, locale: import("@gooddata/sdk-ui").ILocale) => string;
    getDateFilterTitleUsingTranslator: (filter: import("./interfaces").DateFilterOption, translator: import("./utils/Translations/Translators").IDateAndMessageTranslator) => string;
    getDateFilterRepresentation: (filter: import("./interfaces").DateFilterOption, locale: import("@gooddata/sdk-ui").ILocale) => string;
    granularityIntlCodes: {
        "GDC.time.year": import("./constants/i18n").GranularityIntlKey;
        "GDC.time.week_us": import("./constants/i18n").GranularityIntlKey;
        "GDC.time.quarter": import("./constants/i18n").GranularityIntlKey;
        "GDC.time.month": import("./constants/i18n").GranularityIntlKey;
        "GDC.time.date": import("./constants/i18n").GranularityIntlKey;
    };
    applyExcludeCurrentPeriod: (dateFilterOption: import("./interfaces").DateFilterOption, excludeCurrentPeriod: boolean) => import("./interfaces").DateFilterOption;
    defaultDateFilterOptions: import("./interfaces").IDateFilterOptionsByType;
    canExcludeCurrentPeriod: (dateFilterOption: import("./interfaces").DateFilterOption) => boolean;
    mapOptionToAfm: (value: import("./interfaces").DateFilterOption, dateDataSet: import("@gooddata/sdk-model").ObjRef, excludeCurrentPeriod: boolean) => import("@gooddata/sdk-model").IDateFilter;
};

// @alpha
export type DateFilterOption = IAllTimeDateFilter | AbsoluteDateFilterOption | RelativeDateFilterOption;

// @alpha
export type DateFilterRelativeOptionGroup = {
    [key in DateFilterGranularity]?: Array<IRelativeDateFilterPresetOfGranularity<key>>;
};

// Warning: (ae-incompatible-release-tags) The symbol "defaultDateFilterOptions" is marked as @beta, but its signature references "IDateFilterOptionsByType" which is marked as @alpha
//
// @beta (undocumented)
export const defaultDateFilterOptions: IDateFilterOptionsByType;

// @beta (undocumented)
export interface IDateFilterCallbackProps {
    // Warning: (ae-incompatible-release-tags) The symbol "onApply" is marked as @beta, but its signature references "DateFilterOption" which is marked as @alpha
    //
    // (undocumented)
    onApply: (dateFilterOption: DateFilterOption, excludeCurrentPeriod: boolean) => void;
    // (undocumented)
    onCancel?: () => void;
    // (undocumented)
    onClose?: () => void;
    // (undocumented)
    onOpen?: () => void;
}

// @alpha
export interface IDateFilterOptionsByType {
    absoluteForm?: IUiAbsoluteDateFilterForm;
    absolutePreset?: IAbsoluteDateFilterPreset[];
    allTime?: IAllTimeDateFilter;
    relativeForm?: IUiRelativeDateFilterForm;
    relativePreset?: DateFilterRelativeOptionGroup;
}

// Warning: (ae-forgotten-export) The symbol "IStatePropsIntersection" needs to be exported by the entry point index.d.ts
//
// @beta (undocumented)
export interface IDateFilterOwnProps extends IStatePropsIntersection {
    // (undocumented)
    availableGranularities: DateFilterGranularity[];
    // (undocumented)
    customFilterName?: string;
    // (undocumented)
    dateFilterMode: DashboardDateFilterConfigMode;
    // Warning: (ae-incompatible-release-tags) The symbol "filterOptions" is marked as @beta, but its signature references "IDateFilterOptionsByType" which is marked as @alpha
    //
    // (undocumented)
    filterOptions: IDateFilterOptionsByType;
    // (undocumented)
    isEditMode?: boolean;
    // (undocumented)
    locale?: string;
}

// @beta (undocumented)
export interface IDateFilterProps extends IDateFilterOwnProps, IDateFilterCallbackProps {
}

// @alpha
export interface IExtendedDateFilterErrors {
    absoluteForm?: {
        from?: string;
        to?: string;
    };
    relativeForm?: {
        from?: string;
        to?: string;
    };
}

// Warning: (ae-forgotten-export) The symbol "IMeasureValueFilterCommonProps" needs to be exported by the entry point index.d.ts
//
// @beta (undocumented)
export interface IMeasureValueFilterDropdownProps extends IMeasureValueFilterCommonProps {
    // (undocumented)
    anchorEl?: EventTarget | string;
    // (undocumented)
    onCancel: () => void;
}

// @beta (undocumented)
export interface IMeasureValueFilterProps extends IMeasureValueFilterCommonProps {
    // (undocumented)
    buttonTitle: string;
    // (undocumented)
    onCancel?: () => void;
}

// @beta (undocumented)
export interface IMeasureValueFilterState {
    // (undocumented)
    displayDropdown: boolean;
}

// @alpha
export const isAbsoluteDateFilterOption: (obj: unknown) => obj is AbsoluteDateFilterOption;

// @alpha
export const isRelativeDateFilterOption: (obj: unknown) => obj is RelativeDateFilterOption;

// @alpha
export interface IUiAbsoluteDateFilterForm extends IAbsoluteDateFilterForm {
    from?: DateString;
    to?: DateString;
}

// @alpha
export interface IUiRelativeDateFilterForm extends IRelativeDateFilterForm {
    from?: RelativeGranularityOffset;
    granularity?: DateFilterGranularity;
    to?: RelativeGranularityOffset;
}

// @beta (undocumented)
export class MeasureValueFilter extends React_2.PureComponent<IMeasureValueFilterProps, IMeasureValueFilterState> {
    // (undocumented)
    static defaultProps: Partial<IMeasureValueFilterProps>;
    // (undocumented)
    render(): React_2.ReactNode;
    // (undocumented)
    state: IMeasureValueFilterState;
    }

// @beta (undocumented)
export class MeasureValueFilterDropdown extends React_2.PureComponent<IMeasureValueFilterDropdownProps> {
    // (undocumented)
    static defaultProps: Partial<IMeasureValueFilterDropdownProps>;
    // (undocumented)
    render(): React_2.ReactNode;
}

// @alpha
export type RelativeDateFilterOption = IUiRelativeDateFilterForm | IRelativeDateFilterPreset;


// (No @packageDocumentation comment for this package)

```
