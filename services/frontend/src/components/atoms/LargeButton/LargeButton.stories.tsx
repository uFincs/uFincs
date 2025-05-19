import type {Meta, StoryObj} from "@storybook/react";
import LargeButton from "./LargeButton";

const meta: Meta<typeof LargeButton> = {
    title: "Atoms/Large Button",
    component: LargeButton,
    args: {
        children: "CSV File"
    }
};

export default meta;
type Story = StoryObj<typeof LargeButton>;

/** The default view of `LargeButton`. */
export const Default: Story = {};

/** The disabled view of `LargeButton`. */
export const Disabled: Story = {
    args: {
        disabled: true
    }
};
