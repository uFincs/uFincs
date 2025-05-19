import type {Meta, StoryObj} from "@storybook/react";
import {PureComponent as ShowFutureToggle} from "./ShowFutureToggle";

const meta: Meta<typeof ShowFutureToggle> = {
    title: "Molecules/Show Future Toggle",
    component: ShowFutureToggle,
    args: {
        active: false
    }
};

export default meta;
type Story = StoryObj<typeof ShowFutureToggle>;

/** The default view of `ShowFutureToggle`. */
export const Default: Story = {
    args: {
        active: true
    }
};
