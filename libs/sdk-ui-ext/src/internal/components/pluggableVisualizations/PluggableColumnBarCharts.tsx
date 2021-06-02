// (C) 2019 GoodData Corporation
import set from "lodash/set";
import cloneDeep from "lodash/cloneDeep";
import {
    bucketIsEmpty,
    bucketsItems,
    IInsight,
    IInsightDefinition,
    insightBucket,
    insightBuckets,
} from "@gooddata/sdk-model";
import { arrayUtils } from "@gooddata/util";
import {
    BucketNames,
    getIntersectionPartAfter,
    IDrillEvent,
    IDrillEventIntersectionElement,
} from "@gooddata/sdk-ui";
import { AXIS } from "../../constants/axis";
import { ATTRIBUTE, BUCKETS, DATE } from "../../constants/bucket";
import {
    COLUMN_BAR_CHART_UICONFIG,
    COLUMN_BAR_CHART_UICONFIG_WITH_MULTIPLE_DATES,
    MAX_CATEGORIES_COUNT,
    MAX_STACKS_COUNT,
} from "../../constants/uiConfig";
import { drillDownFromAttributeLocalId } from "../../utils/ImplicitDrillDownHelper";
import {
    IDrillDownContext,
    IExtendedReferencePoint,
    IImplicitDrillDown,
    IReferencePoint,
    IUiConfig,
    IVisConstruct,
} from "../../interfaces/Visualization";
import {
    getAllCategoriesAttributeItems,
    getDateItems,
    getFilteredMeasuresForStackedCharts,
    getMainDateItem,
    getStackItems,
    removeDivergentDateItems,
    isDateBucketItem,
    isNotDateBucketItem,
    sanitizeFilters,
    hasSameDateDimension,
} from "../../utils/bucketHelper";
import {
    getReferencePointWithSupportedProperties,
    isStackingMeasure,
    isStackingToPercent,
    removeImmutableOptionalStackingProperties,
    setSecondaryMeasures,
} from "../../utils/propertiesHelper";
import { setColumnBarChartUiConfig } from "../../utils/uiConfigHelpers/columnBarChartUiConfigHelper";
import { PluggableBaseChart } from "./baseChart/PluggableBaseChart";
import { addIntersectionFiltersToInsight, modifyBucketsAttributesForDrillDown } from "./drillDownUtil";
import { configureOverTimeComparison, configurePercent } from "../../utils/bucketConfig";
import {
    setBaseChartUiConfig,
    setBaseChartUiConfigRecommendations,
} from "../../utils/uiConfigHelpers/baseChartUiConfigHelper";
import { removeSort } from "../../utils/sort";

export class PluggableColumnBarCharts extends PluggableBaseChart {
    constructor(props: IVisConstruct) {
        super(props);
        // set default to DUAL to get the full supported props list
        // and will be updated in getExtendedReferencePoint
        this.axis = AXIS.DUAL;
        this.supportedPropertiesList = this.getSupportedPropertiesList();
    }

    public getUiConfig(): IUiConfig {
        const multipleDateFF = !!this.featureFlags.enableMultipleDatesDEV;
        const config = multipleDateFF
            ? COLUMN_BAR_CHART_UICONFIG_WITH_MULTIPLE_DATES
            : COLUMN_BAR_CHART_UICONFIG;
        return cloneDeep(config);
    }

    /**
     * TODO: just copied and merged together
     * TODO: refactor the whole method
     */
    public getSdkExtendedReferencePoint(referencePoint: IReferencePoint): Promise<IExtendedReferencePoint> {
        const clonedReferencePoint = cloneDeep(referencePoint);
        const uiConfig = this.getUiConfig();
        let newReferencePoint: IExtendedReferencePoint = {
            ...clonedReferencePoint,
            uiConfig,
        };

        this.configureSdkBuckets(newReferencePoint);

        newReferencePoint = configurePercent(newReferencePoint, false);
        newReferencePoint = configureOverTimeComparison(
            newReferencePoint,
            !!this.featureFlags["enableWeekFilters"],
        );
        newReferencePoint = setBaseChartUiConfigRecommendations(
            newReferencePoint,
            this.type,
            !!this.featureFlags["enableWeekFilters"],
        );
        newReferencePoint = getReferencePointWithSupportedProperties(
            newReferencePoint,
            this.supportedPropertiesList,
        );

        // todo move predicate to the new function
        const buckets = newReferencePoint?.buckets ?? [];
        const hasNoStacks = () => getStackItems(buckets, [ATTRIBUTE, DATE]).length === 0;

        newReferencePoint = setBaseChartUiConfig(newReferencePoint, this.intl, this.type, hasNoStacks);
        newReferencePoint = removeSort(newReferencePoint);
        newReferencePoint = sanitizeFilters(newReferencePoint);

        // reset the list to retrieve full 'referencePoint.properties.controls'
        this.supportedPropertiesList = this.getSupportedPropertiesList();

        let newExt = setSecondaryMeasures(newReferencePoint, this.secondaryAxis);

        this.axis = newExt?.uiConfig?.axis ?? AXIS.PRIMARY;

        // filter out unnecessary stacking props for some specific cases such as one measure or empty stackBy
        this.supportedPropertiesList = removeImmutableOptionalStackingProperties(
            newExt,
            this.getSupportedPropertiesList(),
        );

        newExt = getReferencePointWithSupportedProperties(newExt, this.supportedPropertiesList);
        newExt = setColumnBarChartUiConfig(newExt, this.intl);

        return Promise.resolve(newExt);
    }

