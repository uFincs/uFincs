import {text} from "@storybook/addon-knobs";
import React from "react";
import OverlineHeading from "./OverlineHeading";

export default {
    title: "Atoms/Overline Heading",
    component: OverlineHeading
};

/** The normal size of an `OverlineHeading`. */
export const Normal = () => <OverlineHeading>{text("Heading", "Login")}</OverlineHeading>;

/** The large size of an `OverlineHeading`. */
export const Large = () => (
    <OverlineHeading size="large">{text("Heading", "Login")}</OverlineHeading>
);

/** The small size of an `OverlineHeading`. */
export const Small = () => (
    <OverlineHeading size="small">{text("Heading", "Login")}</OverlineHeading>
);
