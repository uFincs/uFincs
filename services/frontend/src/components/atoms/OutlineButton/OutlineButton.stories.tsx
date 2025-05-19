import {Meta, StoryObj} from "@storybook/react";
import {PlusIcon} from "assets/icons";
import OutlineButton from "./OutlineButton";

const meta: Meta<typeof OutlineButton> = {
    title: "Atoms/Outline Button",
    component: OutlineButton,
    args: {
        children: "Login",
        disabled: false,
        colorTheme: "primary"
    }
};

export default meta;
type Story = StoryObj<typeof OutlineButton>;

/** An `OutlineButton` with a label; what it usually looks like. */
export const WithLabel: Story = {};

/** An `OutlineButton` with an icon. */
export const WithIcon: Story = {
    args: {
        children: <PlusIcon />
    }
};

/** An `OutlineButton` with a label that is too long to all fit in the button. */
export const WithLongLabel: Story = {
    args: {
        children: "This is a label that is way too long and will go outside the button"
    }
};

/** The serendipitous disabled state of an `OutlineButton`. */
export const Disabled: Story = {
    args: {
        disabled: true
    }
};

/** The `light` color theme variant of the `OutlineButton`. */
export const LightColorTheme: Story = {
    args: {
        colorTheme: "light"
    }
};

/** The `warning` color theme variant of the `OutlineButton`. */
export const WarningColorTheme: Story = {
    args: {
        colorTheme: "warning"
    }
};
