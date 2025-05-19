import type {Meta, StoryObj} from "@storybook/react";
import {PureComponent as DeleteUserAccountDialog} from "./DeleteUserAccountDialog";

const meta: Meta<typeof DeleteUserAccountDialog> = {
    title: "Organisms/Delete User Account Dialog",
    component: DeleteUserAccountDialog,
    args: {
        isVisible: true
    }
};

export default meta;
type Story = StoryObj<typeof DeleteUserAccountDialog>;

/** The default view of `DeleteUserAccountDialog`. */
export const Default: Story = {
    args: {
        isVisible: true
    }
};
