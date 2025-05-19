import type {Meta, StoryObj} from "@storybook/react";
import AnimatedLogo from "./AnimatedLogo";

const meta: Meta<typeof AnimatedLogo> = {
    title: "Atoms/Animated Logo",
    component: AnimatedLogo
};

export default meta;
type Story = StoryObj<typeof AnimatedLogo>;

/** The default view of `AnimatedLogo`. */
export const Default: Story = {
    args: {}
};

/** An example of `AnimatedLogo` scaled up in size. */
export const Large: Story = {
    args: {
        className: "AnimatedLogo--story-Large"
    }
};
