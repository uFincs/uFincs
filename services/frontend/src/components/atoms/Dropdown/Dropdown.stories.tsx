import {action} from "@storybook/addon-actions";
import {select} from "@storybook/addon-knobs";
import React from "react";
import Dropdown from "./Dropdown";

export default {
    title: "Atoms/Dropdown",
    component: Dropdown
};

const items = [
    {label: "Settings", onClick: action("settings clicked")},
    {label: "Logout", onClick: action("logout clicked")}
];

const itemsWithDisabled = [
    {label: "Settings", onClick: action("settings clicked"), disabled: true},
    {label: "Logout", onClick: action("logout clicked")}
];

/** The default view of a `Dropdown`. Click the button to open and close it! */
export const Default = () => (
    <div className="Dropdown--story-container">
        <Dropdown
            TriggerButton={(props) => <button {...props}>Open</button>}
            alignment={select("Alignment", ["left", "right", "top-center"], "left")}
            items={items}
        />
    </div>
);

/** An example of using individually disabled items in a `Dropdown`. */
export const IndividuallyDisabled = () => (
    <div className="Dropdown--story-container">
        <Dropdown
            TriggerButton={(props) => <button {...props}>Open</button>}
            alignment={select("Alignment", ["left", "right", "top-center"], "left")}
            items={itemsWithDisabled}
        />
    </div>
);
