import {action} from "@storybook/addon-actions";
import type {Meta, StoryObj} from "@storybook/react";
import {PlusIcon} from "assets/icons";
import {smallViewport} from "utils/stories";
import Button from "./Button";

const meta: Meta<typeof Button> = {
    title: "Atoms/Button",
    component: Button,
    args: {
        disabledOnClick: action("disabledOnClick"),
        variant: "primary",
        disabled: false,
        children: "Login"
    }
};

export default meta;
type Story = StoryObj<typeof Button>;

/** What a regular `Button` looks like: a rectangle with some text. */
export const WithLabel: Story = {
    args: {
        children: "Login"
    }
};

/** Mixing things up by using an icon instead of text for the label in the `Button`.
 *
 *  **Note**: Now that the content is only an icon, it needs an `aria-label` for screen readers.
 */
export const WithIcon: Story = {
    args: {
        children: <PlusIcon />,
        "aria-label": "Add"
    }
};

/** What the `Button` looks like on small devices. */
export const Small: Story = {
    args: {
        children: "Login"
    },
    ...smallViewport
};

/** When the `Button` has too long a label, it should cut off the label and show ellipsis. */
export const WithLongLabel: Story = {
    args: {
        children: "This is a label that is way too long and will go outside the button"
    }
};

/** The 'secondary' variant of the `Button`, which has a neutral background instead of
 *  the primary color.
 *
 *  Useful for secondary actions. */
export const SecondaryVariant: Story = {
    args: {
        children: "Login",
        variant: "secondary"
    }
};

/** A disabled `Button` uses reduced contrast between its background and its label to indicate
 *  its disabled state.
 *
 *  A disabled button won't trigger any click events.
 */
export const Disabled: Story = {
    args: {
        children: "Login",
        disabled: true
    }
};

/** A 'disabled' `Button` that also has a 'frustration' click handler.
 *  The button should still look disabled, but it still has a (separate) click handler. */
export const DisabledWithClickHandler: Story = {
    args: {
        children: "Login",
        disabled: true
    }
};

/** A `Button` with the focus outline forcefully applied. */
export const FocusOutline: Story = {
    args: {
        children: "Login",
        className: "Element--story-FocusOutline"
    }
};
