import type {Meta, StoryObj} from "@storybook/react";
import {PureComponent as PasswordResetDialog} from "./PasswordResetDialog";

const meta: Meta<typeof PasswordResetDialog> = {
    title: "Organisms/Password Reset Dialog",
    component: PasswordResetDialog,
    args: {
        isVisible: true
    }
};

export default meta;
type Story = StoryObj<typeof PasswordResetDialog>;

/** The default view of `PasswordResetDialog`. */
export const Default: Story = {};
