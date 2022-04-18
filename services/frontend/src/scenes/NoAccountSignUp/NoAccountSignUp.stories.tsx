import {actions} from "@storybook/addon-actions";
import React from "react";
import {PureComponent as NoAccountSignUp} from "./NoAccountSignUp";

export default {
    title: "Scenes/No Account Sign Up",
    component: NoAccountSignUp
};

const formActions = actions("onSignUp");

/** The default view of `NoAccountSignUp`. */
export const Default = () => <NoAccountSignUp {...formActions} />;
