import {actions} from "@storybook/addon-actions";
import type {Meta, StoryObj} from "@storybook/react";
import TableRowActions from "./TableRowActions";

const meta: Meta<typeof TableRowActions> = {
    title: "Molecules/Table Row Actions",
    component: TableRowActions
};

export default meta;
type Story = StoryObj<typeof TableRowActions>;

/** The default view of `TableRowActions`. */
export const Default: Story = {
    args: {
        ...actions("onDelete", "onEdit")
    }
};
