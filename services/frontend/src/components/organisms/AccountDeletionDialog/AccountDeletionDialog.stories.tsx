import type {Meta, StoryObj} from "@storybook/react";
import {PureComponent as AccountDeletionDialog} from "./AccountDeletionDialog";

const meta: Meta<typeof AccountDeletionDialog> = {
    title: "Organisms/Account Deletion Dialog",
    component: AccountDeletionDialog,
    args: {
        isVisible: true
    }
};

export default meta;
type Story = StoryObj<typeof AccountDeletionDialog>;

/** The default view of the `AccountDeletionDialog`. */
export const Default: Story = {};
