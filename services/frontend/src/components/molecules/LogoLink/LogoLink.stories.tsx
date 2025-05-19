import type {Meta, StoryObj} from "@storybook/react";
import LogoLink from "./LogoLink";

const meta: Meta<typeof LogoLink> = {
    title: "Molecules/Logo Link",
    component: LogoLink,
    args: {
        to: "/somewhere"
    }
};

export default meta;
type Story = StoryObj<typeof LogoLink>;

/** The default look of a `Logo`, with the micro bounce of a `Link`. */
export const Default: Story = {
    args: {
        to: "Link"
    }
};
