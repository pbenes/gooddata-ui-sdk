// (C) 2007-2019 GoodData Corporation
import { ScenarioCustomizer, scenariosFor, UnboundVisProps, VisProps } from "../../../src";

export interface IResponsiveSize {
    label?: string;
    width: number;
    height: number;
}

export function responsiveScenarios<T extends VisProps>(
    chart: string,
    groupNames: string[],
    component: React.ComponentType<T>,
    baseProps: UnboundVisProps<T>,
    sizes: Array<IResponsiveSize>,
    generateInsight: boolean = false,
    customizer?: ScenarioCustomizer<T>,
) {
    const tags = generateInsight ? [] : ["mock-no-insight"];

    return sizes.map((size) => {
        const groupLabel = size.label ? size.label : `${size.width}x${size.height}`;

        const label = size.label
            ? `${size.width}x${size.height} - ${size.label}`
            : `${size.width}x${size.height}`;

        const scenario = scenariosFor<T>(chart, component)
            .withGroupNames(...groupNames)
            .withVisualTestConfig({
                groupUnder: groupLabel,
                screenshotSize: { width: size.width, height: size.height },
            })
            .withDefaultTags("vis-config-only", "mock-no-scenario-meta", ...tags);

        if (customizer) {
            scenario.addScenarios(label, baseProps, customizer);
        } else {
            scenario.addScenario(label, baseProps);
        }

        return scenario;
    });
}
