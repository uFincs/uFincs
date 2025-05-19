import type {Meta, StoryObj} from "@storybook/react";
import {PureComponent as NoAccountLogoutDialog} from "./NoAccountLogoutDialog";

const meta: Meta<typeof NoAccountLogoutDialog> = {
    title: "Organisms/No Account Logout Dialog",
    component: NoAccountLogoutDialog,
    args: {
        isVisible: true
    }
};

export default meta;
type Story = StoryObj<typeof NoAccountLogoutDialog>;

/** The default view of `NoAccountLogoutDialog`. */
export const Default: Story = {};
