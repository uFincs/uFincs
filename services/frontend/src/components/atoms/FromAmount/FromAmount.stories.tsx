import type {Meta, StoryObj} from "@storybook/react";
import FromAmount from "./FromAmount";

const meta: Meta<typeof FromAmount> = {
    title: "Atoms/From Amount",
    component: FromAmount,
    args: {
        amount: 140000,
        lightShade: false
    }
};

export default meta;
type Story = StoryObj<typeof FromAmount>;

/** The default view of the `FromAmount`. */
export const Default: Story = {};

/** The light view of the `FromAmount`, for use on dark backgrounds. */
export const LightShade: Story = {
    args: {
        lightShade: true
    }
};
