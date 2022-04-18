import {text} from "@storybook/addon-knobs";
import React from "react";
import Label from "./Label";

export default {
    title: "Atoms/Label",
    component: Label
};

/** It's a `Label`, what more do you want? */
export const Default = () => <Label>{text("Label", "Email")}</Label>;
