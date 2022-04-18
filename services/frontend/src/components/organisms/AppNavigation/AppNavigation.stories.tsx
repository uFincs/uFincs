import {action, actions} from "@storybook/addon-actions";
import {number} from "@storybook/addon-knobs";
import React, {useState} from "react";
import {smallViewport} from "utils/stories";
import {PureComponent as AppNavigation} from "./AppNavigation";
import {mapScreenUrlToIndex} from "./connect";

export default {
    title: "Organisms/App Navigation",
    component: AppNavigation
};

const otherActions = actions("onNoAccountSignUp");

/** The large view of the `AppNavigation`; this is the complete header that runs across the top. */
export const Large = () => {
    // In the connected implementation, the active state is derived directly from which
    // URL the user is on. That's why onNavigate takes in a URL.
    const [active, setActive] = useState(0);

    return (
        <AppNavigation
            active={active}
            onNavigate={(url) => setActive(mapScreenUrlToIndex(url))}
            {...otherActions}
        />
    );
};

/** The small view of the `AppNavigation`; this is the compact bar at the bottom.  */
export const Small = () => (
    <AppNavigation
        active={number("Active", 0)}
        onNavigate={action("disabled for this view")}
        {...otherActions}
    />
);

Small.parameters = smallViewport;
