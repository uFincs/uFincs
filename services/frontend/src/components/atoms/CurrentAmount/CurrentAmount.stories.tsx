import type {Meta, StoryObj} from "@storybook/react";
import CurrentAmount from "./CurrentAmount";

const meta: Meta<typeof CurrentAmount> = {
    title: "Atoms/Current Amount",
    component: CurrentAmount,
    args: {
        amount: 1000000,
        lightShade: false
    }
};

export default meta;
type Story = StoryObj<typeof CurrentAmount>;

/** The default view of the `CurrentAmount`. */
export const Default: Story = {};

/** The light view of the `CurrentAmount`, for use on dark backgrounds. */
export const LightShade: Story = {
    args: {
        lightShade: true
    }
};
