import {actions} from "@storybook/addon-actions";
import {text} from "@storybook/addon-knobs";
import React from "react";
import {PureComponent as ChangeEmailForm} from "./ChangeEmailForm";

export default {
    title: "Organisms/Change Email Form",
    component: ChangeEmailForm
};

const formActions = actions("onSubmit");
const email = () => text("Email", "test@test.com");

/** The default view of `ChangeEmailForm`. */
export const Default = () => <ChangeEmailForm currentEmail={email()} {...formActions} />;
