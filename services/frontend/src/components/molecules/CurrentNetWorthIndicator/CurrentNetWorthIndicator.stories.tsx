import type {Meta, StoryObj} from "@storybook/react";
import {PureComponent as CurrentNetWorthIndicator} from "./CurrentNetWorthIndicator";

const meta: Meta<typeof CurrentNetWorthIndicator> = {
    title: "Molecules/Current Net Worth Indicator",
    component: CurrentNetWorthIndicator,
    args: {
        currentNetWorth: 123456789
    }
};

export default meta;
type Story = StoryObj<typeof CurrentNetWorthIndicator>;

/** The default view of `CurrentNetWorthIndicator`. */
export const Default: Story = {};
