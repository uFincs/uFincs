import {actions} from "@storybook/addon-actions";
import {text} from "@storybook/addon-knobs";
import React from "react";
import {DocumentIcon} from "assets/icons";
import ImportOptionButton from "./ImportOptionButton";

export default {
    title: "Molecules/Import Option Button",
    component: ImportOptionButton
};

const buttonActions = actions("onClick");
const labelKnob = () => text("Label", "CSV File");

/** The default view of `ImportOptionButton`. */
export const Default = () => (
    <ImportOptionButton Icon={DocumentIcon} label={labelKnob()} {...buttonActions} />
);
