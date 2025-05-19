import {action} from "@storybook/addon-actions";
import {Meta, StoryObj} from "@storybook/react";
import Dropdown from "./Dropdown";

const meta: Meta<typeof Dropdown> = {
    title: "Atoms/Dropdown",
    component: Dropdown,
    args: {
        alignment: "left"
    }
};

export default meta;
type Story = StoryObj<typeof Dropdown>;

const items = [
    {label: "Settings", onClick: action("settings clicked")},
    {label: "Logout", onClick: action("logout clicked")}
];

const itemsWithDisabled = [
    {label: "Settings", onClick: action("settings clicked"), disabled: true},
    {label: "Logout", onClick: action("logout clicked")}
];

/** The default view of a `Dropdown`. Click the button to open and close it! */
export const Default: Story = {
    args: {
        items: items
    }
};

/** An example of using individually disabled items in a `Dropdown`. */
export const IndividuallyDisabled: Story = {
    args: {
        items: itemsWithDisabled
    }
};
