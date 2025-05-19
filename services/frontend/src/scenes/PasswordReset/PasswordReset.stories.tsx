import type {Meta, StoryObj} from "@storybook/react";
import PasswordReset from "./PasswordReset";

const meta: Meta<typeof PasswordReset> = {
    title: "Scenes/Password Reset",
    component: PasswordReset
};

export default meta;
type Story = StoryObj<typeof PasswordReset>;

/** The default view of `PasswordReset`. */
export const Default: Story = {};
