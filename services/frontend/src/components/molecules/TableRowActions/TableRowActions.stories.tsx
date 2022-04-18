import {actions} from "@storybook/addon-actions";
import React from "react";
import TableRowActions from "./TableRowActions";

export default {
    title: "Molecules/Table Row Actions",
    component: TableRowActions
};

const rowActions = actions("onDelete", "onEdit");

/** The default view of `TableRowActions`. */
export const Default = () => <TableRowActions {...rowActions} />;
