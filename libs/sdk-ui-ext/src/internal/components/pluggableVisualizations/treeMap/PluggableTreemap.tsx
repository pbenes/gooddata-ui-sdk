// (C) 2019 GoodData Corporation
import React from "react";
import cloneDeep from "lodash/cloneDeep";
import isEmpty from "lodash/isEmpty";
import set from "lodash/set";
import tail from "lodash/tail";
import { BucketNames, IDrillEvent, VisualizationTypes } from "@gooddata/sdk-ui";
import { render } from "react-dom";
import { BUCKETS } from "../../../constants/bucket";
import { TREEMAP_SUPPORTED_PROPERTIES } from "../../../constants/supportedProperties";

import {
    DEFAULT_TREEMAP_UICONFIG,
    TREEMAP_UICONFIG_WITH_MULTIPLE_MEASURES,
    TREEMAP_UICONFIG_WITH_ONE_MEASURE,
    UICONFIG,
    TREEMAP_UICONFIG_WITH_MULTIPLE_MEASURES_MULTIPLE_DATES,
    TREEMAP_UICONFIG_WITH_ONE_MEASURE_MULTIPLE_DATES,
    DEFAULT_TREEMAP_UICONFIG_MULTIPLE_DATES,
} from "../../../constants/uiConfig";
import {
    IDrillDownContext,
    IExtendedReferencePoint,
    IImplicitDrillDown,
    IReferencePoint,
    IVisConstruct,
} from "../../../interfaces/Visualization";
import { configureOverTimeComparison, configurePercent } from "../../../utils/bucketConfig";

import {
    getAttributeItemsWithoutStacks,
    getMeasureItems,
    getStackItems,
    isDateBucketItem,
    limitNumberOfMeasuresInBuckets,
    removeAllArithmeticMeasuresFromDerived,
    removeAllDerivedMeasures,
    sanitizeFilters,
} from "../../../utils/bucketHelper";
import { getReferencePointWithSupportedProperties } from "../../../utils/propertiesHelper";
import { removeSort } from "../../../utils/sort";

import { setTreemapUiConfig } from "../../../utils/uiConfigHelpers/treemapUiConfigHelper";
import TreeMapConfigurationPanel from "../../configurationPanels/TreeMapConfigurationPanel";
import { PluggableBaseChart } from "../baseChart/PluggableBaseChart";
import { IInsight, IInsightDefinition } from "@gooddata/sdk-model";
import {
    addIntersectionFiltersToInsight,
    modifyBucketsAttributesForDrillDown,
    reverseAndTrimIntersection,
} from "../drillDownUtil";

export class PluggableTreemap extends PluggableBaseChart {
    constructor(props: IVisConstruct) {
        super(props);
        this.type = VisualizationTypes.TREEMAP;
        this.supportedPropertiesList = TREEMAP_SUPPORTED_PROPERTIES;
        this.initializeProperties(props.visualizationProperties);
    }

    private getBucketItemsWithMultipleDates(newReferencePoint: IReferencePoint): any {
        // TODO: unify
        const buckets = newReferencePoint?.buckets ?? [];
        let measures = getMeasureItems(buckets);
        let stacks = getStackItems(buckets);
        const nonStackAttributes = getAttributeItemsWithoutStacks(buckets);
        const view = nonStackAttributes.slice(0, 1);

        if (nonStackAttributes.length > 0) {
            measures = getMeasureItems(limitNumberOfMeasuresInBuckets(buckets, 1));
        }

        if (nonStackAttributes.length > 1 && isEmpty(stacks)) {
            // first attribute is taken, find next available
            const attributesWithoutFirst = tail(nonStackAttributes);
            stacks = attributesWithoutFirst.slice(0, 1);
        }

        return { measures, view, stacks };
    }

    private getBucketItems(newReferencePoint: IReferencePoint) {
        const buckets = newReferencePoint?.buckets ?? [];
        let measures = getMeasureItems(buckets);
        let stacks = getStackItems(buckets);
        const nonStackAttributes = getAttributeItemsWithoutStacks(buckets);
        const view = nonStackAttributes.slice(0, 1);

        if (nonStackAttributes.length > 0) {
            measures = getMeasureItems(limitNumberOfMeasuresInBuckets(buckets, 1));
        }

        if (nonStackAttributes.length > 1 && isEmpty(stacks)) {
            // first attribute is taken, find next available non-date attribute
            const attributesWithoutFirst = tail(nonStackAttributes);
            const nonDate = attributesWithoutFirst.filter((attribute) => !isDateBucketItem(attribute));
            stacks = nonDate.slice(0, 1);
        }

        return { measures, view, stacks };
    }

