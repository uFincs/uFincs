import type {Meta, StoryObj} from "@storybook/react";
import {PureComponent as ChangePasswordForm} from "./ChangePasswordForm";

const meta: Meta<typeof ChangePasswordForm> = {
    title: "Organisms/Change Password Form",
    component: ChangePasswordForm
};

export default meta;
type Story = StoryObj<typeof ChangePasswordForm>;

/** The default view of `ChangePasswordForm`. */
export const Default: Story = {};
