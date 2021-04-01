// (C) 2007-2020 GoodData Corporation
import React from "react";
import map from "lodash/map";
import { ScreenSize } from "@gooddata/sdk-backend-spi";
import {
    IDashboardLayoutItemKeyGetter,
    IDashboardLayoutItemRenderer,
    IDashboardLayoutWidgetRenderer,
    IDashboardLayoutSectionKeyGetter,
    IDashboardLayoutSectionRenderer,
    IDashboardLayoutSectionHeaderRenderer,
    IDashboardLayoutGridRowRenderer,
} from "./interfaces";
import { DashboardLayoutItem } from "./DashboardLayoutItem";
import { DashboardLayoutSectionRenderer } from "./DashboardLayoutSectionRenderer";
import { IDashboardLayoutSectionFacade } from "./facade/interfaces";
import { DashboardLayoutSectionHeaderRenderer } from "./DashboardLayoutSectionHeaderRenderer";

/**
 * @alpha
 */
export interface IDashboardLayoutSectionProps<TWidget> {
    section: IDashboardLayoutSectionFacade<TWidget>;
    sectionKeyGetter?: IDashboardLayoutSectionKeyGetter<TWidget>;
    sectionRenderer?: IDashboardLayoutSectionRenderer<TWidget>;
    sectionHeaderRenderer?: IDashboardLayoutSectionHeaderRenderer<TWidget>;
    itemKeyGetter?: IDashboardLayoutItemKeyGetter<TWidget>;
    itemRenderer?: IDashboardLayoutItemRenderer<TWidget>;
    widgetRenderer?: IDashboardLayoutWidgetRenderer<TWidget>;
    gridRowRenderer?: IDashboardLayoutGridRowRenderer<TWidget>;
    screen: ScreenSize;
}

export function DashboardLayoutSection<TWidget>(props: IDashboardLayoutSectionProps<TWidget>): JSX.Element {
    const {
        section,
        sectionRenderer = DashboardLayoutSectionRenderer,
        sectionHeaderRenderer = DashboardLayoutSectionHeaderRenderer,
        itemKeyGetter = ({ item }) => item.index(),
        gridRowRenderer = ({ children }) => children,
        itemRenderer,
        widgetRenderer,
        screen,
    } = props;
    const renderProps = { section, screen };

    const items = map(section.items().asGridRows(screen), (itemsInRow) => {
        const rowItems = itemsInRow.map((item) => (
            <DashboardLayoutItem
                key={itemKeyGetter({ item, screen })}
                item={item}
                itemRenderer={itemRenderer}
                widgetRenderer={widgetRenderer}
                screen={screen}
            />
        ));
        return gridRowRenderer
            ? gridRowRenderer({ children: rowItems, screen, section, items: itemsInRow })
            : rowItems;
    });
    const headItem = items[0];
    const tailItems = items.slice(1).map((item) => (
        <div style={{ width: "100%" }} className="gd-row-without-header">
            {item}
        </div>
    ));

    return sectionRenderer({
        ...renderProps,
        DefaultSectionRenderer: DashboardLayoutSectionRenderer,
        children: (
            <>
                <div style={{ width: "100%" }} className="gd-row-with-header">
                    {sectionHeaderRenderer &&
                        sectionHeaderRenderer({
                            section,
                            screen,
                            DefaultSectionHeaderRenderer: DashboardLayoutSectionHeaderRenderer,
                        })}
                    {headItem}
                </div>
                {tailItems}
            </>
        ),
    });
}
