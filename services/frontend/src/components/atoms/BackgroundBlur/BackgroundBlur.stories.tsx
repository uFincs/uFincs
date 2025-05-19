import type {Meta, StoryObj} from "@storybook/react";
import BackgroundBlur from "./BackgroundBlur";

const meta: Meta<typeof BackgroundBlur> = {
    title: "Atoms/Background Blur",
    component: BackgroundBlur,
    args: {
        isVisible: true
    }
};

export default meta;
type Story = StoryObj<typeof BackgroundBlur>;

/** The default view of the `BackgroundBlur`. It should cover the test content and blur it. */
export const Default: Story = {};
