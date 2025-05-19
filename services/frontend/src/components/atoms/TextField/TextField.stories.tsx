import type {Meta, StoryObj} from "@storybook/react";
import TextField from "./TextField";

const meta: Meta<typeof TextField> = {
    title: "Atoms/Text Field",
    component: TextField,
    args: {
        children: "Need an account?"
    }
};

export default meta;
type Story = StoryObj<typeof TextField>;

/** It's text. Rejoice. */
export const Default: Story = {};

/** Custom text. */
export const CustomText: Story = {
    args: {
        children: "This is a custom text."
    }
};
