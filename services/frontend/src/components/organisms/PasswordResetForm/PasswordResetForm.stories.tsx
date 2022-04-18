import {actions} from "@storybook/addon-actions";
import React from "react";
import {PureComponent as PasswordResetForm} from "./PasswordResetForm";

export default {
    title: "Organisms/Password Reset Form",
    component: PasswordResetForm,
    parameters: {
        backgrounds: {
            default: "Dark"
        }
    }
};

const formActions = actions("onSubmit");

/** The default view of `PasswordResetForm`. */
export const Default = () => <PasswordResetForm {...formActions} />;
