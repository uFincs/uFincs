import {text} from "@storybook/addon-knobs";
import React from "react";
import TextField from "./TextField";

export default {
    title: "Atoms/Text Field",
    component: TextField
};

/** It's text. Rejoice. */
export const Default = () => <TextField>{text("Text", "Need an account?")}</TextField>;
