import type {Meta, StoryObj} from "@storybook/react";
import ErrorFallback from "./ErrorFallback";

const meta: Meta<typeof ErrorFallback> = {
    title: "Molecules/Error Fallback",
    component: ErrorFallback
};

export default meta;
type Story = StoryObj<typeof ErrorFallback>;

/** The default view of `ErrorFallback`. */
export const Default: Story = {
    args: {
        error: new Error("oops")
    }
};
