import classNames from "classnames";
import React from "react";
import {LinkButton} from "components/atoms";
import {useOptionsKeyboardControl} from "hooks/";
import {navigationBreakpointMatches} from "utils/mediaQueries";
import {useTabUnderline} from "./hooks";
import "./TabBar.scss";

export interface Tab {
    /** The label for this tab. */
    label: string;

    /** The ID of the label for this tab.
     *  Used for accessibility purposes (aria-labelledby). */
    labelId?: string;

    /** The label to use for this tab on small devices (below navigation breakpoint). */
    smallLabel?: string;

    /** The ID of the section for the tab.
     *  Used for accessibility purposes (aria-controls). */
    controlsId?: string;

    /** A custom component for the tab. */
    Component?: React.ComponentType<{className?: string; active: boolean; tabIndex: number}>;
}

interface TabBarProps extends React.HTMLAttributes<HTMLUListElement> {
    /** A custom test ID to prefix each of the tabs' test IDs with. */
    "data-testid"?: string;

    /** Custom class name for the underline.  */
    underlineClassName?: string;

    /** The index of the currently active tab. */
    activeTab?: number;

    /** Disables the click handler for the tabs so that the underlying custom tab components
     *  handle it. This is particularly useful when tabs are links and the `activeTab` prop
     *  is being derived based on the URL. */
    disableTabClick?: boolean;

    /** The tabs to show. */
    tabs: Array<Tab>;

    /** Callback for handling when the active tab changes. */
    onTabChange: (index: number) => void;
}

/** A tab bar with a sliding underline that highlights the currently active tab. */
const TabBar = ({
    className,
    "data-testid": dataTestId,
    underlineClassName,
    activeTab = 0,
    disableTabClick,
    tabs,
    onTabChange,
    ...otherProps
}: TabBarProps) => {
    const {
        onContainerKeyDown,
        onItemKeyDown,
        optionRefs: tabRefs
    } = useOptionsKeyboardControl(tabs.length, activeTab, onTabChange);

    const {containerRef, underlineStyle} = useTabUnderline(tabs.length, activeTab, tabRefs);

    return (
        <ul
            className={classNames("TabBar", className)}
            ref={containerRef}
            role="tablist"
            onKeyDown={onContainerKeyDown}
            {...otherProps}
        >
            {tabs.map(({label, labelId, smallLabel, controlsId, Component}, index) => (
                <li
                    key={label}
                    className={classNames("TabBar-tab", {
                        "TabBar-tab--active": activeTab === index
                    })}
                    id={labelId}
                    aria-controls={controlsId}
                    aria-selected={activeTab === index}
                    data-testid={`${dataTestId}-${label}`}
                    role="tab"
                    title={label}
                    ref={tabRefs.current[index]}
                    onClick={disableTabClick ? undefined : () => onTabChange(index)}
                    onKeyDown={onItemKeyDown(index)}
                    // Make this container focusable.
                    tabIndex={0}
                >
                    {Component ? (
                        <Component
                            className="TabBar-tab-content"
                            active={activeTab === index}
                            tabIndex={-1}
                        />
                    ) : (
                        <LinkButton
                            className={classNames("TabBar-tab-LinkButton", "TabBar-tab-content", {
                                "TabBar-tab-LinkButton--active": activeTab === index
                            })}
                            // Prevent the child from being focusable so that the user doesn't have
                            // to tab twice to move between tabs.
                            tabIndex={-1}
                        >
                            {navigationBreakpointMatches() ? label : smallLabel || label}
                        </LinkButton>
                    )}
                </li>
            ))}

            <li
                className={classNames("TabBar-underline", underlineClassName)}
                style={underlineStyle}
                // Use aria-hidden so that the underline is removed from the Accessibility tree.
                aria-hidden="true"
            />
        </ul>
    );
};

export default TabBar;
