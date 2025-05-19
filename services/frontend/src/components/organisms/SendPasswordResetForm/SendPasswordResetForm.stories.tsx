import {actions} from "@storybook/addon-actions";
import type {Meta, StoryObj} from "@storybook/react";
import {PureComponent as SendPasswordResetForm} from "./SendPasswordResetForm";

const meta: Meta<typeof SendPasswordResetForm> = {
    title: "Organisms/Send Password Reset Form",
    component: SendPasswordResetForm,
    parameters: {
        backgrounds: {
            default: "Dark"
        }
    }
};

export default meta;
type Story = StoryObj<typeof SendPasswordResetForm>;

const formActions = actions("onReturnToLogin", "onSubmit");

/** The default view of `SendPasswordResetForm`. */
export const Default: Story = {
    args: {},
    render: () => <SendPasswordResetForm {...formActions} />
};
