import {text} from "@storybook/addon-knobs";
import React from "react";
import PageNotFoundContent from "./PageNotFoundContent";

export default {
    title: "Organisms/Page Not Found Content",
    component: PageNotFoundContent
};

const nameKnob = () => text("Name of Place to Return to", "homepage");
const linkKnob = () => text("Link to Place to Return to", "/");

/** The default view of `PageNotFoundContent`. */
export const Default = () => (
    <PageNotFoundContent linkToPlaceThatDoesExist={linkKnob()} placeThatDoesExist={nameKnob()} />
);
