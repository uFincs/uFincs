import type {Meta, StoryObj} from "@storybook/react";
import SendPasswordReset from "./SendPasswordReset";

const meta: Meta<typeof SendPasswordReset> = {
    title: "Scenes/Send Password Reset",
    component: SendPasswordReset
};

export default meta;
type Story = StoryObj<typeof SendPasswordReset>;

/** The default view of `SendPasswordReset`. */
export const Default: Story = {
    args: {}
};
