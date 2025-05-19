import classNames from "classnames";
import * as React from "react";
import {Divider} from "components/atoms";
import {TabBar} from "components/molecules";
import {TabForSection, useTabBarWithSections} from "./hooks";
import "./TabBarWithSections.scss";

interface TabBarWithSectionsProps {
    /** Custom class name. */
    className?: string;

    /** [optional] The currently active tab.
     *
     *  If provided, then `setActiveTab` must also be provided, since the state is now being controlled
     *  externally instead of internally. */
    activeTab?: number;

    /** The tabs to show. */
    tabs: Array<TabForSection>;

    /** The children of this component are treated a little specially.
     *
     *  Each child, in order, is considered the 'section' for the corresponding tab in the
     *  `tabs` config. So if 3 children are passed, then 3 tabs must also be passed
     *   (and vice versa). */
    children: React.ReactNode;

    /** [optional] Callback to change the currently active tab.
     *
     *  If provided, then `activeTab` must also be provided, since the state is now being controlled
     *  externally instead of internally. */
    setActiveTab?: (index: number) => void;
}

/** A `TabBar` that accepts children for use as sections (where each child maps to a tab). */
const TabBarWithSections = ({
    className,
    activeTab,
    tabs,
    children,
    setActiveTab,
    ...otherProps
}: TabBarWithSectionsProps) => {
    const {
        activeTab: actualActiveTab,
        sections,
        setActiveTab: actualSetActiveTab
    } = useTabBarWithSections(tabs, children, activeTab, setActiveTab);

    return (
        <div className={classNames("TabBarWithSections", className)} {...otherProps}>
            <div className="TabBarWithSections-TabBar-container">
                <TabBar
                    className="TabBarWithSections-TabBar"
                    underlineClassName="TabBarWithSections-TabBar-underline"
                    activeTab={actualActiveTab}
                    tabs={tabs}
                    onTabChange={actualSetActiveTab}
                />

                <Divider />
            </div>

            <div className="TabBarWithSections-sections">{sections}</div>
        </div>
    );
};

export default TabBarWithSections;
