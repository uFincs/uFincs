import {actions} from "@storybook/addon-actions";
import React from "react";
import {PureComponent as ChangePasswordForm} from "./ChangePasswordForm";

export default {
    title: "Organisms/Change Password Form",
    component: ChangePasswordForm
};

const formActions = actions("onSubmit");

/** The default view of `ChangePasswordForm`. */
export const Default = () => <ChangePasswordForm {...formActions} />;
