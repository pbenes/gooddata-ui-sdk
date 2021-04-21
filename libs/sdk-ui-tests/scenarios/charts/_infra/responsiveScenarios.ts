// (C) 2007-2019 GoodData Corporation
import { ScenarioCustomizer, scenariosFor, UnboundVisProps, VisProps } from "../../../src";

export interface IResponsiveSize {
    label: string;
    width: number;
    height: number;
}

export function responsiveScenarios<T extends VisProps>(
    chart: string,
    groupNames: string[],
    component: React.ComponentType<T>,
    baseProps: UnboundVisProps<T>,
    customizer: ScenarioCustomizer<T>,
    sizes: Array<IResponsiveSize>,
) {
    return sizes.map((size) => {
        const label = `${size.width}x${size.height} - ${size.label}`;
        return scenariosFor<T>(chart, component)
            .withGroupNames(...groupNames)
            .withVisualTestConfig({
                groupUnder: size.label,
                screenshotSize: { width: size.width, height: size.height },
            })
            .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
            .addScenarios(label, baseProps, customizer);
    });
}
