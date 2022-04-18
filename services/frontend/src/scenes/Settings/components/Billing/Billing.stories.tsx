import {actions} from "@storybook/addon-actions";
import React from "react";
import {PureComponent as Billing} from "./Billing";

export default {
    title: "Scenes/Settings/Sections/Billing",
    component: Billing
};

const formActions = actions("gotoCustomerPortal");

/** The default view of `Billing`. */
export const Default = () => <Billing {...formActions} />;