    public getExtendedReferencePoint(referencePoint: IReferencePoint): Promise<IExtendedReferencePoint> {
        // reset the list to retrieve full 'referencePoint.properties.controls'
        this.supportedPropertiesList = this.getSupportedPropertiesList();
        return super.getExtendedReferencePoint(referencePoint).then((ext: IExtendedReferencePoint) => {
            let newExt = setSecondaryMeasures(ext, this.secondaryAxis);

            this.axis = newExt?.uiConfig?.axis ?? AXIS.PRIMARY;

            // filter out unnecessary stacking props for some specific cases such as one measure or empty stackBy
            this.supportedPropertiesList = removeImmutableOptionalStackingProperties(
                newExt,
                this.getSupportedPropertiesList(),
            );

            newExt = getReferencePointWithSupportedProperties(newExt, this.supportedPropertiesList);
            return setColumnBarChartUiConfig(newExt, this.intl);
        });
    }

    public isOpenAsReportSupported(): boolean {
        return (
            super.isOpenAsReportSupported() &&
            !haveManyViewItems(this.currentInsight) &&
            !isStackingMeasure(this.visualizationProperties) &&
            !isStackingToPercent(this.visualizationProperties)
        );
    }

    private adjustIntersectionForColumnBar(
        source: IInsight,
        event: IDrillEvent,
    ): IDrillEventIntersectionElement[] {
        const stackBucket = insightBucket(source, BucketNames.STACK);
        const hasStackByAttributes = stackBucket && !bucketIsEmpty(stackBucket);

        const intersection = event.drillContext.intersection;
        return hasStackByAttributes ? arrayUtils.shiftArrayRight(intersection) : intersection;
    }

    private addFiltersForColumnBar(source: IInsight, drillConfig: IImplicitDrillDown, event: IDrillEvent) {
        const clicked = drillDownFromAttributeLocalId(drillConfig);

        const reorderedIntersection = this.adjustIntersectionForColumnBar(source, event);
        const cutIntersection = getIntersectionPartAfter(reorderedIntersection, clicked);
        return addIntersectionFiltersToInsight(source, cutIntersection);
    }

    public getInsightWithDrillDownApplied(source: IInsight, drillDownContext: IDrillDownContext): IInsight {
        const withFilters = this.addFiltersForColumnBar(
            source,
            drillDownContext.drillDefinition,
            drillDownContext.event,
        );
        return modifyBucketsAttributesForDrillDown(withFilters, drillDownContext.drillDefinition);
    }

