import {actions} from "@storybook/addon-actions";
import React from "react";
import {TableRowActions} from "components/molecules";
import TableRowContainer from "./TableRowContainer";

export default {
    title: "Molecules/Table Row Container",
    component: TableRowContainer
};

const rowActions = actions("onDelete", "onEdit");

/** The default view of `TableRowContainer`. */
export const Default = () => (
    // Note: The container is supposed to look funny in this story because it doesn't have any
    // column template defined. That is done at the consuming component level.
    <TableRowContainer>
        <td>January 1, 2021</td>

        <TableRowActions {...rowActions} />
    </TableRowContainer>
);
