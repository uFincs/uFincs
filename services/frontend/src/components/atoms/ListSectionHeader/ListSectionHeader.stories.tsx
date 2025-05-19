import type {Meta, StoryObj} from "@storybook/react";
import ListSectionHeader from "./ListSectionHeader";

const meta: Meta<typeof ListSectionHeader> = {
    title: "Atoms/List Section Header",
    component: ListSectionHeader,
    args: {
        children: "Assets"
    }
};

export default meta;
type Story = StoryObj<typeof ListSectionHeader>;

/** The default view of the `ListSectionHeader`. */
export const Default: Story = {};

/** `ListSectionHeader` with custom text. */
export const CustomText: Story = {
    args: {
        children: "Custom Text"
    }
};
