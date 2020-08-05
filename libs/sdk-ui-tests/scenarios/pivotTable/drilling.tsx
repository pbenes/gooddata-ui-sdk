// (C) 2007-2019 GoodData Corporation

import { scenariosFor } from "../../src";
import { IPivotTableProps, PivotTable } from "@gooddata/sdk-ui-pivot";
import { PivotTableWithTwoMeasuresAndThreeRowsAndTwoCols } from "./base";
import { DepartmentPredicate } from "../_infra/predicates";

export default scenariosFor<IPivotTableProps>("PivotTable", PivotTable)
    .withGroupNames("drilling")
    .withVisualTestConfig({ screenshotSize: { width: 1200, height: 800 } })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenario("Pivot table with drill on second attribute", {
        ...PivotTableWithTwoMeasuresAndThreeRowsAndTwoCols,
        drillableItems: [DepartmentPredicate],
    });
