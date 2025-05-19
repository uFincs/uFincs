import type {Meta, StoryObj} from "@storybook/react";
import {PureComponent as ChangeEmailForm} from "./ChangeEmailForm";

const meta: Meta<typeof ChangeEmailForm> = {
    title: "Organisms/Change Email Form",
    component: ChangeEmailForm,
    args: {
        currentEmail: "test@test.com"
    }
};

export default meta;
type Story = StoryObj<typeof ChangeEmailForm>;

/** The default view of `ChangeEmailForm`. */
export const Default: Story = {};