    protected configureBuckets(extendedReferencePoint: IExtendedReferencePoint): void {
        const buckets = extendedReferencePoint?.buckets ?? [];
        const measures = getFilteredMeasuresForStackedCharts(buckets);
        const dateItems = getDateItems(buckets);
        const mainDateItem = getMainDateItem(dateItems);
        const categoriesCount =
            extendedReferencePoint.uiConfig?.buckets?.[BucketNames.VIEW]?.itemsLimit ?? MAX_CATEGORIES_COUNT;
        const allAttributesWithoutStacks = getAllCategoriesAttributeItems(buckets);
        const allAttributesWithoutStacksWithDatesHandled = removeDivergentDateItems(
            allAttributesWithoutStacks,
            mainDateItem,
        );
        let views = allAttributesWithoutStacksWithDatesHandled.slice(0, categoriesCount);
        const hasDateItemInViewByBucket = views.some(isDateBucketItem);
        let stackItemIndex = categoriesCount;
        let stacks = getStackItems(buckets);

        if (dateItems.length && !hasDateItemInViewByBucket) {
            const extraViewItems = allAttributesWithoutStacksWithDatesHandled.slice(0, categoriesCount - 1);
            views = [mainDateItem, ...extraViewItems];
            stackItemIndex = categoriesCount - 1;
        }

        const hasSomeRemainingAttributes = allAttributesWithoutStacksWithDatesHandled.length > stackItemIndex;

        if (!stacks.length && measures.length <= 1 && hasSomeRemainingAttributes) {
            stacks = allAttributesWithoutStacksWithDatesHandled
                .slice(stackItemIndex, allAttributesWithoutStacksWithDatesHandled.length)
                .filter(isNotDateBucketItem)
                .slice(0, MAX_STACKS_COUNT);
        }

        set(extendedReferencePoint, BUCKETS, [
            {
                localIdentifier: BucketNames.MEASURES,
                items: measures,
            },
            {
                localIdentifier: BucketNames.VIEW,
                items: views,
            },
            {
                localIdentifier: BucketNames.STACK,
                items: stacks,
            },
        ]);
    }

    /**
     * TODO: originally copied from configureBuckets
     * TODO: consider refactoring of the whole method
     */
    private configureSdkBuckets(extendedReferencePoint: IExtendedReferencePoint): void {
        const buckets = extendedReferencePoint?.buckets ?? [];
        const measures = getFilteredMeasuresForStackedCharts(buckets);

        // const dateItems = getDateItems(buckets);
        // const mainDateItem = getMainDateItem(dateItems);
        // const categoriesCount =
        //     extendedReferencePoint.uiConfig?.buckets?.[BucketNames.VIEW]?.itemsLimit ?? MAX_CATEGORIES_COUNT;

        let allAttributesWithoutStacks = getAllCategoriesAttributeItems(buckets);
        let stacks = getStackItems(buckets, [ATTRIBUTE, DATE]);

        const firstAttribute = allAttributesWithoutStacks[0];
        const isFirstAttributeDate = firstAttribute && firstAttribute.type === DATE;

        allAttributesWithoutStacks.splice(0, 1);

        let views = firstAttribute ? [firstAttribute] : [];

        for (let i = 0; i < allAttributesWithoutStacks.length; i++) {
            const isCurrentAttributeDate = allAttributesWithoutStacks[i].type === DATE;

            if (isFirstAttributeDate && isCurrentAttributeDate) {
                const sameDateDimension = hasSameDateDimension(firstAttribute, allAttributesWithoutStacks[i]);
                if (sameDateDimension) {
                    views.push(allAttributesWithoutStacks[i]);

                    allAttributesWithoutStacks.splice(i, 1);
                }
            }
        }

        if (!stacks.length) {
            stacks = allAttributesWithoutStacks.slice(0, MAX_STACKS_COUNT);
        }

        // console.log("allAttributesWithoutStacks", allAttributesWithoutStacks);
        // let views = allAttributesWithoutStacks.slice(0, categoriesCount);
        // const hasDateItemInViewByBucket = views.some(isDateBucketItem);
        // const countOfStackDateItems = stacks.filter(isDateBucketItem).length;
        //
        // console.log("views", views);
        // console.log("stacks", stacks);
        // console.log("dateItems", dateItems);
        //
        // let stackItemIndex = categoriesCount;
        //
        // if (dateItems.length && !hasDateItemInViewByBucket && countOfStackDateItems < 1) {
        //     const extraViewItems = allAttributesWithoutStacks.slice(0, categoriesCount - 1);
        //     views = [mainDateItem, ...extraViewItems];
        //     stackItemIndex = categoriesCount - 1;
        // }
        //
        // const hasSomeRemainingAttributes = allAttributesWithoutStacks.length > stackItemIndex;
        //
        // if (!stacks.length && measures.length <= 1 && hasSomeRemainingAttributes) {
        //     stacks = allAttributesWithoutStacks
        //         .slice(stackItemIndex, allAttributesWithoutStacks.length)
        //         .slice(0, MAX_STACKS_COUNT);
        // }

        set(extendedReferencePoint, BUCKETS, [
            {
                localIdentifier: BucketNames.MEASURES,
                items: measures,
            },
            {
                localIdentifier: BucketNames.VIEW,
                items: views,
            },
            {
                localIdentifier: BucketNames.STACK,
                items: stacks,
            },
        ]);
    }
}

function haveManyViewItems(insight: IInsightDefinition): boolean {
    return bucketsItems(insightBuckets(insight, BucketNames.VIEW)).length > 1;
}
