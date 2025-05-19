import type {Meta, StoryObj} from "@storybook/react";
import TableColumnHeader from "./TableColumnHeader";

const meta: Meta<typeof TableColumnHeader> = {
    title: "Molecules/Table Column Header",
    component: TableColumnHeader,
    args: {
        isActiveSort: true,
        sortDirection: "asc",
        text: "Description"
    }
};

export default meta;
type Story = StoryObj<typeof TableColumnHeader>;

/** The default view of `TableColumnHeader`. */
export const Default: Story = {};
