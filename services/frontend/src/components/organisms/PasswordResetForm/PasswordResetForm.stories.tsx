import type {Meta, StoryObj} from "@storybook/react";
import {PureComponent as PasswordResetForm} from "./PasswordResetForm";

const meta: Meta<typeof PasswordResetForm> = {
    title: "Organisms/Password Reset Form",
    component: PasswordResetForm,
    parameters: {
        backgrounds: {
            default: "Dark"
        }
    }
};

export default meta;
type Story = StoryObj<typeof PasswordResetForm>;

/** The default view of `PasswordResetForm`. */
export const Default: Story = {};
