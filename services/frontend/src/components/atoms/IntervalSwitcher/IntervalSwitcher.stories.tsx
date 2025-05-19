import {actions} from "@storybook/addon-actions";
import type {Meta, StoryObj} from "@storybook/react";
import IntervalSwitcher from "./IntervalSwitcher";

const decrementActions = actions({onClick: "decrement"});
const incrementActions = actions({onClick: "increment"});

const meta: Meta<typeof IntervalSwitcher> = {
    title: "Atoms/Interval Switcher",
    component: IntervalSwitcher,
    args: {
        decrementButtonProps: {...decrementActions, title: "Back"},
        incrementButtonProps: {...incrementActions, title: "Forward"},
        children: <p>Test</p>
    }
};

export default meta;
type Story = StoryObj<typeof IntervalSwitcher>;

/** The default view of the `IntervalSwitcher`, with some mock content. */
export const Default: Story = {
    args: {}
};

/** The `IntervalSwitcher` with the focus outline forcefully applied. */
export const FocusOutline: Story = {
    args: {
        className: "Element--story-FocusOutline"
    }
};
