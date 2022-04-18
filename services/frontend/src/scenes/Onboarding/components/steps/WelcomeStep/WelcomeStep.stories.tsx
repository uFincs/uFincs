import {actions} from "@storybook/addon-actions";
import React from "react";
import WelcomeStep from "./WelcomeStep";

export default {
    title: "Scenes/Onboarding/Step/Welcome",
    component: WelcomeStep
};

const stepActions = actions("onSubmit");

/** The default view of `WelcomeStep`. */
export const Default = () => <WelcomeStep {...stepActions} />;
