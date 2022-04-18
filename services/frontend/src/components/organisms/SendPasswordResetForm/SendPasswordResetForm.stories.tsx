import {actions} from "@storybook/addon-actions";
import React from "react";
import {PureComponent as SendPasswordResetForm} from "./SendPasswordResetForm";

export default {
    title: "Organisms/Send Password Reset Form",
    component: SendPasswordResetForm,
    parameters: {
        backgrounds: {
            default: "Dark"
        }
    }
};

const formActions = actions("onReturnToLogin", "onSubmit");

/** The default view of `SendPasswordResetForm`. */
export const Default = () => <SendPasswordResetForm {...formActions} />;
