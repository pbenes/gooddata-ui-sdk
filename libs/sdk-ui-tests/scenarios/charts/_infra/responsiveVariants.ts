// (C) 2007-2019 GoodData Corporation
import { ScenarioCustomizer, scenariosFor, UnboundVisProps, VisProps } from "../../../src";

export interface IResponsiveSize {
    label: string;
    width: number;
    height: number;
}

const SizeVariants: Array<IResponsiveSize> = [
    { label: "310x230", width: 310, height: 230 },
    { label: "620x230", width: 620, height: 230 },
    { label: "820x530", width: 820, height: 530 },
    { label: "820x250", width: 820, height: 250 },
];

export function legendResponsiveScenarios<T extends VisProps>(
    chart: string,
    groupNames: string[],
    component: React.ComponentType<T>,
    baseProps: UnboundVisProps<T>,
    customizer: ScenarioCustomizer<T>,
) {
    return SizeVariants.map((size) => {
        return scenariosFor<T>(chart, component)
            .withGroupNames(...groupNames)
            .withVisualTestConfig({
                groupUnder: size.label,
                screenshotSize: { width: size.width, height: size.height },
            })
            .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
            .addScenarios(size.label, baseProps, customizer);
    });
}
