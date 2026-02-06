// (C) 2026 GoodData Corporation

import { useEffect, useState } from "react";

import "./Example.css";

import { Example as AttributeFilterExample } from "./example-attributefilter/Example.js";
import { Example as ChartConfigExample } from "./example-chartconfig/Example.js";
import { Example as ColumnChartExample } from "./example-columnchart/Example.js";
import { Example as ComboChartExample } from "./example-combochart/Example.js";
import { Example as DashboardExample } from "./example-dashboard/Example.js";
import { Example as DateFilterExample } from "./example-datefilter/Example.js";
import { Example as DependentFiltersExample } from "./example-dependentfilters/Example.js";
import { Example as GranularityExample } from "./example-granularity/Example.js";
import { Example as HeadlineExample } from "./example-headline/Example.js";
import { Example as PivotTableExample } from "./example-pivottable/Example.js";
import { Example as RelativeDateFilterExample } from "./example-relativedatefilter/Example.js";
import { Example as RepeaterExample } from "./example-repeater/Example.js";

interface IRouteConfig {
    id: string;
    title: string;
    Component: () => any;
}

const routes: IRouteConfig[] = [
    { id: "attribute-filter", title: "Attribute Filter", Component: AttributeFilterExample },
    { id: "chart-config", title: "Chart config manipulation", Component: ChartConfigExample },
    { id: "column-chart", title: "ColumnChart", Component: ColumnChartExample },
    { id: "combo-chart", title: "ComboChart", Component: ComboChartExample },
    { id: "dashboard", title: "Dashboard component", Component: DashboardExample },
    { id: "date-filter", title: "DateFilter", Component: DateFilterExample },
    { id: "dependent-filters", title: "Dependent Filters", Component: DependentFiltersExample },
    { id: "granularity", title: "Granularity", Component: GranularityExample },
    { id: "headline", title: "Headline", Component: HeadlineExample },
    { id: "pivot-table", title: "PivotTable", Component: PivotTableExample },
    { id: "relative-date-filter", title: "RelativeDateFilter", Component: RelativeDateFilterExample },
    { id: "repeater", title: "Repeater", Component: RepeaterExample },
];

function getRouteIdFromHash(): string | undefined {
    const hash = window.location.hash ?? "";
    const match = hash.match(/^#\/(.+)$/);
    const routeId = match?.[1];
    if (!routeId) {
        return undefined;
    }

    return routeId;
}

function isKnownRouteId(routeId: string): boolean {
    return routes.some((route) => route.id === routeId);
}

function setHashRoute(routeId: string) {
    window.location.hash = `#/${routeId}`;
}

export function Example() {
    const [activeRouteId, setActiveRouteId] = useState<string>(() => {
        const fromHash = getRouteIdFromHash();
        return fromHash && isKnownRouteId(fromHash) ? fromHash : routes[0].id;
    });

    useEffect(() => {
        const onHashChange = () => {
            const fromHash = getRouteIdFromHash();
            setActiveRouteId(fromHash && isKnownRouteId(fromHash) ? fromHash : routes[0].id);
        };

        window.addEventListener("hashchange", onHashChange);
        onHashChange();

        if (!getRouteIdFromHash()) {
            setHashRoute(routes[0].id);
        }

        return () => {
            window.removeEventListener("hashchange", onHashChange);
        };
    }, []);

    const activeRoute = routes.find((route) => route.id === activeRouteId) ?? routes[0];

    return (
        <div className="exampleAllRoot">
            <header className="exampleAllHeader">
                <h1 className="exampleAllPageTitle">All Interactive Examples</h1>
            </header>

            <div className="exampleAllLayout">
                <nav className="exampleAllNav" aria-label="Examples">
                    <ul className="exampleAllNavList">
                        {routes.map((route) => {
                            const isActive = route.id === activeRoute.id;
                            return (
                                <li key={route.id}>
                                    <a
                                        className="exampleAllNavLink"
                                        href={`#/${route.id}`}
                                        data-active={isActive ? "true" : "false"}
                                        aria-current={isActive ? "page" : undefined}
                                    >
                                        {route.title}
                                    </a>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <main className="exampleAllContent">
                    <activeRoute.Component />
                </main>
            </div>
        </div>
    );
}
