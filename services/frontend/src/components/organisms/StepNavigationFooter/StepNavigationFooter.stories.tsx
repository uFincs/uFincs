import {actions} from "@storybook/addon-actions";
import React from "react";
import StepNavigationFooter from "./StepNavigationFooter";

export default {
    title: "Organisms/Step Navigation Footer",
    component: StepNavigationFooter
};

const footerActions = actions("onNextStep", "onPreviousStep");

/** The default view of `StepNavigationFooter`. */
export const Default = () => <StepNavigationFooter {...footerActions} />;
