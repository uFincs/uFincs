import {text} from "@storybook/addon-knobs";
import React from "react";
import LogoLink from "./LogoLink";

export default {
    title: "Molecules/Logo Link",
    component: LogoLink
};

/** The default look of a `Logo`, with the micro bounce of a `Link`. */
export const Default = () => <LogoLink to={text("Link", "/somewhere")} />;
