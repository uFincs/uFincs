import type {Meta, StoryObj} from "@storybook/react";
import ChartContainer from "./ChartContainer";

const meta: Meta<typeof ChartContainer> = {
    title: "Charts/Components/Chart Container",
    component: ChartContainer
};

export default meta;
type Story = StoryObj<typeof ChartContainer>;

/** An example of the `ChartContainer` wrapping something. */
export const Example: Story = {
    args: {
        children: <div>test</div>
    }
};
