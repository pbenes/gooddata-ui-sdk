// (C) 2019 GoodData Corporation
import React from "react";
import { WrappedComponentProps, injectIntl } from "react-intl";
import DropdownControl from "./DropdownControl";

import { dataLabelsDropdownItems } from "../../constants/dropdowns";
import { getTranslatedDropdownItems } from "../../utils/translations";
import { IVisualizationProperties } from "../../interfaces/Visualization";

export interface IDataLabelsControlProps {
    pushData: (data: any) => any;
    properties: IVisualizationProperties;
    isDisabled: boolean;
    showDisabledMessage?: boolean;
    defaultValue?: string | boolean;
    showTotals?: boolean;
}

class DataLabelsControl extends React.Component<IDataLabelsControlProps & WrappedComponentProps> {
    public static defaultProps = {
        defaultValue: "auto",
        showDisabledMessage: false,
        showTotals: false,
    };
    public render() {
        const { showTotals, pushData, properties, intl, isDisabled, showDisabledMessage, defaultValue } =
            this.props;
        const dataLabels = properties?.controls?.dataLabels?.visible ?? defaultValue;
        const totalLabels = properties?.controls?.totalLabels?.visible ?? defaultValue;

        return (
            <div className="s-data-labels-config">
                <DropdownControl
                    value={dataLabels}
                    valuePath="dataLabels.visible"
                    labelText="properties.canvas.dataLabels"
                    disabled={isDisabled}
                    properties={properties}
                    pushData={pushData}
                    items={getTranslatedDropdownItems(dataLabelsDropdownItems, intl)}
                    showDisabledMessage={showDisabledMessage}
                />
                {showTotals && (
                    <DropdownControl
                        value={totalLabels}
                        valuePath="totalLabels.visible"
                        labelText="properties.canvas.totalLabels"
                        disabled={isDisabled}
                        properties={properties}
                        pushData={pushData}
                        items={getTranslatedDropdownItems(dataLabelsDropdownItems, intl)}
                        showDisabledMessage={showDisabledMessage}
                    />
                )}
            </div>
        );
    }
}

export default injectIntl(DataLabelsControl);
