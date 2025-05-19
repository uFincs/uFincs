import type {Meta, StoryObj} from "@storybook/react";
import ListItemCheckbox from "./ListItemCheckbox";

const meta: Meta<typeof ListItemCheckbox> = {
    title: "Atoms/List Item Checkbox",
    component: ListItemCheckbox,
    args: {
        "aria-label": "Select",
        checked: false
    }
};

export default meta;
type Story = StoryObj<typeof ListItemCheckbox>;

/** The primary (default) variant view of `ListItemCheckbox`. */
export const PrimaryVariant: Story = {};

/** The positive variant view of `ListItemCheckbox`. */
export const PositiveVariant: Story = {
    args: {
        variant: "positive"
    }
};
