import {actions} from "@storybook/addon-actions";
import type {Meta, StoryObj} from "@storybook/react";
import SettingsNavigation from "./SettingsNavigation";

const meta: Meta<typeof SettingsNavigation> = {
    title: "Organisms/Settings Navigation",
    component: SettingsNavigation,
    args: {
        ...actions("onLogout", "onNoAccountSignUp")
    }
};

export default meta;
type Story = StoryObj<typeof SettingsNavigation>;

/** The desktop layout of the `SettingsNavigation`. */
export const Desktop: Story = {
    args: {
        desktopLayout: true
    }
};

/** The mobile layout of the `SettingsNavigation`. */
export const Mobile: Story = {
    args: {
        desktopLayout: false
    }
};
