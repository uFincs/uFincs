import {text} from "@storybook/addon-knobs";
import React from "react";
import FormSectionHeader from "./FormSectionHeader";

export default {
    title: "Atoms/Form Section Header",
    component: FormSectionHeader
};

/** The default view of the `FormSectionHeader`. */
export const Default = () => (
    <FormSectionHeader>{text("Text", "What type of account is this?")}</FormSectionHeader>
);
