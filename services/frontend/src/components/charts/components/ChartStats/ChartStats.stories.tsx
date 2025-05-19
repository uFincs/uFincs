import type {Meta, StoryObj} from "@storybook/react";
import ChartStats from "./ChartStats";

const meta: Meta<typeof ChartStats> = {
    title: "Charts/Components/ChartStats",
    component: ChartStats,
    args: {
        currentAmount: 10000,
        fromAmount: 5000,
        title: "Net Worth"
    }
};

export default meta;
type Story = StoryObj<typeof ChartStats>;

/** The default view of the `ChartStats`. */
export const Default: Story = {};

/** `ChartStats` with custom current amount. */
export const CustomCurrentAmount: Story = {
    args: {
        currentAmount: 15000
    }
};

/** `ChartStats` with custom from amount. */
export const CustomFromAmount: Story = {
    args: {
        fromAmount: 7500
    }
};

/** `ChartStats` with custom title. */
export const CustomTitle: Story = {
    args: {
        title: "Total Assets"
    }
};
