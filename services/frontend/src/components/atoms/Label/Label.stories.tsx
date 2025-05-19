import type {Meta, StoryObj} from "@storybook/react";
import Label from "./Label";

const meta: Meta<typeof Label> = {
    title: "Atoms/Label",
    component: Label,
    args: {
        children: "Email"
    }
};

export default meta;
type Story = StoryObj<typeof Label>;

/** It's a `Label`, what more do you want? */
export const Default: Story = {};
