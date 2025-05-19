import {actions} from "@storybook/addon-actions";
import type {Meta, StoryObj} from "@storybook/react";
import TableRowActions from "components/molecules/TableRowActions";
import TableRowContainer from "./TableRowContainer";

const meta: Meta<typeof TableRowContainer> = {
    title: "Molecules/Table Row Container",
    component: TableRowContainer
};

export default meta;
type Story = StoryObj<typeof TableRowContainer>;

const rowActions = actions("onDelete", "onEdit");

/** The default view of `TableRowContainer`. */
export const Default: Story = {
    args: {
        children: [
            <td key="date">January 1, 2021</td>,
            <TableRowActions key="actions" {...rowActions} />
        ]
    }
};
