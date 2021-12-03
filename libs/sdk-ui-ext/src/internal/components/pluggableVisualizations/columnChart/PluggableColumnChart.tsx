// (C) 2019 GoodData Corporation
import { PluggableColumnBarCharts } from "../PluggableColumnBarCharts";
import { AXIS, AXIS_NAME } from "../../../constants/axis";
import { COLUMN_CHART_SUPPORTED_PROPERTIES } from "../../../constants/supportedProperties";
import { IVisConstruct } from "../../../interfaces/Visualization";
import { VisualizationTypes } from "@gooddata/sdk-ui";

export class PluggableColumnChart extends PluggableColumnBarCharts {
    constructor(props: IVisConstruct) {
        super(props);
        this.secondaryAxis = AXIS_NAME.SECONDARY_Y;
        this.type = VisualizationTypes.COLUMN;
        this.defaultControlsProperties = {
            stackMeasures: false,
        };
        this.initializeProperties(props.visualizationProperties);
    }

    public getSupportedPropertiesList(): string[] {
        // TODO: maybe here the properties totalLabels.visible should be always
        return COLUMN_CHART_SUPPORTED_PROPERTIES[this.axis || AXIS.DUAL] || [];
    }
}
