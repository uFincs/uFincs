import {actions} from "@storybook/addon-actions";
import React from "react";
import {PureComponent as AppRefreshButton} from "./AppRefreshButton";

export default {
    title: "Molecules/App Refresh Button",
    component: AppRefreshButton
};

const buttonActions = actions("onClick");

/** The default view of `AppRefreshButton`. */
export const Default = () => <AppRefreshButton {...buttonActions} />;
