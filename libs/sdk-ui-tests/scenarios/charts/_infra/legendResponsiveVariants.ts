// (C) 2007-2019 GoodData Corporation

import { UnboundVisProps, CustomizedScenario } from "../../../src";
import { ILegendConfig, IBucketChartProps } from "@gooddata/sdk-ui-charts";

const LegendVariants: Array<[string, ILegendConfig]> = [
    ["legend on top", { position: "top", responsive: "popup" }],
    ["legend at bottom", { position: "bottom", responsive: "popup" }],
    ["legend on left", { position: "left", responsive: "popup" }],
    ["legend on right", { position: "right", responsive: "popup" }],
    ["auto legend", { position: "auto", responsive: "popup" }],
];

export function legendResponsiveVariants<T extends IBucketChartProps>(
    baseName: string,
    baseProps: UnboundVisProps<T>,
): Array<CustomizedScenario<T>> {
    return LegendVariants.map(([variantName, legendConfig]) => {
        return [
            `${baseName} - ${variantName}`,
            { ...baseProps, config: { ...baseProps.config, legend: legendConfig } },
        ];
    });
}
