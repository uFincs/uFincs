import type {Meta, StoryObj} from "@storybook/react";
import {PureComponent as DeleteUserAccountForm} from "./DeleteUserAccountForm";

const meta: Meta<typeof DeleteUserAccountForm> = {
    title: "Organisms/Delete User Account Form",
    component: DeleteUserAccountForm
};

type Story = StoryObj<typeof DeleteUserAccountForm>;

/** The default view of `DeleteUserAccountForm`. */
export const Default: Story = {};

export default meta;
