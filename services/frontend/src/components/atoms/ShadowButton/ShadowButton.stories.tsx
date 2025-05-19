import {Meta, StoryObj} from "@storybook/react";
import {PlusIcon} from "assets/icons";
import ShadowButton from "./ShadowButton";

const meta: Meta<typeof ShadowButton> = {
    title: "Atoms/Shadow Button",
    component: ShadowButton,
    args: {
        children: "Login",
        disabled: false,
        variant: "primary"
    }
};

export default meta;
type Story = StoryObj<typeof ShadowButton>;

/** A `ShadowButton` with a label; what it usually looks like. */
export const WithLabel: Story = {};

/** A `ShadowButton` with an icon. */
export const WithIcon: Story = {
    args: {
        children: <PlusIcon />
    }
};

/** The 'negative' variant of the `ShadowButton`. */
export const Negative: Story = {
    args: {
        children: "Delete",
        variant: "negative"
    }
};

/** The serendipitous disabled state of a `ShadowButton`. */
export const Disabled: Story = {
    args: {
        disabled: true
    }
};

/** The disabled state of the 'negative' variant of a `ShadowButton`. */
export const DisabledNegative: Story = {
    args: {
        children: "Delete",
        disabled: true,
        variant: "negative"
    }
};
