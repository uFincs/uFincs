import {text} from "@storybook/addon-knobs";
import React from "react";
import ListSectionHeader from "./ListSectionHeader";

export default {
    title: "Atoms/List Section Header",
    component: ListSectionHeader
};

/** The default view of the `ListSectionHeader`. */
export const Default = () => <ListSectionHeader>{text("Text", "Assets")}</ListSectionHeader>;