    protected configureBuckets(newReferencePoint: IExtendedReferencePoint): void {
        const { measures, view, stacks } = this.isMultipleDatesEnabled()
            ? this.getBucketItemsWithMultipleDates(newReferencePoint)
            : this.getBucketItems(newReferencePoint);

        set(newReferencePoint, BUCKETS, [
            {
                localIdentifier: BucketNames.MEASURES,
                items: measures,
            },
            {
                localIdentifier: BucketNames.VIEW,
                items: view,
            },
            {
                localIdentifier: BucketNames.SEGMENT,
                items: stacks,
            },
        ]);
    }

    public getExtendedReferencePoint(referencePoint: IReferencePoint): Promise<IExtendedReferencePoint> {
        const clonedReferencePoint = cloneDeep(referencePoint);
        let newReferencePoint: IExtendedReferencePoint = {
            ...clonedReferencePoint,
            uiConfig: cloneDeep(
                this.isMultipleDatesEnabled()
                    ? DEFAULT_TREEMAP_UICONFIG_MULTIPLE_DATES
                    : DEFAULT_TREEMAP_UICONFIG,
            ),
        };

        newReferencePoint = removeAllArithmeticMeasuresFromDerived(newReferencePoint);
        newReferencePoint = removeAllDerivedMeasures(newReferencePoint);

        const buckets = newReferencePoint?.buckets;
        const nonStackAttributes = getAttributeItemsWithoutStacks(buckets);
        let measures = getMeasureItems(buckets);

        if (nonStackAttributes.length > 0) {
            set(
                newReferencePoint,
                UICONFIG,
                cloneDeep(
                    this.isMultipleDatesEnabled()
                        ? TREEMAP_UICONFIG_WITH_ONE_MEASURE_MULTIPLE_DATES
                        : TREEMAP_UICONFIG_WITH_ONE_MEASURE,
                ),
            );
        } else if (measures.length > 1) {
            set(
                newReferencePoint,
                UICONFIG,
                cloneDeep(
                    this.isMultipleDatesEnabled()
                        ? TREEMAP_UICONFIG_WITH_MULTIPLE_MEASURES_MULTIPLE_DATES
                        : TREEMAP_UICONFIG_WITH_MULTIPLE_MEASURES,
                ),
            );
        }

        this.configureBuckets(newReferencePoint);

        newReferencePoint = setTreemapUiConfig(newReferencePoint, this.intl, this.type);
        newReferencePoint = configurePercent(newReferencePoint, false);
        newReferencePoint = configureOverTimeComparison(
            newReferencePoint,
            !!this.featureFlags["enableWeekFilters"],
        );
        newReferencePoint = getReferencePointWithSupportedProperties(
            newReferencePoint,
            this.supportedPropertiesList,
        );
        newReferencePoint = removeSort(newReferencePoint);

        return Promise.resolve(sanitizeFilters(newReferencePoint));
    }

    private addFilters(source: IInsight, drillConfig: IImplicitDrillDown, event: IDrillEvent) {
        const cutIntersection = reverseAndTrimIntersection(drillConfig, event.drillContext.intersection);
        return addIntersectionFiltersToInsight(source, cutIntersection);
    }

    public getInsightWithDrillDownApplied(source: IInsight, drillDownContext: IDrillDownContext): IInsight {
        const withFilters = this.addFilters(source, drillDownContext.drillDefinition, drillDownContext.event);
        return modifyBucketsAttributesForDrillDown(withFilters, drillDownContext.drillDefinition);
    }

    protected renderConfigurationPanel(insight: IInsightDefinition): void {
        if (document.querySelector(this.configPanelElement)) {
            render(
                <TreeMapConfigurationPanel
                    locale={this.locale}
                    references={this.references}
                    properties={this.visualizationProperties}
                    propertiesMeta={this.propertiesMeta}
                    insight={insight}
                    colors={this.colors}
                    pushData={this.handlePushData}
                    type={this.type}
                    isError={this.getIsError()}
                    isLoading={this.isLoading}
                    featureFlags={this.featureFlags}
                />,
                document.querySelector(this.configPanelElement),
            );
        }
    }
}
