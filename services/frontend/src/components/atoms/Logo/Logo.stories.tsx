import type {Meta, StoryObj} from "@storybook/react";
import Logo from "./Logo";

const meta: Meta<typeof Logo> = {
    title: "Atoms/Logo",
    component: Logo,
    args: {
        colorTheme: "dark",
        size: "large"
    }
};

export default meta;
type Story = StoryObj<typeof Logo>;

/** The full `Logo` has the full name of the app. */
export const Full: Story = {};

/** The standalone `Logo` has just the `u` in uFincs, which is our trademark symbol. */
export const Standalone: Story = {
    args: {
        variant: "standalone"
    }
};
