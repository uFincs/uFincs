import type {Meta, StoryObj} from "@storybook/react";
import {EditIcon} from "assets/icons";
import IconButton from "./IconButton";

const meta: Meta<typeof IconButton> = {
    title: "Atoms/Icon Button",
    component: IconButton,
    args: {
        children: <EditIcon />,
        disabled: false,
        onDarkBackground: false
    }
};

export default meta;
type Story = StoryObj<typeof IconButton>;

/** The default view of an `IconButton`. */
export const Default: Story = {
    args: {
        title: "Edit"
    }
};

export const DarkBackground: Story = {
    args: {
        onDarkBackground: true,
        title: "Edit"
    }
};

/** The disabled view of an `IconButton`. Reduces contrast on the icon to indicate disableness. */
export const Disabled: Story = {
    args: {
        disabled: true,
        title: "Edit"
    }
};

/** An `IconButton` with the focus outline forcefully applied. */
export const FocusOutline: Story = {
    args: {
        className: "Element--story-FocusOutline",
        title: "Edit"
    }
};
