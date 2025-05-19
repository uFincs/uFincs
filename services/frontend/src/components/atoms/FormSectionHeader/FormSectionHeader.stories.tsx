import type {Meta, StoryObj} from "@storybook/react";
import FormSectionHeader from "./FormSectionHeader";

const meta: Meta<typeof FormSectionHeader> = {
    title: "Atoms/Form Section Header",
    component: FormSectionHeader,
    args: {
        children: "What type of account is this?"
    }
};

export default meta;
type Story = StoryObj<typeof FormSectionHeader>;

/** The default view of the `FormSectionHeader`. */
export const Default: Story = {};

/** `FormSectionHeader` with custom text. */
export const CustomText: Story = {
    args: {
        children: "Custom header text"
    }
};
