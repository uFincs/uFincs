import {actions} from "@storybook/addon-actions";
import React from "react";
import {PureComponent as DeleteUserAccountForm} from "./DeleteUserAccountForm";

export default {
    title: "Organisms/Delete User Account Form",
    component: DeleteUserAccountForm
};

const formActions = actions("onSubmit");

/** The default view of `DeleteUserAccountForm`. */
export const Default = () => <DeleteUserAccountForm {...formActions} />;
