import type {Meta, StoryObj} from "@storybook/react";
import Divider from "./Divider";

const meta: Meta<typeof Divider> = {
    title: "Atoms/Divider",
    component: Divider
};

export default meta;
type Story = StoryObj<typeof Divider>;

/** What the horizontal `Divider` looks like. */
export const Horizontal: Story = {
    args: {
        orientation: "horizontal"
    }
};

/** What the vertical `Divider` looks like. */
export const Vertical: Story = {
    args: {
        orientation: "vertical"
    }
};
