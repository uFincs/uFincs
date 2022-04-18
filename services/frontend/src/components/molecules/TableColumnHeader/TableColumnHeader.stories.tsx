import {actions} from "@storybook/addon-actions";
import {boolean, select, text} from "@storybook/addon-knobs";
import React from "react";
import TableColumnHeader from "./TableColumnHeader";

export default {
    title: "Molecules/Table Column Header",
    component: TableColumnHeader
};

const headerActions = actions("onClick");

const activeSortKnob = () => boolean("Is Active Sort", true);
const directionKnob = () => select("Sort Direction", ["asc", "desc"], "asc");
const textKnob = () => text("Text", "Description");

/** The default view of `TableColumnHeader`. */
export const Default = () => (
    <TableColumnHeader
        isActiveSort={activeSortKnob()}
        sortDirection={directionKnob()}
        text={textKnob()}
        {...headerActions}
    />
);
